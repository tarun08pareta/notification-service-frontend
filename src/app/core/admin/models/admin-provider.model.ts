export interface AdminProviderHealth {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureCode: string | null;
  lastFailureMessage: string | null;
}

export interface AdminProvider {
  name: string;
  enabled: boolean;
  priority: number;
  channels: string[];
  healthResponse: AdminProviderHealth;
}

export interface ProviderStateUpdateRequest {
  enabled: boolean;
}

export interface ProviderPriorityUpdateRequest {
  priority: number;
}