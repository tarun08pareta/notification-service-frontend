/**
 * TypeScript interfaces for the Admin Notification Management API.
 * Field names match the backend response contract exactly.
 * Do NOT add fields that the backend does not return.
 */

export type NotificationStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'RETRY_SCHEDULED'
  | 'SENT'
  | 'FAILED';

export type NotificationChannel = 'EMAIL' | 'SMS';

// ---------------------------------------------------------------------------
// Listing
// ---------------------------------------------------------------------------

/** One row in the admin notification table (list endpoint). */
export interface AdminNotification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  recipient: string;
  template: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  nextRetryAt: string | null;
}

/** Spring Page wrapper returned by GET /api/v1/admin/notifications */
export interface AdminNotificationPageResponse {
  content: AdminNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

/** User info embedded inside the notification detail response. */
export interface AdminNotificationUser {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** Full notification detail returned by GET /api/v1/admin/notifications/{id} */
export interface AdminNotificationDetail {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  template: string;
  variables: Record<string, unknown>;
  status: NotificationStatus;
  retryCount: number;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminNotificationUser;
}

// ---------------------------------------------------------------------------
// Delivery Attempts
// ---------------------------------------------------------------------------

/** One delivery attempt returned by GET /api/v1/admin/notifications/{id}/attempts */
export interface AdminNotificationAttempt {
  id: string;
  provider: string;
  status: string;          // SUCCESS | FAILED
  errorCode: string | null;
  errorMessage: string | null;
  providerMessageId: string | null;
  startedAt: string;
  completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Filter state (UI only)
// ---------------------------------------------------------------------------

export interface NotificationFilters {
  status: NotificationStatus | null;
  channel: NotificationChannel | null;
}
