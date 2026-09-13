import { Routes } from '@angular/router';

export const TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./templates.component').then(m => m.TemplatesComponent)
  }
];

