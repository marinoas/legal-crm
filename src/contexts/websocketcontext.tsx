import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSnackbar } from 'notistack';

// Types
interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (event: string, handler: (data: any) => void) => void;
  unsubscribe: (event: string, handler: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  data?: any;
}

// Create Context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// WebSocket URL
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

// Provider Component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const socketInstance = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Join user-specific room
      socketInstance.emit('join:user', user._id);
      
      // Join role-specific room
      socketInstance.emit('join:role', user.role);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Notification handler
    socketInstance.on('notification', (data: NotificationData) => {
      enqueueSnackbar(data.message, {
        variant: data.type,
        preventDuplicate: true,
      });
    });

    // Real-time updates handlers
    socketInstance.on('court:updated', (data) => {
      // Trigger React Query refetch or update cache
      window.dispatchEvent(new CustomEvent('court-updated', { detail: data }));
    });

    socketInstance.on('deadline:updated', (data) => {
      window.dispatchEvent(new CustomEvent('deadline-updated', { detail: data }));
    });

    socketInstance.on('appointment:updated', (data) => {
      window.dispatchEvent(new CustomEvent('appointment-updated', { detail: data }));
    });

    socketInstance.on('client:updated', (data) => {
      window.dispatchEvent(new CustomEvent('client-updated', { detail: data }));
    });

    // Document upload notification
    socketInstance.on('document:uploaded', (data) => {
      enqueueSnackbar(`Νέο έγγραφο: ${data.fileName}`, {
        variant: 'info',
        action: (
          <button
            onClick={() => window.open(`/documents/${data.documentId}`, '_blank')}
            style={{
              color: 'white',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Άνοιγμα
          </button>
        ),
      });
    });

    // Deadline reminder
    socketInstance.on('deadline:reminder', (data) => {
      enqueueSnackbar(
        `Υπενθύμιση προθεσμίας: ${data.title} - ${data.daysRemaining} ημέρες`,
        {
          variant: 'warning',
          persist: true,
        }
      );
    });

    // Court reminder
    socketInstance.on('court:reminder', (data) => {
      enqueueSnackbar(
        `Δικαστήριο ${data.date}: ${data.client} - ${data.court}`,
        {
          variant: 'warning',
          persist: true,
        }
      );
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      socketInstance.disconnect();
    };
  }, [user, enqueueSnackbar]);

  // Subscribe to events
  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (socket) {
      socket.on(event, handler);
    }
  }, [socket]);

  // Unsubscribe from events
  const unsubscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (socket) {
      socket.off(event, handler);
    }
  }, [socket]);

  // Emit events
  const emit = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, [socket, isConnected]);

  // Join room
  const joinRoom = useCallback((room: string) => {
    if (socket && isConnected) {
      socket.emit('join:room', room);
    }
  }, [socket, isConnected]);

  // Leave room
  const leaveRoom = useCallback((room: string) => {
    if (socket && isConnected) {
      socket.emit('leave:room', room);
    }
  }, [socket, isConnected]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    subscribe,
    unsubscribe,
    emit,
    joinRoom,
    leaveRoom,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
