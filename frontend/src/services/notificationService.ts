import type { Notification } from '../types';

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export function getNotificationIcon(type: Notification['type']) {
  const iconMap: Record<string, string> = {
    savings: '💰',
    plan_update: '🔄',
    reminder: '⏰',
    system: '⚙️',
    message: '💬',
  };
  return iconMap[type] || '🔔';
}

export function getNotificationColor(type: Notification['type']): string {
  const colorMap: Record<string, string> = {
    savings: 'bg-green-50 border-green-200 text-green-700',
    plan_update: 'bg-blue-50 border-blue-200 text-blue-700',
    reminder: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    system: 'bg-slate-50 border-slate-200 text-slate-700',
    message: 'bg-mtn-yellow/10 border-mtn-yellow/30 text-mtn-blue',
  };
  return colorMap[type] || 'bg-slate-50 border-slate-200 text-slate-700';
}

export async function fetchNotifications(): Promise<Notification[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function clearNotification(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
}
