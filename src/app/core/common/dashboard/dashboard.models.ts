import { UserNotificationChannel, UserNotificationStatus } from '../notifications/notification.models';

export interface UserDashboardStatistics {
  totalNotifications: number;
  sent: number;
  failed: number;
  queued: number;
  retryScheduled: number;
}

export interface UserDashboardChannels {
  email: number;
  sms: number;
}

export interface UserDashboardRecentNotification {
  id: string;
  channel: UserNotificationChannel;
  recipient: string;
  template: string;
  status: UserNotificationStatus;
  createdAt: string;
}

export interface UserDashboardResponse {
  statistics: UserDashboardStatistics;
  channels: UserDashboardChannels;
  recentNotifications: UserDashboardRecentNotification[];
}
