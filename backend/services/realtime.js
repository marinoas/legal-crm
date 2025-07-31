const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const { promisify } = require('util');

// Redis client for pub/sub
const publisher = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const subscriber = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Promisify Redis commands
const publishAsync = promisify(publisher.publish).bind(publisher);

class RealtimeService {
  constructor() {
    this.io = null;
    this.users = new Map(); // userId -> Set of socket IDs
    this.sockets = new Map(); // socketId -> user data
    this.rooms = new Map(); // roomName -> Set of socket IDs
    this.presence = new Map(); // userId -> presence data
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
      },
      pingTimeout: 60000,
      transports: ['websocket', 'polling']
    });

    // Redis subscription
    subscriber.on('message', this.handleRedisMessage.bind(this));
    subscriber.subscribe('legal-crm-updates');

    // Socket middleware for authentication
    this.io.use(this.authenticateSocket.bind(this));

    // Connection handling
    this.io.on('connection', this.handleConnection.bind(this));

    console.log('Realtime service initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  }

  handleConnection(socket) {
    const userId = socket.userId;
    console.log(`User ${userId} connected (${socket.id})`);

    // Track user sockets
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set());
    }
    this.users.get(userId).add(socket.id);
    this.sockets.set(socket.id, socket.user);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // Update presence
    this.updatePresence(userId, 'online');

    // Event handlers
    socket.on('join:case', (caseId) => this.joinCase(socket, caseId));
    socket.on('leave:case', (caseId) => this.leaveCase(socket, caseId));
    socket.on('join:client', (clientId) => this.joinClient(socket, clientId));
    socket.on('leave:client', (clientId) => this.leaveClient(socket, clientId));
    
    // Collaboration events
    socket.on('document:lock', (data) => this.lockDocument(socket, data));
    socket.on('document:unlock', (data) => this.unlockDocument(socket, data));
    socket.on('document:change', (data) => this.broadcastDocumentChange(socket, data));
    
    // Typing indicators
    socket.on('typing:start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing:stop', (data) => this.handleTypingStop(socket, data));
    
    // Presence
    socket.on('presence:update', (status) => this.updatePresence(userId, status));
    socket.on('presence:get', (userIds) => this.getPresence(socket, userIds));
    
    // Notifications
    socket.on('notification:read', (notificationId) => this.markNotificationRead(socket, notificationId));
    
    // Disconnection
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  handleDisconnect(socket) {
    const userId = socket.userId;
    console.log(`User ${userId} disconnected (${socket.id})`);

    // Remove socket tracking
    const userSockets = this.users.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.users.delete(userId);
        this.updatePresence(userId, 'offline');
      }
    }
    this.sockets.delete(socket.id);

    // Leave all rooms
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        this.broadcastToRoom(room, 'user:left', {
          userId,
          room
        });
      }
    }
  }

  // Room Management
  async joinCase(socket, caseId) {
    const room = `case:${caseId}`;
    socket.join(room);
    
    // Notify others in the room
    socket.to(room).emit('user:joined:case', {
      userId: socket.userId,
      caseId,
      user: socket.user
    });

    // Send current users in room
    const users = await this.getRoomUsers(room);
    socket.emit('case:users', { caseId, users });
  }

  async leaveCase(socket, caseId) {
    const room = `case:${caseId}`;
    socket.leave(room);
    
    socket.to(room).emit('user:left:case', {
      userId: socket.userId,
      caseId
    });
  }

  async joinClient(socket, clientId) {
    const room = `client:${clientId}`;
    socket.join(room);
    
    socket.to(room).emit('user:joined:client', {
      userId: socket.userId,
      clientId,
      user: socket.user
    });
  }

  async leaveClient(socket, clientId) {
    const room = `client:${clientId}`;
    socket.leave(room);
    
    socket.to(room).emit('user:left:client', {
      userId: socket.userId,
      clientId
    });
  }

  // Document Collaboration
  async lockDocument(socket, { documentId, sectionId }) {
    const lockKey = sectionId ? `${documentId}:${sectionId}` : documentId;
    const room = `document:${documentId}`;
    
    // Check if already locked
    const currentLock = await this.getDocumentLock(lockKey);
    if (currentLock && currentLock.userId !== socket.userId) {
      socket.emit('document:lock:failed', {
        documentId,
        sectionId,
        lockedBy: currentLock
      });
      return;
    }

    // Set lock
    await this.setDocumentLock(lockKey, {
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date()
    });

    // Notify others
    socket.to(room).emit('document:locked', {
      documentId,
      sectionId,
      lockedBy: socket.user
    });

    socket.emit('document:lock:success', { documentId, sectionId });
  }

  async unlockDocument(socket, { documentId, sectionId }) {
    const lockKey = sectionId ? `${documentId}:${sectionId}` : documentId;
    const room = `document:${documentId}`;
    
    // Remove lock
    await this.removeDocumentLock(lockKey);

    // Notify others
    socket.to(room).emit('document:unlocked', {
      documentId,
      sectionId,
      unlockedBy: socket.user
    });
  }

  async broadcastDocumentChange(socket, data) {
    const room = `document:${data.documentId}`;
    
    // Add user info
    data.userId = socket.userId;
    data.user = socket.user;
    data.timestamp = new Date();

    // Broadcast to others in the document room
    socket.to(room).emit('document:changed', data);

    // Store change for offline users
    await this.storeDocumentChange(data);
  }

  // Typing Indicators
  handleTypingStart(socket, { room, field }) {
    socket.to(room).emit('user:typing', {
      userId: socket.userId,
      user: socket.user,
      field,
      isTyping: true
    });
  }

  handleTypingStop(socket, { room, field }) {
    socket.to(room).emit('user:typing', {
      userId: socket.userId,
      user: socket.user,
      field,
      isTyping: false
    });
  }

  // Presence Management
  async updatePresence(userId, status) {
    const presence = {
      status,
      lastSeen: new Date(),
      device: 'web' // Could be enhanced to detect device
    };

    this.presence.set(userId, presence);

    // Broadcast presence update
    this.broadcastToUser(userId, 'presence:updated', presence);
    
    // Notify contacts
    const contacts = await this.getUserContacts(userId);
    for (const contactId of contacts) {
      this.broadcastToUser(contactId, 'contact:presence', {
        userId,
        presence
      });
    }
  }

  async getPresence(socket, userIds) {
    const presenceData = {};
    
    for (const userId of userIds) {
      presenceData[userId] = this.presence.get(userId) || {
        status: 'offline',
        lastSeen: null
      };
    }

    socket.emit('presence:data', presenceData);
  }

  // Notification System
  async sendNotification(userId, notification) {
    // Store in database
    const stored = await Notification.create({
      user: userId,
      ...notification
    });

    // Send real-time notification
    this.broadcastToUser(userId, 'notification:new', stored);

    // Send push notification if enabled
    if (notification.priority === 'high') {
      await this.sendPushNotification(userId, notification);
    }
  }

  async markNotificationRead(socket, notificationId) {
    await Notification.findByIdAndUpdate(notificationId, {
      read: true,
      readAt: new Date()
    });

    socket.emit('notification:read:success', { notificationId });
  }

  // Broadcasting Methods
  broadcastToUser(userId, event, data) {
    const userSockets = this.users.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  broadcastToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  async broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // Redis Message Handling (for multi-server setup)
  async handleRedisMessage(channel, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'court:updated':
          this.broadcastToRoom(`case:${data.caseId}`, 'court:updated', data.court);
          break;
          
        case 'deadline:created':
          this.broadcastToUser(data.userId, 'deadline:created', data.deadline);
          break;
          
        case 'document:uploaded':
          this.broadcastToRoom(`client:${data.clientId}`, 'document:uploaded', data.document);
          break;
          
        case 'appointment:scheduled':
          this.broadcastToUser(data.lawyerId, 'appointment:scheduled', data.appointment);
          this.broadcastToUser(data.clientId, 'appointment:scheduled', data.appointment);
          break;
          
        case 'system:announcement':
          this.broadcastToAll('system:announcement', data.announcement);
          break;
      }
    } catch (error) {
      console.error('Redis message handling error:', error);
    }
  }

  // Emit Events (to be called from other services)
  async emitCourtUpdate(court) {
    const data = {
      type: 'court:updated',
      caseId: court._id,
      court: court
    };
    await publishAsync('legal-crm-updates', JSON.stringify(data));
  }

  async emitDeadlineCreated(deadline) {
    const data = {
      type: 'deadline:created',
      userId: deadline.user,
      deadline: deadline
    };
    await publishAsync('legal-crm-updates', JSON.stringify(data));
  }

  async emitDocumentUploaded(document) {
    const data = {
      type: 'document:uploaded',
      clientId: document.client,
      document: document
    };
    await publishAsync('legal-crm-updates', JSON.stringify(data));
  }

  async emitAppointmentScheduled(appointment) {
    const data = {
      type: 'appointment:scheduled',
      lawyerId: appointment.user,
      clientId: appointment.client,
      appointment: appointment
    };
    await publishAsync('legal-crm-updates', JSON.stringify(data));
  }

  async emitSystemAnnouncement(announcement) {
    const data = {
      type: 'system:announcement',
      announcement: announcement
    };
    await publishAsync('legal-crm-updates', JSON.stringify(data));
  }

  // Helper Methods
  async getRoomUsers(room) {
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(socket => ({
      userId: socket.userId,
      user: this.sockets.get(socket.id)
    }));
  }

  async getUserContacts(userId) {
    // This would fetch from database
    // Simplified for now
    return [];
  }

  async getDocumentLock(lockKey) {
    // Would use Redis for distributed locking
    // Simplified for now
    return null;
  }

  async setDocumentLock(lockKey, lockData) {
    // Would use Redis with TTL
    // Simplified for now
  }

  async removeDocumentLock(lockKey) {
    // Would use Redis
    // Simplified for now
  }

  async storeDocumentChange(change) {
    // Would store in database for offline sync
    // Simplified for now
  }

  async sendPushNotification(userId, notification) {
    // Would integrate with push notification service
    // Simplified for now
  }

  // Analytics
  getConnectionStats() {
    return {
      totalConnections: this.sockets.size,
      uniqueUsers: this.users.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()).filter(r => !this.sockets.has(r)),
      presence: Array.from(this.presence.entries()).map(([userId, data]) => ({
        userId,
        ...data
      }))
    };
  }
}

// Export singleton instance
const realtimeService = new RealtimeService();
module.exports = realtimeService;
