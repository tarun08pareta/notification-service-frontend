import { Routes } from '@angular/router';

export const USER_NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../notifications/notifications.component').then(m => m.NotificationsComponent),
  },
];
