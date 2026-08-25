import { Routes } from '@angular/router';

export const PLAYGROUND_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./playground.component').then(m => m.PlaygroundComponent)
  }
];

