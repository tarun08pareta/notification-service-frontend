export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/user' // As per backend requestMatchers("/api/v1/user")
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
  }
} as const;
