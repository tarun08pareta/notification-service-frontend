import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
  readonly steps: Step[] = [
    {
      number: '01',
      title: 'Send Request',
      description: 'Your application sends a notification request to the unified API endpoint.',
      icon: 'send',
    },
    {
      number: '02',
      title: 'Validate',
      description: 'Request payload, channel requirements, and template variables are validated.',
      icon: 'verified',
    },
    {
      number: '03',
      title: 'Queue',
      description: 'Notification is persisted and queued for asynchronous processing.',
      icon: 'queue',
    },
    {
      number: '04',
      title: 'Route',
      description: 'The router selects an eligible provider based on channel, priority, and availability.',
      icon: 'account_tree',
    },
    {
      number: '05',
      title: 'Retry & Fallback',
      description: 'Transient failures trigger retries. Eligible failures fall back to the next provider.',
      icon: 'alt_route',
    },
    {
      number: '06',
      title: 'Track Delivery',
      description: 'Delivery attempts and final notification status are recorded for full observability.',
      icon: 'track_changes',
    },
  ];
}
