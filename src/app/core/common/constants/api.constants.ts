export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/user', // As per backend requestMatchers("/api/v1/user")
    /**
     * Exchanges a short-lived one-time authorization code (received via
     * the /auth/callback redirect from the backend OAuth2 success handler)
     * for the full LoginResponse (user + application JWT).
     * The code is opaque, single-use, and expires in ~60 seconds.
     */
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
  }
} as const;
