import { Routes } from '@angular/router';

export const ADMIN_TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./templates.component').then(m => m.TemplatesComponent),
  },
];

// Keep backward compatibility with the existing /templates shared route
export const TEMPLATES_ROUTES = ADMIN_TEMPLATES_ROUTES;


