import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { NotificationRow } from '../types/database';

export interface DbNotification {
  id: string;
  type:
    | 'loan_approved'
    | 'loan_rejected'
    | 'contribution_recorded'
    | 'new_commodity'
    | 'loan_overdue'
    | 'general'
    | 'order_placed';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function mapRow(r: NotificationRow): DbNotification {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    isRead: r.is_read,
    createdAt: r.created_at,
  };
}

async function fetchNotifications(memberId: string): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, is_read, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(30)
    .returns<NotificationRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

const QK = (memberId: string | undefined) =>
  ['member', 'notifications', memberId] as const;

export function useNotifications() {
  const { member } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<DbNotification[]>({
    queryKey: QK(member?.id),
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchNotifications(member.id);
    },
    enabled: !!member?.id,
  });

  // Real-time: prepend inserts, update reads
  useEffect(() => {
    if (!member?.id) return;

    const channel = supabase
      .channel(`notifs-${member.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `member_id=eq.${member.id}`,
        },
        (payload) => {
          const incoming = mapRow(payload.new as NotificationRow);
          queryClient.setQueryData<DbNotification[]>(QK(member.id), (old = []) => [
            incoming,
            ...old,
          ]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `member_id=eq.${member.id}`,
        },
        (payload) => {
          const updated = mapRow(payload.new as NotificationRow);
          queryClient.setQueryData<DbNotification[]>(QK(member.id), (old = []) =>
            old.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [member?.id, queryClient]);

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic
      queryClient.setQueryData<DbNotification[]>(QK(member?.id), (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    },
    [member?.id, queryClient]
  );

  const markAllAsRead = useCallback(async () => {
    if (!member?.id) return;
    // Optimistic
    queryClient.setQueryData<DbNotification[]>(QK(member.id), (old = []) =>
      old.map((n) => ({ ...n, isRead: true }))
    );
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('member_id', member.id)
      .eq('is_read', false);
  }, [member?.id, queryClient]);

  return { ...query, markAsRead, markAllAsRead };
}
