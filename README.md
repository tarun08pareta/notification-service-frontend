# Centralized Notification & Alerting Engine — Frontend

The frontend application for the Centralized Notification & Alerting Engine provides a modern, responsive, and robust interface for both platform administrators and end users. It serves as the primary gateway to interact with the underlying notification delivery infrastructure.

The frontend currently provides:
- User notification management
- Notification Playground
- API token management
- Company profile management
- Email template management
- User dashboard
- Admin dashboard
- Admin provider management
- Admin notification monitoring
- Authentication
- Google OAuth2 login
- Change password
- Logout
- Role-based UI access

## 1. Overview

This Angular application acts as the client-side interface that communicates securely with the Spring Boot REST API backend. 

The application is split into two primary experiences based on user roles:
- **USER:** Focused on creating tokens, managing company profiles, designing email templates, and monitoring/triggering self-contained notifications via the Playground.
- **ADMIN:** Focused on platform-wide monitoring, tracking provider health, overseeing global delivery metrics, and managing roles/users (partially implemented).

**Important:** The frontend purely acts as a presentation layer. The backend remains the absolute source of truth for authentication, authorization, notification processing, provider routing, retry logic, and data persistence. 

## 2. Technology Stack

This project is built using modern web development standards and leverages the following stack:
- **Angular 18** (Standalone components architecture)
- **TypeScript**
- **RxJS**
- **NgRx Store** (State management)
- **Angular Material** (UI component library)
- **Tailwind CSS** (Utility-first styling system)
- **Angular Router**
- **HttpClient** (REST API communication)
- **Reactive Forms**
- **JWT Authentication**

## 3. Frontend Architecture

The codebase strictly follows a domain-driven, feature-based architecture utilizing Angular standalone components.

```
src/app/
├── core/
│   ├── admin/      # Admin-specific core logic (guards, navigation)
│   ├── common/     # Shared core logic (auth, interceptors, api, toast)
│   └── user/       # User-specific core logic (navigation)
├── features/
│   ├── admin/      # Admin feature pages (dashboard, providers, notifications)
│   ├── auth/       # Authentication pages (login, oauth callback)
│   └── user/       # User feature pages (dashboard, playground, tokens, etc.)
├── layout/         # Application shell structure
│   ├── app-shell/
│   ├── auth-layout/
│   ├── components/ # Header, Sidebar
│   └── public-layout/
└── shared/
    ├── components/ # Reusable UI pieces (modals, change-password, global-loader)
    └── ui/         # Dumb/Presentational UI components (page-header, cards)
```

**Responsibilities:**
- **`core/`**: Contains singleton services, authentication, HTTP interceptors, NgRx stores/facades, route guards, and base application configuration.
- **`features/`**: Contains smart components and feature-specific routing. Business logic is contained within these boundaries.
- **`layout/`**: Defines the structural scaffolding of the application (e.g., sidebars, authenticated wrappers vs. public wrappers).
- **`shared/`**: Houses highly reusable UI components, pipes, and directives intended for use across multiple features.

## 4. User Application

The user-facing application handles daily operational requirements for clients integrating with the notification platform.

### User Dashboard
Displays aggregate data and visualization for the authenticated user's notification traffic. Includes:
- Total, sent, failed, queued, and retry-scheduled notifications
- Email/SMS channel distribution
- Recent notifications list

### Notification Playground
An interactive testing environment for triggering notifications directly from the UI.
- Support for selecting pre-defined templates
- Reactive form implementation with JSON payload validation
- Variables mapping

### Notifications
A dedicated history page displaying all notifications sent by the user's company.
- Table listing with pagination
- Filtering by delivery status
- Filtering by channel

### API Tokens
Interface to securely manage programmatic access to the notification engine.
- API token generation
- Token revocation and listing
- *(Note: Actual token strings are only displayed once upon creation)*

### Company Profile
Allows clients to define sender identities.
- Company information
- Default sender/reply-to addresses
- SMS sender identification
- Company logo management

### Email Templates
Provides the interface to view and manage notification templates specific to the user.

### Change Password
A reactive form allowing users to update their credentials.
- Current, New, and Confirm Password fields.
- Real-time password mismatch validation.
- Secure HTTP integration via backend.

### Logout
- Secure logout flow invoking a confirmation dialog to prevent accidental sign-outs.
- Cleans up all localized state and redirects to the login view.

## 5. Admin Application

The admin interface offers an overarching view of the entire platform's health and configuration.

### Admin Dashboard
Aggregates global platform metrics.
- Total users on the platform
- Platform-wide notification statuses (Sent, Failed, Queued, Retrying)
- Provider health summaries
- Platform-wide channel distributions

### Provider Management
Manages upstream notification gateways (e.g., SendGrid, Twilio).
- Provider list overview
- Enable/Disable toggle
- Priority adjustments

### Notification Monitoring
Global notification history tracking.
- Filtering by status, channel, and users.
- In-depth delivery attempt viewing.

### Email Templates
Admin-level template management interface (Create, Edit, List, Status, Variables).

### Users & Roles
*(Status: UI scaffolds exist, functionality is currently in development)*

## 6. Navigation

The application uses an authenticated layout shell containing a dynamic sidebar. 
- **Admin configuration:** `src/app/core/admin/navigation/admin-navigation.config.ts`
- **User configuration:** `src/app/core/user/navigation/user-navigation.config.ts`
- **Routes:** `src/app/app.routes.ts`

Navigation items dynamically render based on the user's authenticated role. The "Settings -> Change Password" interface is available universally to all authenticated users.

## 7. Authentication

Authentication revolves around JWT (JSON Web Tokens).

**Standard Flow:**
1. User submits email/password to `/login`.
2. Backend validates and returns a JWT + Expiry + User object.
3. Frontend persists authentication state (`AuthService` / `NgRx` / `localStorage`).
4. Subsequent requests attach the JWT via an `AuthInterceptor`.

**Google OAuth2 Flow:**
1. Frontend opens backend Google Auth endpoint in a popup window.
2. Backend processes OAuth dance and redirects to a frontend `/auth/google/callback` with a secure exchange code.
3. Frontend exchanges this code for a standard application JWT seamlessly.

## 8. Authorization

Authorization is strictly role-based (e.g., `USER`, `ADMIN`).

While the frontend employs Route Guards (`adminGuard`, `userGuard`) to restrict navigation and conditionally render UI elements based on roles, **the backend remains strictly authoritative.** The frontend route protection is purely for User Experience; no sensitive data is accessible without a valid, backend-verified JWT holding the required permissions.

## 9. API Integration

Communication with the Spring Boot backend is handled via Angular's `HttpClient`.

Key endpoint groups mapped in `api.constants.ts`:
- **Authentication:** `/api/v1/auth/...`
- **User Notifications:** `/api/v1/notifications/...`
- **User Dashboard:** `/api/v1/dashboard/...`
- **API Tokens:** `/api/v1/api-tokens/...`
- **Company Profile:** `/api/v1/company/profile/...`
- **Email Templates:** `/api/v1/email-templates/...`
- **Admin Dashboard:** `/api/v1/admin/dashboard/...`
- **Admin Providers:** `/api/v1/admin/providers/...`
- **Admin Notifications:** `/api/v1/admin/notifications/...`

## 10. HTTP / Error Handling

An `AuthInterceptor` gracefully intercepts HTTP responses.
- Automatically attaches Bearer tokens.
- Captures `401 Unauthorized` errors to invoke session-expiry logic (auto-logout + Toast notification).
- A global `ToastService` leverages `ngx-toastr` to surface API errors safely without exposing raw stack traces to the end user.

## 11. Shared Components

Found in `src/app/shared/components/`:
- **`global-loader`**: Application-wide NgRx-driven loading overlay.
- **`change-password`**: Reusable form for credential updates.
- **`logout-confirmation`**: Standardized dialog for sign-out intent.
- **`dialog-header` / `dialog-footer`**: Consistent wrapper components for Material dialogs.

## 12. UI / Design System

The application strictly utilizes **Angular Material** for complex interaction components (tables, dialogs, form fields, menus) and **Tailwind CSS** for layout, spacing, and typography.
- Supports both Light and Dark themes seamlessly (`.dark-theme` class strategy).
- Responsive design adapting to mobile, tablet, and desktop viewports.

## 13. Forms & Validation

All forms use Angular **Reactive Forms** (`FormGroup`, `FormControl`).
- Client-side validation is extensively applied (e.g., required fields, minimum lengths, cross-field password matching, JSON syntax verification in the Playground).
- Submissions are disabled until form validity is met.

## 14. Loading / Empty / Error States

- **Loading:** Forms and API actions utilize local spinners (`mat-spinner`). Major route transitions or heavy operations trigger the `global-loader`.
- **Errors:** Handled via Toast notifications for non-blocking alerts.
- **Empty States:** List pages (Notifications, Tokens, Templates) implement distinct empty states when no data is available.

## 15. Local Development

### Prerequisites
- Node.js (v18.x recommended)
- npm

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm start
# or
ng serve
```
The application will be accessible at `http://localhost:4200/`.

## 16. Environment Configuration

Configuration is managed via Angular environment files:
- `src/environments/environment.ts` (Development default)
- `src/environments/environment.production.ts` (Production build)

These files export an `apiUrl` variable specifying the base URL for the Spring Boot backend. *No sensitive secrets are stored here.*

## 17. Development Conventions

- **Standalone Components:** `NgModule` is deprecated in this project. All components must be `standalone: true`.
- **Strict Typing:** Avoid `any` types. Define interfaces in corresponding `.models.ts` files.
- **UI Code:** Rely on Tailwind utility classes instead of writing custom `.scss` unless styling deep Angular Material internals.
- **State:** Use Signals and NgRx where applicable.

## 18. Security Considerations

- **Tokens:** JWT access tokens are synchronized with Local Storage but should be cleared natively on logout.
- **Secrets:** NEVER commit API keys, OAuth client secrets, or Cloudinary credentials to the frontend repository.
- **Authorization:** Assume the user can bypass frontend guards; ensure every backend endpoint requires token validation.

## 19. Testing

The project is pre-configured with Jasmine and Karma for testing.
```bash
npm run test
```
*(Note: Comprehensive component and E2E test coverage is currently an ongoing effort).*

## 20. Build

To compile the application for production deployment:
```bash
npm run build
```
The production bundle will be exported to the `dist/notification-portal` directory.

## 21. Current Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Authentication & Auth State | Completed | Includes standard & Google OAuth2 |
| Layout & Theming | Completed | Dark/Light mode integration complete |
| User Dashboard | Completed | Integrated with API |
| Admin Dashboard | Completed | Integrated with API |
| Notification History | Completed | Both User and Admin interfaces |
| Notification Playground | Completed | |
| API Tokens | Completed | |
| Company Profile | Completed | Includes logo upload |
| Email Templates | Completed | User implementation |
| Provider Management | Completed | Admin interface |
| Change Password / Logout | Completed | Integrated with APIs and Modals |
| Users / Roles Mgmt | In Progress | Scaffolded |

## 22. Future Improvements
- Completion of the Admin User and Role Management modules.
- Refinement of unit testing suites (Karma/Jasmine).
- Enhanced charting visualizations for dashboards.

## 23. Backend Dependency

This frontend application is non-functional without its companion backend. Ensure the Spring Boot API is running and reachable at the configured `apiUrl` to facilitate login, navigation, and data population.

## 24. Troubleshooting

- **API 401/403 Errors:** Your JWT likely expired, or you restarted the backend (wiping memory tokens). Log out and log back in.
- **CORS Errors:** Ensure the Spring Boot backend is configured to accept cross-origin requests from `http://localhost:4200`.
- **Blank Screen on Load:** Check the console for missing environment variables or a disconnected API preventing the initial state load.

## 25. Contribution Workflow

1. Create a feature branch (`feature/description`).
2. Adhere to existing standalone and styling conventions.
3. Verify changes with `npm run build` and `npm run test`.
4. Submit a Pull Request for review.
