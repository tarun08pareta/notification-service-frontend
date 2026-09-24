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
