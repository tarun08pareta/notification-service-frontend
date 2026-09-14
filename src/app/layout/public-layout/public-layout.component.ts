import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../landing/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

/**
 * Shared layout for all public (non-authenticated) pages except the landing page.
 * The landing page is self-contained and does not use this layout.
 *
 * Route tree:
 *   /about   → PublicLayoutComponent > AboutComponent
 *   /terms   → PublicLayoutComponent > TermsComponent
 *   /privacy → PublicLayoutComponent > PrivacyComponent
 *   /contact → PublicLayoutComponent > ContactComponent
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-landing-navbar></app-landing-navbar>
    <main class="public-page-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; }
    .public-page-content { min-height: calc(100vh - 64px); }
  `]
})
export class PublicLayoutComponent {}
