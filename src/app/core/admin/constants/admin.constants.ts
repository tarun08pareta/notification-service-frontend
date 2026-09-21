export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/user',
    OAUTH2_EXCHANGE: '/api/v1/auth/google/login'
  },
  USERS: {
    BASE: '/api/v1/users'
  },
  CLIENTS: {
    BASE: '/api/v1/clients'
  },
  NOTIFICATIONS: {
    BASE: '/api/v1/notifications'
  },
  TEMPLATES: {
    BASE: '/api/v1/templates'
  },
  API_TOKENS: {
    BASE: '/api/v1/api-tokens'
  },
  ADMIN: {
    NOTIFICATIONS: {
      BASE: '/api/v1/admin/notifications'
    },
    // ADDED: Provider endpoints nested inside ADMIN
    PROVIDERS: {
      BASE: '/api/v1/admin/providers',
      ENABLED: (providerName: string): string =>
        `/api/v1/admin/providers/${encodeURIComponent(providerName)}/enabled`,
      PRIORITY: (providerName: string): string =>
        `/api/v1/admin/providers/${encodeURIComponent(providerName)}/priority`
    }
  }
} as const;

// Related Constants
export const ADMIN_PROVIDER_DEFAULTS = {
  PRIORITY_MIN: 0
} as const;