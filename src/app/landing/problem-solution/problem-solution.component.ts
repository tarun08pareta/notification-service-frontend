import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Problem {
  text: string;
}

interface Solution {
  text: string;
}

@Component({
  selector: 'app-problem-solution',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './problem-solution.component.html',
  styleUrl: './problem-solution.component.scss',
})
export class ProblemSolutionComponent {
  readonly problems: Problem[] = [
    { text: 'Integrate each provider separately per service' },
    { text: 'Implement retry logic for every integration' },
    { text: 'Build manual provider fallback handling' },
    { text: 'Guard against duplicate notification sends' },
    { text: 'Track delivery state across multiple providers' },
    { text: 'Monitor failures per provider and per service' },
  ];

  readonly solutions: Solution[] = [
    { text: 'One unified notification API for all channels' },
    { text: 'Automatic retry with controlled backoff' },
    { text: 'Built-in provider fallback and routing' },
    { text: 'Idempotency protection out of the box' },
    { text: 'Centralised delivery tracking and status' },
    { text: 'Unified monitoring across all providers' },
  ];
}
