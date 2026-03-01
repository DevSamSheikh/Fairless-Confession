import { realtimeService } from './realtimeService';
import { useUserStore } from '../store/user.store';

// Initialize real-time service when app starts
export const initializeRealtime = () => {
  // Get WebSocket URL from environment or use default
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
  
  // Connect to WebSocket
  realtimeService.connect(wsUrl);
  
  // Handle connection events
  realtimeService.on('connected', () => {
    console.log('Real-time service connected');
  });
  
  realtimeService.on('disconnected', () => {
    console.log('Real-time service disconnected');
  });
  
  realtimeService.on('error', (error) => {
    console.error('Real-time service error:', error);
  });
};

// Authenticate user with real-time service
export const authenticateRealtime = (userId: string) => {
  realtimeService.send('authenticate', { userId });
};

// Subscribe to post updates
export const subscribeToPost = (postId: string) => {
  realtimeService.send('subscribe_post', postId);
};

// Unsubscribe from post updates
export const unsubscribeFromPost = (postId: string) => {
  realtimeService.send('unsubscribe_post', postId);
};
