import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    // canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['USER', 'ADMIN'] }
      },
      {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/roles/roles.routes').then(m => m.ROLES_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'providers',
        loadChildren: () => import('./features/providers/providers.routes').then(m => m.PROVIDERS_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'channels',
        loadChildren: () => import('./features/channels/channels.routes').then(m => m.CHANNELS_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'templates',
        loadChildren: () => import('./features/templates/templates.routes').then(m => m.TEMPLATES_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['USER', 'ADMIN'] }
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
        // canActivate: [roleGuard],
        // The admin sub-route roles are handled internally or mapped here.
        // For now, mapping USER to the base allows /notifications to work.
        data: { roles: ['USER', 'ADMIN'] }
      },
      {
        path: 'logs',
        loadChildren: () => import('./features/logs/logs.routes').then(m => m.LOGS_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'usage',
        loadChildren: () => import('./features/usage/usage.routes').then(m => m.USAGE_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'playground',
        loadChildren: () => import('./features/playground/playground.routes').then(m => m.PLAYGROUND_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['USER'] }
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        // canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
