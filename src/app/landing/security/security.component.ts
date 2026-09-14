import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SecurityFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-security',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss',
})
export class SecurityComponent {
  readonly features: SecurityFeature[] = [
    {
      icon: 'key',
      title: 'JWT Authentication',
      description: 'All API requests require a signed JWT. Tokens are verified on every request.',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Role-Based Access Control',
      description: 'Granular permissions separate admin operations from standard notification access.',
    },
    {
      icon: 'token',
      title: 'API Keys',
      description: 'Issue scoped API keys for programmatic access with full revocation support.',
    },
    {
      icon: 'verified_user',
      title: 'Secure Provider Credentials',
      description: 'Provider keys are stored securely and never exposed through the notification API.',
    },
    {
      icon: 'rule',
      title: 'Request Validation',
      description: 'Every request is validated against channel requirements before processing begins.',
    },
    {
      icon: 'sync_lock',
      title: 'Idempotency',
      description: 'Submit the same request multiple times safely — the engine prevents duplicate delivery.',
    },
  ];
}
