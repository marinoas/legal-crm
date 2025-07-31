const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'court_reminder',
      'deadline_reminder',
      'appointment_reminder',
      'payment_received',
      'payment_due',
      'document_uploaded',
      'document_signed',
      'client_message',
      'system_announcement',
      'task_assigned',
      'court_update',
      'birthday_reminder'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionUrl: String,
  actionText: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  relatedModel: {
    type: String,
    enum: ['Court', 'Deadline', 'Appointment', 'Client', 'Document', 'Financial']
  },
  relatedId: mongoose.Schema.ObjectId,
  expiresAt: Date,
  channels: [{
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: ['in-app']
  }],
  sentChannels: [{
    channel: String,
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    },
    error: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for age
NotificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Method to mark as read
NotificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to send notification
NotificationSchema.methods.send = async function() {
  const sendEmail = require('../utils/sendEmail');
  const sendSMS = require('../utils/sendSMS');
  const realtimeService = require('../services/realtime');

  for (const channel of this.channels) {
    const channelStatus = {
      channel,
      sentAt: new Date(),
      status: 'pending'
    };

    try {
      switch (channel) {
        case 'in-app':
          // Send via WebSocket
          await realtimeService.sendNotification(this.user, this);
          channelStatus.status = 'sent';
          break;

        case 'email':
          const user = await mongoose.model('User').findById(this.user);
          if (user && user.email) {
            await sendEmail({
              email: user.email,
              subject: this.title,
              message: this.message
            });
            channelStatus.status = 'sent';
          }
          break;

        case 'sms':
          const userSMS = await mongoose.model('User').findById(this.user);
          if (userSMS && userSMS.mobile) {
            await sendSMS({
              to: userSMS.mobile,
              body: `${this.title}: ${this.message.substring(0, 140)}`
            });
            channelStatus.status = 'sent';
          }
          break;

        case 'push':
          // TODO: Implement push notifications
          console.log('Push notifications not yet implemented');
          break;
      }
    } catch (error) {
      channelStatus.status = 'failed';
      channelStatus.error = error.message;
    }

    this.sentChannels.push(channelStatus);
  }

  return this.save();
};

// Static method to create and send notification
NotificationSchema.statics.createAndSend = async function(data) {
  const notification = await this.create(data);
  await notification.send();
  return notification;
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

// Static method to mark multiple as read
NotificationSchema.statics.markManyAsRead = async function(userId, notificationIds) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      user: userId
    },
    {
      read: true,
      readAt: new Date()
    }
  );
};

// Static method to cleanup old notifications
NotificationSchema.statics.cleanup = async function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    read: true,
    readAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);