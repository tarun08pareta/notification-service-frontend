import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';

// Angular Material
import { MatTableModule }          from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule }           from '@angular/material/sort';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule }         from '@angular/material/select';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatIconModule }           from '@angular/material/icon';
import { MatButtonModule }         from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }        from '@angular/material/tooltip';
import { MatChipsModule }          from '@angular/material/chips';
import { MatCardModule }           from '@angular/material/card';

// Shared UI
import { PageHeaderComponent }  from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent }  from '../../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent, StatusVariant }  from '../../../../shared/ui/status-chip/status-chip.component';

// Core
import { NotificationService }  from '../../../../core/common/notifications/notification.service';
import { ToastService }         from '../../../../core/common/toast/toast.service';
import {
  UserNotification,
  UserNotificationDetail,
  UserNotificationAttempt,
  UserNotificationStatus,
  UserNotificationChannel,
  UserNotificationFilters,
} from '../../../../core/common/notifications/notification.models';

const DISPLAYED_COLUMNS: string[] = [
  'id', 'channel', 'recipient', 'template', 'status', 'createdAt', 'retryCount', 'actions'
];

const STATUS_OPTIONS: Array<{ label: string; value: UserNotificationStatus | null }> = [
  { label: 'All',              value: null               },
  { label: 'Queued',           value: 'QUEUED'            },
  { label: 'Processing',       value: 'PROCESSING'        },
  { label: 'Retry Scheduled',  value: 'RETRY_SCHEDULED'   },
  { label: 'Sent',             value: 'SENT'              },
  { label: 'Failed',           value: 'FAILED'            },
];

const CHANNEL_OPTIONS: Array<{ label: string; value: UserNotificationChannel | null }> = [
  { label: 'All',    value: null    },
  { label: 'Email',  value: 'EMAIL' },
  { label: 'SMS',    value: 'SMS'   },
];

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusChipComponent,
    MatCardModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {

  private readonly notificationService = inject(NotificationService);
  private readonly toastr              = inject(ToastService);
  private readonly dialog              = inject(MatDialog);
  private readonly destroy$            = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('detailDialog') detailDialog!: TemplateRef<unknown>;

  readonly displayedColumns   = DISPLAYED_COLUMNS;
  readonly statusOptions      = STATUS_OPTIONS;
  readonly channelOptions     = CHANNEL_OPTIONS;
  readonly pageSizeOptions    = [10, 25, 50, 100];

  notifications = signal<UserNotification[]>([]);
  totalElements = signal<number>(0);
  isLoading     = signal<boolean>(false);

  pageIndex = 0;
  pageSize  = 10;

  filters: UserNotificationFilters = { status: null, channel: null };

  selectedDetail    = signal<UserNotificationDetail | null>(null);
  deliveryAttempts  = signal<UserNotificationAttempt[]>([]);
  isLoadingDetail   = signal<boolean>(false);
  isLoadingAttempts = signal<boolean>(false);
  private dialogRef: MatDialogRef<unknown> | null = null;

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading.set(true);

    this.notificationService
      .getNotifications(
        this.pageIndex,
        this.pageSize,
        this.filters.status,
        this.filters.channel,
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (page) => {
          this.notifications.set(page.content);
          this.totalElements.set(page.totalElements);
        },
        error: () => {
          this.toastr.error('Failed to load notifications.');
          this.notifications.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadNotifications();
  }

  private resetPaginator(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  onStatusFilterChange(value: UserNotificationStatus | null): void {
    this.filters = { ...this.filters, status: value };
    this.resetPaginator();
    this.loadNotifications();
  }

  onChannelFilterChange(value: UserNotificationChannel | null): void {
    this.filters = { ...this.filters, channel: value };
    this.resetPaginator();
    this.loadNotifications();
  }

  clearFilters(): void {
    this.filters = { status: null, channel: null };
    this.resetPaginator();
    this.loadNotifications();
  }

  get hasActiveFilters(): boolean {
    return !!this.filters.status || !!this.filters.channel;
  }

  openDetail(notification: UserNotification): void {
    this.selectedDetail.set(null);
    this.deliveryAttempts.set([]);
    this.isLoadingDetail.set(true);
    this.isLoadingAttempts.set(true);

    this.dialogRef = this.dialog.open(this.detailDialog, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'user-notification-dialog',
      autoFocus: false,
    });

    this.notificationService
      .getNotification(notification.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingDetail.set(false)))
      .subscribe({
        next: (detail) => this.selectedDetail.set(detail),
        error: () => {
          this.toastr.error('Failed to load notification details.');
          this.dialogRef?.close();
        },
      });

    this.notificationService
      .getUserNotificationAttempts(notification.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingAttempts.set(false)))
      .subscribe({
        next: (attempts) => this.deliveryAttempts.set(attempts),
        error: () => {
          this.toastr.error('Failed to load delivery attempts.');
          this.deliveryAttempts.set([]);
        },
      });
  }

  closeDetail(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
  }

  shortId(id: string): string {
    return id?.substring(0, 8) ?? '—';
  }

  statusVariant(status: UserNotificationStatus): StatusVariant {
    switch (status) {
      case 'SENT':             return 'success';
      case 'QUEUED':           return 'info';
      case 'PROCESSING':       return 'warning';
      case 'RETRY_SCHEDULED':  return 'warning';
      case 'FAILED':           return 'error';
      default:                 return 'info';
    }
  }

  channelIcon(channel: UserNotificationChannel): string {
    return channel === 'EMAIL' ? 'email' : 'sms';
  }

  statusLabel(status: UserNotificationStatus): string {
    switch (status) {
      case 'RETRY_SCHEDULED': return 'Retry Scheduled';
      default:                return status.charAt(0) + status.slice(1).toLowerCase();
    }
  }

  variableEntries(variables: Record<string, unknown>): Array<{ key: string; value: string }> {
    if (!variables) return [];
    return Object.entries(variables).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
    }));
  }

  attemptStatusIcon(status: string): string {
    return status === 'SUCCESS' ? 'check_circle' : 'error';
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }
}
