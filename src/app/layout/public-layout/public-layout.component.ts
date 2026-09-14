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
    <div class="public-layout">
      <app-landing-navbar></app-landing-navbar>

      <main class="public-main">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
    }
    
    .public-layout {
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    .public-main {
      flex: 1 0 auto;
      width: 100%;
      min-width: 0;
    }

    app-landing-navbar, app-footer {
      flex-shrink: 0;
    }
  `]
})
export class PublicLayoutComponent {}
