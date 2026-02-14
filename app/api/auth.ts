import { getApiUrl } from './config';

export interface AuthUser {
  id: string;
  email?: string;
  identityId?: string;
  avatarSeed?: string;
  userIdCustom?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  token?: string;
  user: AuthUser;
}

async function authFetch(url: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (e: any) {
    const msg = e?.message ?? '';
    if (msg.includes('Network') || msg.includes('fetch') || msg.includes('Failed to connect')) {
      throw new Error('Cannot reach server. Ensure the backend is running and your device is on the same Wi‑Fi as this computer.');
    }
    throw e;
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const baseUrl = await getApiUrl();
  const res = await authFetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Login failed');
  }
  if (!data.token || !data.user) {
    throw new Error('Invalid response');
  }
  return { token: data.token, user: data.user };
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  rulesAccepted: boolean
): Promise<RegisterResponse> {
  const baseUrl = await getApiUrl();
  const res = await authFetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      fullName: fullName.trim() || null,
      rulesAccepted: rulesAccepted === true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Registration failed');
  }
  if (!data.user) {
    throw new Error('Invalid response');
  }
  return {
    token: data.token,
    user: data.user,
  };
}

export async function forgetPassword(email: string): Promise<void> {
  const baseUrl = await getApiUrl();
  const res = await authFetch(`${baseUrl}/api/auth/forget-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to send reset email');
  }
}
