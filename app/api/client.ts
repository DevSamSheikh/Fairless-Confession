import { API_BASE_URL } from './config';

export function getAuthToken(): string | null {
  return useAuthTokenStore?.getState?.()?.token ?? null;
}

// Will be set by user store after it's loaded to avoid circular deps
let useAuthTokenStore: { getState: () => { token: string | null } } | null = null;
export function setAuthTokenStore(store: { getState: () => { token: string | null } }) {
  useAuthTokenStore = store;
}

export async function apiFetch(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (!skipAuth && useAuthTokenStore) {
    const token = useAuthTokenStore.getState().token;
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
  return fetch(url, { ...fetchOptions, headers });
}
