import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <h2>Feature coming soon...</h2>
      <p>This module has not been implemented yet.</p>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 300px;
      color: var(--mat-sys-on-surface-variant);
      background-color: var(--mat-sys-surface);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 40px;
    }
  `]
})
export class PlaceholderComponent {}
