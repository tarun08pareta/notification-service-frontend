import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  readonly features: Feature[] = [
    {
      icon: 'account_tree',
      title: 'Smart Provider Routing',
      description:
        'Automatically select eligible providers based on channel, availability, and priority. No routing logic in your application.',
    },
    {
      icon: 'refresh',
      title: 'Automatic Retries',
      description:
        'Retry transient failures using controlled exponential backoff. Your application does not need to manage retry state.',
    },
    {
      icon: 'alt_route',
      title: 'Provider Fallback',
      description:
        'When a provider fails, the engine automatically routes the notification to the next eligible provider.',
    },
    {
      icon: 'fingerprint',
      title: 'Idempotent Requests',
      description:
        'Prevent duplicate notification processing. Submit the same request safely without risking duplicate delivery.',
    },
    {
      icon: 'track_changes',
      title: 'Delivery Tracking',
      description:
        'Track notification state and individual provider delivery attempts through a single consistent API.',
    },
    {
      icon: 'bolt',
      title: 'Async Processing',
      description:
        'Notifications are queued and processed asynchronously so your application is never blocked waiting for delivery.',
    },
  ];
}
