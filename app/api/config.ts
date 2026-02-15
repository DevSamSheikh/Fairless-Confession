import Constants from 'expo-constants';

const API_URL_OVERRIDE_KEY = '@confessbox_api_url';
let cachedOverride: string | null = null;

/** Set backend URL manually (e.g. http://192.168.1.5:5000). Use when same WiFi still fails. */
export async function setApiUrlOverride(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/+$/, '');
  cachedOverride = trimmed || null;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (trimmed) await AsyncStorage.setItem(API_URL_OVERRIDE_KEY, trimmed);
    else await AsyncStorage.removeItem(API_URL_OVERRIDE_KEY);
  } catch (_) {}
}

/** Get backend API base URL. Call at request time so Expo Go host is available. */
export async function getApiUrl(): Promise<string> {
  if (cachedOverride) return cachedOverride;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const stored = await AsyncStorage.getItem(API_URL_OVERRIDE_KEY);
    if (stored && stored.length > 0) {
      cachedOverride = stored;
      return stored;
    }
  } catch (_) {}

  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return 'http://localhost:5000';
  }
  try {
    const manifest = Constants.expoConfig ?? (Constants as any).manifest;
    const hostUri =
      (manifest as any)?.hostUri ??
      (manifest as any)?.debuggerHost ??
      (manifest as any)?.extra?.expoClient?.hostUri;
    if (hostUri && typeof hostUri === 'string') {
      const withoutScheme = hostUri.replace(/^exp:\/\//i, '');
      const host = withoutScheme.split(':')[0]?.trim();
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000`;
      }
    }
  } catch (_) {}
  return 'http://localhost:5000';
}

/** Sync getter for code that can't await (returns default; prefer await getApiUrl()). */
export function getApiUrlSync(): string {
  if (cachedOverride) return cachedOverride;
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') return 'http://localhost:5000';
  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiUrlSync();
