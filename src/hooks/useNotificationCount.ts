import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

async function fetchUnreadCount(memberId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('is_read', false);
  return count ?? 0;
}

export function useNotificationCount() {
  const { member } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!member?.id) return;

    fetchUnreadCount(member.id).then(setCount);

    const channel = supabase
      .channel(`notif-count-${member.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `member_id=eq.${member.id}` },
        () => { fetchUnreadCount(member.id).then(setCount); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [member?.id]);

  return { count, hasUnread: count > 0 };
}
