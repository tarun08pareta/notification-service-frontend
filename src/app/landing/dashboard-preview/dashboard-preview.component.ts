import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './dashboard-preview.component.html',
  styleUrl: './dashboard-preview.component.scss',
})
export class DashboardPreviewComponent {}
