import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public-layout.component';

export const PUBLIC_LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () =>
          import('../../landing/landing.routes').then(
            (m) => m.LANDING_ROUTES
          ),
      },
      {
        path: 'about',
        loadChildren: () =>
          import('../../public-pages/about/about.routes').then(
            (m) => m.ABOUT_ROUTES
          ),
      },
      {
        path: 'terms',
        loadChildren: () =>
          import('../../public-pages/terms/terms.routes').then(
            (m) => m.TERMS_ROUTES
          ),
      },
      {
        path: 'privacy',
        loadChildren: () =>
          import('../../public-pages/privacy/privacy.routes').then(
            (m) => m.PRIVACY_ROUTES
          ),
      },
      {
        path: 'contact',
        loadChildren: () =>
          import('../../public-pages/contact/contact.routes').then(
            (m) => m.CONTACT_ROUTES
          ),
      },
      {
        path: 'features',
        loadChildren: () =>
          import('../../public-pages/feature/feature.routes').then(
            (m) => m.FEATURE_ROUTES
          ),
      },
      {
        path: 'pricing',
        loadChildren: () =>
          import('../../public-pages/pricing/pricing.routes').then(
            (m) => m.PRICING_ROUTES
          ),
      },

    ],
  },
];
