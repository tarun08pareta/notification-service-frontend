import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-api-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './api-section.component.html',
  styleUrl: './api-section.component.scss',
})
export class ApiSectionComponent {
  readonly copied = signal(false);

  readonly requestBody = `{
  "channel": "EMAIL",
  "recipient": "user@example.com",
  "template": "WELCOME",
  "variables": {
    "name": "Tarun"
  }
}`;

  readonly fullRequest =
    `POST /api/v1/notifications\nContent-Type: application/json\nX-API-Key: <token>\n\n` +
    this.requestBody;

  copyCode(): void {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(this.fullRequest).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  readonly features = [
    'Authentication & authorisation',
    'Request validation',
    'Idempotency protection',
    'Provider routing',
    'Retry & exponential backoff',
    'Provider fallback',
    'Delivery tracking',
    'Async processing',
  ];
}
