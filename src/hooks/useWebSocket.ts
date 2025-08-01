// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: string;
  id?: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * Hook για διαχείριση WebSocket connection
 */
export function useWebSocket(
  url?: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const { token } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Construct WebSocket URL με authentication
  const getWebSocketUrl = useCallback(() => {
    if (!url) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseUrl = process.env.REACT_APP_WS_URL || 
        `${wsProtocol}//${window.location.hostname}:5000`;
      return `${baseUrl}/ws?token=${token}`;
    }
    return `${url}?token=${token}`;
  }, [url, token]);

  // Heartbeat για να κρατάμε το connection ζωντανό
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' });
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Send message
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageWithDefaults = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        id: message.id || `${Date.now()}-${Math.random()}`,
      };
      
      socketRef.current.send(JSON.stringify(messageWithDefaults));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();
    reconnectCountRef.current = 0;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, [stopHeartbeat]);

  // Connect
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    if (!token) {
      console.warn('No authentication token available');
      return;
    }

    setIsConnecting(true);

    try {
      const ws = new WebSocket(getWebSocketUrl());
      socketRef.current = ws;
      setSocket(ws);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectCountRef.current = 0;
        startHeartbeat();
        onOpen?.();
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event);
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();
        onClose?.(event);

        // Auto-reconnect αν χρειάζεται
        if (
          reconnect &&
          reconnectCountRef.current < reconnectAttempts &&
          !event.wasClean
        ) {
          reconnectCountRef.current++;
          console.log(`Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error', error);
        setIsConnecting(false);
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Ignore pong messages
          if (message.type === 'pong') {
            return;
          }
          
          setLastMessage(message);
          onMessage?.(message);

          // Handle specific message types
          handleSystemMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket', error);
      setIsConnecting(false);
    }
  }, [
    token,
    getWebSocketUrl,
    reconnect,
    reconnectAttempts,
    reconnectInterval,
    startHeartbeat,
    stopHeartbeat,
    onOpen,
    onClose,
    onError,
    onMessage,
  ]);

  // Handle system messages
  const handleSystemMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'notification':
        // Handle system notifications
        console.log('System notification:', message.payload);
        break;
        
      case 'update':
        // Handle real-time updates
        console.log('Real-time update:', message.payload);
        break;
        
      case 'error':
        // Handle error messages
        console.error('WebSocket error message:', message.payload);
        break;
        
      default:
        // Custom message handling
        break;
    }
  }, []);

  // Manual reconnect
  const reconnectManual = useCallback(() => {
    disconnect();
    reconnectCountRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token]); // Εσκεμμένα παραλείπουμε connect/disconnect

  return {
    socket,
    isConnected,
    isConnecting,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnect: reconnectManual,
  };
}

// Hook για subscriptions σε συγκεκριμένα message types
export function useWebSocketSubscription(
  messageType: string | string[],
  callback: (message: WebSocketMessage) => void
) {
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (!lastMessage) return;

    const types = Array.isArray(messageType) ? messageType : [messageType];
    
    if (types.includes(lastMessage.type)) {
      callback(lastMessage);
    }
  }, [lastMessage, messageType, callback]);
}

// Hook για real-time updates σε entities
export function useRealtimeUpdates<T>(
  entityType: string,
  entityId?: string
): T | null {
  const [data, setData] = useState<T | null>(null);

  useWebSocketSubscription(
    [`${entityType}:created`, `${entityType}:updated`, `${entityType}:deleted`],
    (message) => {
      if (!entityId || message.payload?.id === entityId) {
        switch (message.type) {
          case `${entityType}:created`:
          case `${entityType}:updated`:
            setData(message.payload);
            break;
          case `${entityType}:deleted`:
            if (message.payload?.id === entityId) {
              setData(null);
            }
            break;
        }
      }
    }
  );

  return data;
}

// Message types για το Legal CRM
export const WS_MESSAGE_TYPES = {
  // System
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
  NOTIFICATION: 'notification',
  
  // Courts
  COURT_CREATED: 'court:created',
  COURT_UPDATED: 'court:updated',
  COURT_DELETED: 'court:deleted',
  COURT_STATUS_CHANGED: 'court:statusChanged',
  
  // Deadlines
  DEADLINE_CREATED: 'deadline:created',
  DEADLINE_UPDATED: 'deadline:updated',
  DEADLINE_COMPLETED: 'deadline:completed',
  DEADLINE_EXTENDED: 'deadline:extended',
  DEADLINE_REMINDER: 'deadline:reminder',
  
  // Appointments
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_UPDATED: 'appointment:updated',
  APPOINTMENT_CANCELLED: 'appointment:cancelled',
  APPOINTMENT_REMINDER: 'appointment:reminder',
  
  // Financial
  PAYMENT_RECEIVED: 'payment:received',
  INVOICE_CREATED: 'invoice:created',
  INVOICE_PAID: 'invoice:paid',
  
  // Documents
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_DELETED: 'document:deleted',
  
  // Communications
  EMAIL_SENT: 'email:sent',
  SMS_SENT: 'sms:sent',
  
  // User activity
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
};
