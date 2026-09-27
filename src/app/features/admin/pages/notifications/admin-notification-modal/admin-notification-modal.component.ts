import { Component, Inject, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, finalize } from 'rxjs';
import { AdminNotificationService } from '../../../../../core/admin/services/admin-notification.service';
import { ToastService } from '../../../../../core/common/toast/toast.service';
import { AdminNotificationDetail, AdminNotificationAttempt, NotificationChannel, NotificationStatus } from '../../../../../core/admin/services/admin-notification.models';
import { StatusChipComponent, StatusVariant } from '../../../../../shared/ui/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-notification-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, StatusChipComponent],
  templateUrl: './admin-notification-modal.component.html',
  styleUrl: './admin-notification-modal.component.scss',
  providers: [DatePipe]
})
export class AdminNotificationModalComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(AdminNotificationService);
  private readonly toastr = inject(ToastService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroy$ = new Subject<void>();

  isLoadingDetail = signal(true);
  isLoadingAttempts = signal(true);
  selectedDetail = signal<AdminNotificationDetail | null>(null);
  deliveryAttempts = signal<AdminNotificationAttempt[]>([]);

  constructor(
    public dialogRef: MatDialogRef<AdminNotificationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) {}

  ngOnInit(): void {
    this.loadDetails();
    this.loadAttempts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDetails(): void {
    this.notificationService.getNotification(this.data.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingDetail.set(false)))
      .subscribe({
        next: (detail) => this.selectedDetail.set(detail),
        error: () => {
          this.toastr.error('Failed to load notification details.');
          this.dialogRef.close();
        }
      });
  }

  private loadAttempts(): void {
    this.notificationService.getNotificationAttempts(this.data.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingAttempts.set(false)))
      .subscribe({
        next: (attempts: AdminNotificationAttempt[]) => this.deliveryAttempts.set(attempts),
        error: () => this.toastr.error('Failed to load delivery attempts.')
      });
  }

  close(): void { this.dialogRef.close(); }
  
  formatDate(d: string): string { return this.datePipe.transform(d, 'medium') || d; }
  
  variableEntries(obj: any): {key: string, value: string}[] { 
    return obj ? Object.keys(obj).map(k => ({key: k, value: obj[k]})) : []; 
  }

  channelIcon(channel: NotificationChannel): string {
    switch (channel) {
      case 'EMAIL': return 'email';
      case 'SMS': return 'chat';
      default: return 'notifications';
    }
  }

  statusLabel(status: NotificationStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  statusVariant(status: NotificationStatus): StatusVariant {
    switch (status) {
      case 'SENT': return 'success';
      case 'FAILED': return 'error';
      case 'QUEUED':
      case 'PROCESSING': return 'warning';
      case 'RETRY_SCHEDULED': return 'info';
      default: return 'info';
    }
  }

  attemptStatusIcon(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'check_circle';
      case 'FAILED': return 'error';
      case 'PENDING': return 'schedule';
      default: return 'help';
    }
  }
}
