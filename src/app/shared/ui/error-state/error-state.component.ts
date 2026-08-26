import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  @Input() icon: string = 'error_outline';
  @Input() title: string = 'Something went wrong';
  @Input({ required: true }) message!: string;
  @Input() retryLabel: string = 'Try Again';
  @Output() retry = new EventEmitter<void>();
}
