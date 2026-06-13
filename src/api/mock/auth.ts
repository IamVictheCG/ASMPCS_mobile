import type { ApiResponse } from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export interface AuthPayload {
  userId: string;
  token: string;
  role: 'member' | 'admin';
}

export async function login(credentials: { id: string; password: string; role?: string }): Promise<ApiResponse<AuthPayload>> {
  await delay();
  return {
    data: {
      userId: credentials.id,
      token: 'mock-jwt-token',
      role: credentials.role === 'admin' ? 'admin' : 'member',
    },
  };
}

export async function logout(): Promise<ApiResponse<null>> {
  await delay();
  return { data: null };
}
