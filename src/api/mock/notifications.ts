import { NOTIFICATIONS } from '../../data/member';
import type { ApiListResponse, Notification } from '../../types';

const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 200));

export async function getNotifications(): Promise<ApiListResponse<Notification>> {
  await delay();
  return { data: NOTIFICATIONS, meta: { total: NOTIFICATIONS.length, page: 1, perPage: 20 } };
}

export async function markNotificationRead(_index: number): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 50));
}
