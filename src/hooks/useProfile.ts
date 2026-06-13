import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { DbMember } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export interface NotifPrefs {
  emailNotifications: boolean;
  pushNotifications: boolean;
  loanUpdates: boolean;
  contributionUpdates: boolean;
  commodityUpdates: boolean;
}

const PREFS_DEFAULTS: NotifPrefs = {
  emailNotifications: false,
  pushNotifications: true,
  loanUpdates: true,
  contributionUpdates: true,
  commodityUpdates: true,
};

async function fetchPrefs(memberId: string): Promise<NotifPrefs> {
  const { data } = await supabase
    .from('notification_preferences')
    .select(
      'email_notifications, push_notifications, loan_updates, contribution_updates, commodity_updates'
    )
    .eq('member_id', memberId)
    .maybeSingle();

  if (!data) return PREFS_DEFAULTS;
  return {
    emailNotifications: data.email_notifications,
    pushNotifications: true, // always on — UI shows it locked
    loanUpdates: data.loan_updates,
    contributionUpdates: data.contribution_updates,
    commodityUpdates: data.commodity_updates,
  };
}

export function useProfile() {
  const { user, member, updateMember } = useAuth();
  const queryClient = useQueryClient();

  const prefsQuery = useQuery<NotifPrefs>({
    queryKey: ['member', 'prefs', member?.id],
    queryFn: () => {
      if (!member?.id) throw new Error('Not authenticated');
      return fetchPrefs(member.id);
    },
    enabled: !!member?.id,
  });

  async function updateProfile(data: Partial<DbMember>): Promise<void> {
    await updateMember(data);
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!user?.email) throw new Error('No email associated with this account.');
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (authErr) throw new Error('Current password is incorrect.');
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) throw new Error(updateErr.message);
  }

  async function updateNotifPrefs(delta: Partial<NotifPrefs>): Promise<void> {
    if (!member?.id) throw new Error('Not authenticated');
    const current = prefsQuery.data ?? PREFS_DEFAULTS;
    const merged = { ...current, ...delta, pushNotifications: true };

    queryClient.setQueryData<NotifPrefs>(['member', 'prefs', member.id], merged);

    const { error } = await supabase.from('notification_preferences').upsert(
      {
        member_id:             member.id,
        email_notifications:   merged.emailNotifications,
        push_notifications:    true,
        loan_updates:          merged.loanUpdates,
        contribution_updates:  merged.contributionUpdates,
        commodity_updates:     merged.commodityUpdates,
      },
      { onConflict: 'member_id' }
    );
    if (error) {
      queryClient.setQueryData<NotifPrefs>(['member', 'prefs', member.id], current);
      throw new Error(error.message);
    }
  }

  return { member, prefsQuery, updateProfile, changePassword, updateNotifPrefs };
}
