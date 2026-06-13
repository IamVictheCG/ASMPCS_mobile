import type { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Mirrors the Supabase `members` table
export interface DbMember {
  id: string;
  auth_id: string | null;
  staff_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  agency: 'FAAN' | 'NAAM' | 'AIB' | 'STAFF_SCHOOL' | null;
  zone: string | null;
  department: string | null;
  date_joined: string | null;
  membership_status: 'active' | 'inactive' | 'suspended';
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  next_of_kin_relationship: string | null;
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  member: DbMember | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'member' | 'admin' | null;
  displayName: string | null;
  login(staffId: string, password: string): Promise<void>;
  loginAdmin(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updateMember(data: Partial<DbMember>): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMemberRecord(authId: string): Promise<DbMember | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('auth_id', authId)
    .single();
  if (error || !data) return null;
  return data as DbMember;
}

function deriveRole(user: User): 'member' | 'admin' {
  return user.app_metadata?.role === 'admin' ? 'admin' : 'member';
}

function deriveDisplayName(user: User, member: DbMember | null): string | null {
  if (member?.full_name) return member.full_name;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (typeof meta?.full_name === 'string') return meta.full_name;
  return user.email?.split('@')[0] ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<DbMember | null>(null);
  const [role, setRole] = useState<'member' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on cold start
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const r = deriveRole(u);
        setUser(u);
        setRole(r);
        if (r === 'member') {
          const m = await fetchMemberRecord(u.id);
          setMember(m);
        }
      }
      setIsLoading(false);
    });

    // Handle token refresh and remote sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setMember(null);
          setRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (staffId: string, password: string) => {
    // Resolve staff_id → email via SECURITY DEFINER RPC (runs before auth, bypasses RLS)
    const { data: email, error: rpcError } = await supabase
      .rpc('get_email_by_staff_id', { p_staff_id: staffId.trim().toUpperCase() });

    if (rpcError || !email) {
      throw new Error('Staff ID not found. Please check and try again.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      throw new Error(
        msg.includes('invalid') || msg.includes('credentials')
          ? 'Invalid password. Please try again.'
          : error.message
      );
    }

    if (!data.user) throw new Error('Login failed. Please try again.');

    const u = data.user;
    const r = deriveRole(u);
    setUser(u);
    setRole(r);
    // Fetch member record immediately so setup/dashboard screens have it
    const m = await fetchMemberRecord(u.id);
    setMember(m);
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      throw new Error(
        msg.includes('invalid') || msg.includes('credentials')
          ? 'Invalid email or password.'
          : error.message
      );
    }

    if (!data.user) throw new Error('Login failed. Please try again.');

    if (deriveRole(data.user) !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Not authorised as admin. Contact your system administrator.');
    }

    setUser(data.user);
    setRole('admin');
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMember(null);
    setRole(null);
    router.replace('/');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // redirectTo must be registered in Supabase: Authentication → URL Configuration
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'asmpcs://reset-password',
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateMember = useCallback(async (data: Partial<DbMember>) => {
    if (!user) throw new Error('Not authenticated');
    const { data: updated, error } = await supabase
      .from('members')
      .update(data)
      .eq('auth_id', user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setMember(updated as DbMember);
  }, [user]);

  const displayName = user ? deriveDisplayName(user, member) : null;

  return (
    <AuthContext.Provider value={{
      user,
      member,
      isAuthenticated: user !== null,
      isLoading,
      role,
      displayName,
      login,
      loginAdmin,
      logout,
      resetPassword,
      updateMember,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
