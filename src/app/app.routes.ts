import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [

  // ══════════════════════════════════════════════════════════════
  // PUBLIC WEBSITE
  // ══════════════════════════════════════════════════════════════

  // Root: Landing Page (exact match only so /user/... still resolves below)
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./landing/landing-page.component').then(m => m.LandingPageComponent)
  },

  // Public pages via shared public layout (navbar + footer wrapper)
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/public/terms/terms.component').then(m => m.TermsComponent)
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/public/privacy/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // AUTHENTICATED APPLICATION
  // ══════════════════════════════════════════════════════════════

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      // ── User routes ──────────────────────────────────────────
      {
        path: 'user',
        canActivate: [userGuard],
        children: [
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./features/user/pages/user-dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
          },
          {
            path: 'api-tokens',
            loadComponent: () =>
              import('./features/user/pages/api-tokens/api-tokens.component').then(m => m.ApiTokensComponent)
          },
          {
            path: 'playground',
            loadChildren: () =>
              import('./features/user/pages/playground/playground.routes').then(m => m.PLAYGROUND_ROUTES)
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // ── Admin routes ─────────────────────────────────────────
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'users',
            loadChildren: () =>
              import('./features/admin/pages/users/users.routes').then(m => m.USERS_ROUTES)
          },
          {
            path: 'roles',
            loadChildren: () =>
              import('./features/admin/pages/roles/roles.routes').then(m => m.ROLES_ROUTES)
          },
          {
            path: 'providers',
            loadChildren: () =>
              import('./features/admin/pages/providers/providers.routes').then(m => m.PROVIDERS_ROUTES)
          },
          {
            path: 'channels',
            loadChildren: () =>
              import('./features/admin/pages/channels/channels.routes').then(m => m.CHANNELS_ROUTES)
          },
          {
            path: 'logs',
            loadChildren: () =>
              import('./features/admin/pages/logs/logs.routes').then(m => m.LOGS_ROUTES)
          },
          {
            path: 'usage',
            loadChildren: () =>
              import('./features/admin/pages/usage/usage.routes').then(m => m.USAGE_ROUTES)
          },
          {
            path: 'settings',
            loadChildren: () =>
              import('./features/admin/pages/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // ── Shared authenticated features ─────────────────────────
      {
        path: 'templates',
        loadChildren: () =>
          import('./features/admin/pages/templates/templates.routes').then(m => m.TEMPLATES_ROUTES)
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      },

      { path: '', redirectTo: 'user/dashboard', pathMatch: 'full' }
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // AUTH ROUTES  (login / signup)
  // ══════════════════════════════════════════════════════════════

  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ══════════════════════════════════════════════════════════════
  // WILDCARD — unknown URLs show the landing page
  // ══════════════════════════════════════════════════════════════

  { path: '**', redirectTo: '' }
];
