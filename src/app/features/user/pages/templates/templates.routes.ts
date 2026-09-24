import { Routes } from '@angular/router';

export const USER_TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./templates.component').then(m => m.UserTemplatesComponent),
  },
];
