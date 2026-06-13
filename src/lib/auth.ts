import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface AuthUser {
  id: string;
  name: string;
  initials: string;
  role: 'member' | 'admin';
  roleLabel: string;
}

interface TokenPayload {
  userId: string;
  role: 'member' | 'admin';
  iat: number;
  exp: number;
}

const TOKEN_KEY = 'asmpcs_token';
const USER_KEY = 'asmpcs_user';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// SecureStore is native-only — web falls back to in-memory (not persisted across reloads)
const webStore = new Map<string, string>();

async function storeSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') { webStore.set(key, value); return; }
  await SecureStore.setItemAsync(key, value);
}

async function storeGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return webStore.get(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function storeDel(key: string): Promise<void> {
  if (Platform.OS === 'web') { webStore.delete(key); return; }
  await SecureStore.deleteItemAsync(key);
}

export async function storeMockSession(user: AuthUser): Promise<void> {
  const now = Date.now();
  const payload: TokenPayload = { userId: user.id, role: user.role, iat: now, exp: now + SESSION_TTL_MS };
  await storeSet(TOKEN_KEY, JSON.stringify(payload));
  await storeSet(USER_KEY, JSON.stringify(user));
}

export async function getSession(): Promise<{ user: AuthUser } | null> {
  const [tokenJson, userJson] = await Promise.all([storeGet(TOKEN_KEY), storeGet(USER_KEY)]);
  if (!tokenJson || !userJson) return null;
  try {
    return { user: JSON.parse(userJson) as AuthUser };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([storeDel(TOKEN_KEY), storeDel(USER_KEY)]);
}

export async function isSessionValid(): Promise<boolean> {
  const tokenJson = await storeGet(TOKEN_KEY);
  if (!tokenJson) return false;
  try {
    const payload = JSON.parse(tokenJson) as TokenPayload;
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}
