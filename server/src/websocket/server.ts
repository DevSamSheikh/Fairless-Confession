import { Server } from 'socket.io';
import { createServer } from 'http';
import { RealtimeEvent } from '../../../app/services/realtimeService';

interface Client {
  id: string;
  userId?: string;
  socket: any;
}

class WebSocketServer {
  private io: Server;
  private clients: Map<string, Client> = new Map();
  private postSubscribers: Map<string, Set<string>> = new Map(); // postId -> Set of clientIds

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Add client to registry
      const client: Client = {
        id: socket.id,
        socket: socket
      };
      this.clients.set(socket.id, client);

      // Handle client authentication
      socket.on('authenticate', (data: { userId: string }) => {
        console.log('Client authenticated:', socket.id, 'for user:', data.userId);
        client.userId = data.userId;
      });

      // Handle post subscriptions
      socket.on('subscribe_post', (postId: string) => {
        console.log('Client subscribed to post:', postId);
        if (!this.postSubscribers.has(postId)) {
          this.postSubscribers.set(postId, new Set());
        }
        this.postSubscribers.get(postId)!.add(socket.id);
      });

      socket.on('unsubscribe_post', (postId: string) => {
        console.log('Client unsubscribed from post:', postId);
        const subscribers = this.postSubscribers.get(postId);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.postSubscribers.delete(postId);
          }
        }
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.clients.delete(socket.id);
        
        // Clean up post subscriptions
        for (const [postId, subscribers] of this.postSubscribers.entries()) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.postSubscribers.delete(postId);
          }
        }
      });
    });
  }

  // Broadcast new post to all clients
  broadcastNewPost(postData: any) {
    const event = {
      type: RealtimeEvent.NEW_POST,
      data: {
        postId: postData.id,
        title: postData.title,
        content: postData.content,
        author: postData.author || 'Anonymous',
        category: postData.category,
        createdAt: postData.created_at,
        societyName: postData.society_name
      }
    };

    this.io.emit(RealtimeEvent.NEW_POST, event.data);
    console.log('Broadcasted new post to all clients');
  }

  // Broadcast reaction update to specific post subscribers
  broadcastPostReaction(postId: string, reactionType: string, totalReactions: number, userId?: string) {
    const event = {
      type: RealtimeEvent.POST_REACTION,
      data: {
        postId,
        reactionType,
        totalReactions,
        userId
      }
    };

    // Send to clients subscribed to this post
    const subscribers = this.postSubscribers.get(postId);
    if (subscribers) {
      for (const clientId of subscribers) {
        const client = this.clients.get(clientId);
        if (client) {
          client.socket.emit(RealtimeEvent.POST_REACTION, event.data);
        }
      }
    }

    // Also broadcast to all clients for general feed updates
    this.io.emit(RealtimeEvent.POST_REACTION, event.data);
    console.log('Broadcasted reaction update for post:', postId);
  }

  // Broadcast comment update
  broadcastPostComment(postId: string, commentId: string, commentCount: number, userId?: string) {
    const event = {
      type: RealtimeEvent.POST_COMMENT,
      data: {
        postId,
        commentId,
        commentCount,
        userId
      }
    };

    // Send to clients subscribed to this post
    const subscribers = this.postSubscribers.get(postId);
    if (subscribers) {
      for (const clientId of subscribers) {
        const client = this.clients.get(clientId);
        if (client) {
          client.socket.emit(RealtimeEvent.POST_COMMENT, event.data);
        }
      }
    }

    // Also broadcast to all clients for general feed updates
    this.io.emit(RealtimeEvent.POST_COMMENT, event.data);
    console.log('Broadcasted comment update for post:', postId);
  }

  // Broadcast post deletion
  broadcastPostDeleted(postId: string) {
    const event = {
      type: RealtimeEvent.POST_DELETED,
      data: { postId }
    };

    this.io.emit(RealtimeEvent.POST_DELETED, event.data);
    console.log('Broadcasted post deletion:', postId);
  }

  // Broadcast user stats update
  broadcastUserStatsUpdate(userId: string, stats: any) {
    const event = {
      type: RealtimeEvent.USER_STATS_UPDATE,
      data: {
        userId,
        ...stats
      }
    };

    // Send to specific user if they're connected
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        client.socket.emit(RealtimeEvent.USER_STATS_UPDATE, event.data);
        break;
      }
    }

    console.log('Broadcasted user stats update for user:', userId);
  }

  // Broadcast trending update
  broadcastTrendingUpdate(postId: string, engagementScore: number, rank?: number) {
    const event = {
      type: RealtimeEvent.TRENDING_UPDATE,
      data: {
        postId,
        engagementScore,
        rank
      }
    };

    this.io.emit(RealtimeEvent.TRENDING_UPDATE, event.data);
    console.log('Broadcasted trending update for post:', postId);
  }

  // Get server stats
  getStats() {
    return {
      connectedClients: this.clients.size,
      postSubscriptions: this.postSubscribers.size,
      totalSubscriptions: Array.from(this.postSubscribers.values()).reduce((total, set) => total + set.size, 0)
    };
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export const initializeWebSocket = (server: any) => {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
    console.log('WebSocket server initialized');
  }
  return wsServer;
};

export const getWebSocketServer = () => {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
};
