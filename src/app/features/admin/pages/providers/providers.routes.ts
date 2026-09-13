import { Routes } from '@angular/router';

export const PROVIDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./providers.component').then(m => m.ProvidersComponent)
  }
];

