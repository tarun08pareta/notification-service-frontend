import { Routes } from '@angular/router';

export const FEATURE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then((m) => m.FeatureComponent),
    },
];  
