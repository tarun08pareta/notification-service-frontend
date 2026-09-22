import { Routes } from '@angular/router';

export const COMPANY_PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./company-profile.component').then(m => m.CompanyProfileComponent)
  }
];

