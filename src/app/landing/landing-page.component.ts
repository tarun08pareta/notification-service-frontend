import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { ProblemSolutionComponent } from './problem-solution/problem-solution.component';
import { FeaturesComponent } from './features/features.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { ProviderFailoverComponent } from './provider-failover/provider-failover.component';
import { ApiSectionComponent } from './api-section/api-section.component';
import { ChannelsComponent } from './channels/channels.component';
import { DashboardPreviewComponent } from './dashboard-preview/dashboard-preview.component';
import { SecurityComponent } from './security/security.component';
import { CtaComponent } from './cta/cta.component';
import { FooterComponent } from '../layout/components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    ProblemSolutionComponent,
    FeaturesComponent,
    HowItWorksComponent,
    ProviderFailoverComponent,
    ApiSectionComponent,
    ChannelsComponent,
    DashboardPreviewComponent,
    SecurityComponent,
    CtaComponent,
    FooterComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    // The global stylesheet sets body { overflow: hidden } for the app shell layout.
    // The landing page is a standalone public page that needs normal vertical scrolling.
    document.body.style.overflowY = 'auto';
  }

  ngOnDestroy(): void {
    // Restore app-shell behaviour when navigating away from the landing page.
    document.body.style.overflowY = '';
  }
}
