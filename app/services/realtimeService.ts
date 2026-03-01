// Custom Event Emitter for React Native
class ReactNativeEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Real-time event types
export enum RealtimeEvent {
  NEW_POST = 'new_post',
  POST_REACTION = 'post_reaction',
  POST_COMMENT = 'post_comment',
  POST_DELETED = 'post_deleted',
  USER_STATS_UPDATE = 'user_stats_update',
  TRENDING_UPDATE = 'trending_update',
}

// Event data interfaces
export interface NewPostEvent {
  postId: string;
  title?: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
}

export interface PostReactionEvent {
  postId: string;
  reactionType: string;
  totalReactions: number;
  userId?: string;
}

export interface PostCommentEvent {
  postId: string;
  commentId: string;
  commentCount: number;
  userId?: string;
}

export interface UserStatsEvent {
  userId: string;
  confessions: number;
  reactions: number;
  comments: number;
}

export interface TrendingUpdateEvent {
  postId: string;
  engagementScore: number;
  rank?: number;
}

class RealtimeService extends ReactNativeEventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private heartbeatInterval: number | null = null;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  // Connect to WebSocket server
  async connect(url: string = 'ws://localhost:8080/ws') {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    
    try {
      console.log('Connecting to WebSocket:', url);
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Send message to server
  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data, timestamp: Date.now() });
      this.ws.send(message);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Handle incoming messages
  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      const { type, data: eventData } = message;

      switch (type) {
        case RealtimeEvent.NEW_POST:
          this.emit(RealtimeEvent.NEW_POST, eventData as NewPostEvent);
          break;
        case RealtimeEvent.POST_REACTION:
          this.emit(RealtimeEvent.POST_REACTION, eventData as PostReactionEvent);
          break;
        case RealtimeEvent.POST_COMMENT:
          this.emit(RealtimeEvent.POST_COMMENT, eventData as PostCommentEvent);
          break;
        case RealtimeEvent.POST_DELETED:
          this.emit(RealtimeEvent.POST_DELETED, eventData);
          break;
        case RealtimeEvent.USER_STATS_UPDATE:
          this.emit(RealtimeEvent.USER_STATS_UPDATE, eventData as UserStatsEvent);
          break;
        case RealtimeEvent.TRENDING_UPDATE:
          this.emit(RealtimeEvent.TRENDING_UPDATE, eventData as TrendingUpdateEvent);
          break;
        default:
          console.warn('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  // Handle reconnection logic
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts + 1})`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', {});
    }, 30000) as unknown as number; // Send ping every 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Setup event handlers for cleanup
  private setupEventHandlers() {
    // React Native doesn't have process exit events
    // Cleanup will be handled by component unmount
  }

  // Get connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

// Hook for using realtime service in components
export const useRealtimeService = () => {
  return realtimeService;
};
