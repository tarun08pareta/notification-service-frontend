import { NotificationChannel, NotificationStatus } from './admin-notification.models';

export interface AdminDashboardStatistics {
  totalUsers: number;
  totalNotifications: number;
  sent: number;
  failed: number;
  queued: number;
  retryScheduled: number;
}

export interface AdminDashboardChannels {
  email: number;
  sms: number;
}

export interface AdminDashboardProvider {
  provider: string;
  enabled: boolean;
  priority: number;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureCode: string | null;
  lastFailureMessage: string | null;
}

export interface AdminDashboardRecentFailure {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  template: string;
  status: NotificationStatus;
  retryCount: number;
  createdAt: string;
}

export interface AdminDashboardResponse {
  statistics: AdminDashboardStatistics;
  channels: AdminDashboardChannels;
  providers: AdminDashboardProvider[];
  recentFailures: AdminDashboardRecentFailure[];
}
