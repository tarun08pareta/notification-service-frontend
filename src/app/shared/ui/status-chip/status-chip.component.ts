import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss'
})
export class StatusChipComponent {
  @Input({ required: true }) label!: string;
  @Input() variant: StatusVariant = 'info';
  @Input() icon?: string;
}
