export interface NotificationRequest {
  channel: 'EMAIL' | 'SMS';
  recipient: string;
  template: string;
  variables: Record<string, any>;
  advancedVariables?: Record<string, string>;
}

export interface NotificationResponse {
  id: string;
  channel: string;
  recipient: string;
  template: string;
  status: string; // QUEUED, PROCESSING, RETRY_SCHEDULED, SENT, FAILED
  retryCount: number;
  nextRetryAt?: string;
  createdAt: string;
}

export interface DeliveryAttempt {
  id: string;
  provider: string;
  status: string; // SUCCESS, FAILED
  errorCode?: string;
  errorMessage?: string;
  providerMessageId?: string;
  startedAt: string;
  completedAt: string;
}

export type UserNotificationStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'RETRY_SCHEDULED'
  | 'SENT'
  | 'FAILED';

export type UserNotificationChannel = 'EMAIL' | 'SMS';

export interface UserNotification {
  id: string;
  channel: UserNotificationChannel;
  recipient: string;
  template: string;
  status: UserNotificationStatus;
  retryCount: number;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationPageResponse {
  content: UserNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UserNotificationDetail {
  id: string;
  channel: UserNotificationChannel;
  recipient: string;
  template: string;
  variables: Record<string, string>;
  advancedVariables: Record<string, string>;
  status: UserNotificationStatus;
  retryCount: number;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationAttempt {
  id: string;
  provider: string;
  attemptNumber: number;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  providerMessageId: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface UserNotificationFilters {
  status: UserNotificationStatus | null;
  channel: UserNotificationChannel | null;
}
