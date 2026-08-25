import { Routes } from '@angular/router';
// Since guards were commented out globally, we'll follow the same structure here.
// In the future, roleGuard can be re-enabled for the admin path.

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./notifications.component').then(m => m.NotificationsComponent)
  },
  {
    // This resolves to /notifications/admin to replace the previous /admin/notifications structure.
    path: 'admin',
    loadComponent: () => import('./notifications.component').then(m => m.NotificationsComponent),
    // canActivate: [roleGuard],
    // data: { roles: ['ADMIN'] }
  }
];

