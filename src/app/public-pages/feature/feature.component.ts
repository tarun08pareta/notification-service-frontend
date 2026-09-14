import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureComponent {
 readonly features = [
    {
      title: 'Multi-Channel Support',
      description:
        'Send notifications through Email and SMS from a single unified platform.',
      icon: 'send',
      iconClass: 'icon-blue'
    },
    {
      title: 'Template Management',
      description:
        'Create, manage and version notification templates with dynamic placeholders.',
      icon: 'template',
      iconClass: 'icon-purple'
    },
    {
      title: 'User & Admin Portal',
      description:
        'Separate interfaces for users and admins with role-based access control.',
      icon: 'users',
      iconClass: 'icon-green'
    },
    {
      title: 'Real-time Monitoring',
      description:
        'Track notification delivery status, attempts and provider activity.',
      icon: 'chart',
      iconClass: 'icon-orange'
    },
    {
      title: 'Secure & Scalable',
      description:
        'Authentication, validation, rate limiting and production-ready security.',
      icon: 'shield',
      iconClass: 'icon-red'
    },
    {
      title: 'Provider Management',
      description:
        'Configure notification providers with priority, routing and failover support.',
      icon: 'settings',
      iconClass: 'icon-blue'
    },
    {
      title: 'Scheduled Notifications',
      description:
        'Prepare notifications for scheduled delivery and future processing.',
      icon: 'clock',
      iconClass: 'icon-purple'
    },
    {
      title: 'Developer Friendly',
      description:
        'Clean APIs and predictable notification workflows designed for developers.',
      icon: 'code',
      iconClass: 'icon-green'
    }
  ];

  readonly channels = [
    {
      name: 'Email',
      description: 'Transactional notifications',
      icon: 'email',
      iconClass: 'channel-blue'
    },
    {
      name: 'SMS',
      description: 'Fast & reliable delivery',
      icon: 'sms',
      iconClass: 'channel-green'
    },
    {
      name: 'Push',
      description: 'Planned channel',
      icon: 'push',
      iconClass: 'channel-purple',
      comingSoon: true
    },
    {
      name: 'In-App',
      description: 'Planned channel',
      icon: 'mobile',
      iconClass: 'channel-orange',
      comingSoon: true
    },
    {
      name: 'Webhook',
      description: 'Planned channel',
      icon: 'webhook',
      iconClass: 'channel-pink',
      comingSoon: true
    }
  ];
}
