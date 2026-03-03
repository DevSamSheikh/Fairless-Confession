// Auth Error Handler - Prevents machine gun errors
import { useUserStore } from '../store/user.store';
import { showSuccessToast, showErrorToast } from './toast';

// Global flag to prevent multiple logout attempts
let isLoggingOut = false;
let authErrorCallbacks: (() => void)[] = [];

export function addAuthErrorCallback(callback: () => void): void {
  authErrorCallbacks.push(callback);
}

export function removeAuthErrorCallback(callback: () => void): void {
  authErrorCallbacks = authErrorCallbacks.filter(cb => cb !== callback);
}

export async function handleAuthError(error: any): Promise<boolean> {
  // Check if this is an auth error
  if (isUnauthorizedError(error)) {
    // Prevent multiple logout attempts
    if (isLoggingOut) {
      return false;
    }
    
    isLoggingOut = true;
    
    try {
      console.log('Auth error detected, logging out user...');
      
      // Show user-friendly message
      showErrorToast('Session expired. Please log in again.');
      
      // Notify all callbacks (e.g., set flags in screens)
      authErrorCallbacks.forEach(callback => {
        try {
          callback();
        } catch (callbackError) {
          console.error('Error in auth error callback:', callbackError);
        }
      });
      
      // Logout user
      const { logout } = useUserStore.getState();
      await logout();
      
      // Navigate to login screen (this will be handled by the auth guard)
      console.log('User logged out successfully');
      
      return true;
    } catch (logoutError) {
      console.error('Error during logout:', logoutError);
      return false;
    } finally {
      isLoggingOut = false;
    }
  }
  
  return false;
}

function isUnauthorizedError(error: any): boolean {
  // Check for various unauthorized error patterns
  if (error?.message?.includes('Unauthorized')) return true;
  if (error?.message?.includes('Invalid or expired token')) return true;
  if (error?.message?.includes('Please log in again')) return true;
  if (error?.status === 401) return true;
  if (error?.response?.status === 401) return true;
  
  // Check if error object contains unauthorized response data
  if (error?.error?.includes('Unauthorized')) return true;
  if (error?.error?.includes('expired')) return true;
  
  return false;
}

// Enhanced apiFetch with auth error handling
export async function apiFetchWithAuthHandling(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  try {
    // Import here to avoid circular dependency
    const { apiFetch } = await import('../api/client');
    
    const response = await apiFetch(path, options);
    
    // Check for 401 status even if response is ok
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData?.error || 'Unauthorized');
      (error as any).status = 401;
      (error as any).response = response;
      
      await handleAuthError(error);
      throw error;
    }
    
    return response;
  } catch (error) {
    // Handle auth errors
    const wasHandled = await handleAuthError(error);
    if (wasHandled) {
      // Re-throw the error so calling code knows the request failed
      throw error;
    }
    
    // For non-auth errors, just throw normally
    throw error;
  }
}

// Reset logout flag (useful for testing)
export function resetLogoutFlag(): void {
  isLoggingOut = false;
}
