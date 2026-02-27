import { getApiUrl } from './config';
import { useUserStore } from '../store/user.store';

export interface CreatePostBody {
  title?: string;
  content: string;
  category: string;
  visibility?: string;
  societyId?: string | null;
}

export class ContentBlockedError extends Error {
  constructor(
    message: string,
    public sanitizedTitle: string,
    public sanitizedContent: string,
  ) {
    super(message);
    this.name = 'ContentBlockedError';
  }
}

export async function createPost(body: CreatePostBody): Promise<{ id: string }> {
  const baseUrl = await getApiUrl();
  const state = useUserStore.getState();
  const token = state.token;
  
  if (!token) {
    throw new Error('You must be signed in to post. Please log in and try again.');
  }

  if (!state.isAuthenticated) {
    throw new Error('Your session has expired. Please log in again.');
  }

  try {
    const res = await fetch(`${baseUrl}/api/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: body.title?.trim() || '',
        content: body.content.trim(),
        category: body.category,
        visibility: body.visibility ?? 'public',
        societyId: body.societyId ?? null,
      }),
    });

    // Handle empty responses (204 No Content from preflight or other)
    if (res.status === 204) {
      throw new Error('Server returned no content. Please check your connection and try again.');
    }

    // Try to parse JSON, but handle empty responses
    let data: any = {};
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await res.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        // If JSON parsing fails, data stays as {}
      }
    }

    if (!res.ok) {
      // Handle 401 Unauthorized specifically
      if (res.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Handle 400 errors
      if (res.status === 400) {
        // Log the actual error for debugging
        console.error('[createPost] 400 Error:', data);
        
        // If it's a moderation error with sanitized content
        if (data?.sanitizedTitle !== undefined && data?.sanitizedContent !== undefined) {
          throw new ContentBlockedError(data.error || 'Content not allowed', data.sanitizedTitle, data.sanitizedContent);
        }
        
        // Other 400 errors (validation, invalid societyId, etc.)
        const errorMsg = data?.error || 'Invalid request. Please check your input.';
        throw new Error(errorMsg);
      }
      
      // Generic error with server message or status
      const errorMsg = data?.error || `Failed to create post (${res.status})`;
      throw new Error(errorMsg);
    }

    if (!data?.id) {
      throw new Error('Invalid response from server. Please try again.');
    }

    return { id: data.id };
  } catch (error: any) {
    // Re-throw ContentBlockedError as-is
    if (error instanceof ContentBlockedError) {
      throw error;
    }
    
    // Handle network errors
    if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))) {
      throw new Error('Cannot reach server. Check your connection and backend URL.');
    }
    
    // Re-throw other errors
    throw error;
  }
}
