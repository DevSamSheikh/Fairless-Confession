import { getApiUrl } from './config';

export interface AuthUser {
  id: string;
  email?: string;
  identityId?: string;
  avatarSeed?: string;
  userIdCustom?: string;
  emailVerified?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  token?: string;
  user: AuthUser;
}

export async function authFetch(url: string, options: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (e: any) {
    const msg = e?.message ?? '';
    if (msg.includes('Network') || msg.includes('fetch') || msg.includes('Failed to connect') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
      throw new Error('Cannot reach server. Please ensure:\n1. Backend server is running (npm start in server folder)\n2. Your device is on the same WiFi as this computer\n3. Check the EXPO_PUBLIC_API_URL in your .env file');
    }
    throw new Error(`Network error: ${msg}`);
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
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to send reset link');
  }
}

export async function setNewPassword(
  resetToken: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  const baseUrl = await getApiUrl();
  const res = await authFetch(`${baseUrl}/api/auth/set-new-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to update password');
}
