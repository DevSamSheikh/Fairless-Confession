import { getApiUrl } from './config';

export async function checkBackendHealth(): Promise<{ 
  isHealthy: boolean; 
  message: string; 
  url: string;
}> {
  try {
    const baseUrl = await getApiUrl();
    console.log(`[checkBackendHealth] Testing backend at: ${baseUrl}`);
    
    // Try to reach a simple health endpoint or the base API
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (res.ok) {
      return {
        isHealthy: true,
        message: 'Backend is healthy and responding',
        url: baseUrl,
      };
    } else {
      return {
        isHealthy: false,
        message: `Backend responded with status ${res.status}`,
        url: baseUrl,
      };
    }
  } catch (error: any) {
    // Try the base URL as a fallback
    try {
      const baseUrl = await getApiUrl();
      const res = await fetch(`${baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        return {
          isHealthy: true,
          message: 'Backend is responding (no health endpoint)',
          url: baseUrl,
        };
      } else {
        return {
          isHealthy: false,
          message: `Backend responded with status ${res.status} on base URL`,
          url: baseUrl,
        };
      }
    } catch (baseError: any) {
      return {
        isHealthy: false,
        message: `Cannot connect to backend: ${error.message}`,
        url: await getApiUrl(),
      };
    }
  }
}

export async function testApiEndpoint(endpoint: string): Promise<{
  exists: boolean;
  status: number;
  message: string;
}> {
  try {
    const baseUrl = await getApiUrl();
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return {
      exists: res.status !== 404,
      status: res.status,
      message: res.ok ? 'Endpoint exists and working' : `Status: ${res.status}`,
    };
  } catch (error: any) {
    return {
      exists: false,
      status: 0,
      message: `Network error: ${error.message}`,
    };
  }
}
