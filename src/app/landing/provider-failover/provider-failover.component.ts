import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type StepStatus = 'idle' | 'routing' | 'failure' | 'retrying' | 'fallback' | 'success';

interface FlowStep {
  label: string;
  sublabel?: string;
  statusKey: StepStatus;
  displayStatus: string;
  statusClass: string;
  icon: string;
}

@Component({
  selector: 'app-provider-failover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './provider-failover.component.html',
  styleUrl: './provider-failover.component.scss',
})
export class ProviderFailoverComponent implements OnInit, OnDestroy {
  // Cycles through the animation states
  readonly animationState = signal<StepStatus>('idle');
  private intervalId?: ReturnType<typeof setInterval>;

  private readonly stateCycle: StepStatus[] = [
    'routing',
    'failure',
    'retrying',
    'fallback',
    'success',
    'idle',
  ];
  private stateIndex = 0;

  readonly steps: FlowStep[] = [
    { label: 'Notification', sublabel: 'Incoming request', statusKey: 'idle',     displayStatus: 'Queued',               statusClass: 'info',    icon: 'notifications' },
    { label: 'Provider Router',                             statusKey: 'routing',  displayStatus: 'Routing…',             statusClass: 'routing', icon: 'account_tree'  },
    { label: 'Provider A',    sublabel: 'Priority 1',      statusKey: 'failure',  displayStatus: 'Transient Failure',    statusClass: 'failure', icon: 'email'         },
    { label: 'Retry',                                       statusKey: 'retrying', displayStatus: 'Retrying…',            statusClass: 'retry',   icon: 'refresh'       },
    { label: 'Provider B',    sublabel: 'Priority 2',      statusKey: 'fallback', displayStatus: 'Fallback Selected',    statusClass: 'routing', icon: 'email'         },
    { label: 'Delivered',                                   statusKey: 'success',  displayStatus: 'Success ✓',            statusClass: 'success', icon: 'check_circle'  },
  ];

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.stateIndex = (this.stateIndex + 1) % this.stateCycle.length;
      this.animationState.set(this.stateCycle[this.stateIndex]);
    }, 1800);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  isActive(step: FlowStep): boolean {
    const currentIndex = this.stateCycle.indexOf(this.animationState());
    const stepIndex    = this.stateCycle.indexOf(step.statusKey);
    return stepIndex <= currentIndex;
  }

  isCurrent(step: FlowStep): boolean {
    return step.statusKey === this.animationState();
  }
}
