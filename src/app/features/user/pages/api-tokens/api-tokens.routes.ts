import { Routes } from '@angular/router';

export const API_TOKEN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./api-tokens.component').then(m => m.ApiTokensComponent)
    }
];

