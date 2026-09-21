import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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

// Shared UI
import { PageHeaderComponent }  from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent }  from '../../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent }  from '../../../../shared/ui/status-chip/status-chip.component';
import { StatusVariant }        from '../../../../shared/ui/status-chip/status-chip.component';

// Core
import { AdminNotificationService, ADMIN_NOTIFICATIONS_DEFAULT_PAGE_SIZE, ADMIN_NOTIFICATIONS_PAGE_SIZE_OPTIONS } from '../../../../core/admin/services/admin-notification.service';
import { ToastService }         from '../../../../core/common/toast/toast.service';
import {
  AdminNotification,
  AdminNotificationDetail,
  AdminNotificationAttempt,
  NotificationStatus,
  NotificationChannel,
  NotificationFilters,
} from '../../../../core/admin/services/admin-notification.models';
import { MatCardModule } from '@angular/material/card';

/** Columns rendered in the MatTable. */
const DISPLAYED_COLUMNS: string[] = [
  'id', 'user', 'channel', 'recipient', 'template', 'status', 'createdAt', 'retryCount', 'actions'
];

/** All supported statuses for the filter dropdown. */
const STATUS_OPTIONS: Array<{ label: string; value: NotificationStatus | null }> = [
  { label: 'All',              value: null               },
  { label: 'Queued',           value: 'QUEUED'            },
  { label: 'Processing',       value: 'PROCESSING'        },
  { label: 'Retry Scheduled',  value: 'RETRY_SCHEDULED'   },
  { label: 'Sent',             value: 'SENT'              },
  { label: 'Failed',           value: 'FAILED'            },
];

/** All supported channels for the filter dropdown. */
const CHANNEL_OPTIONS: Array<{ label: string; value: NotificationChannel | null }> = [
  { label: 'All',    value: null    },
  { label: 'Email',  value: 'EMAIL' },
  { label: 'SMS',    value: 'SMS'   },
];

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
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

  // ---------------------------------------------------------------------------
  // Dependencies
  // ---------------------------------------------------------------------------
  private readonly adminNotificationService = inject(AdminNotificationService);
  private readonly toastr                   = inject(ToastService);
  private readonly dialog                   = inject(MatDialog);
  private readonly destroy$                 = new Subject<void>();

  // ---------------------------------------------------------------------------
  // ViewChild references
  // ---------------------------------------------------------------------------
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('detailDialog') detailDialog!: TemplateRef<unknown>;

  // ---------------------------------------------------------------------------
  // Constants exposed to template
  // ---------------------------------------------------------------------------
  readonly displayedColumns   = DISPLAYED_COLUMNS;
  readonly statusOptions      = STATUS_OPTIONS;
  readonly channelOptions     = CHANNEL_OPTIONS;
  readonly pageSizeOptions    = ADMIN_NOTIFICATIONS_PAGE_SIZE_OPTIONS;

  // ---------------------------------------------------------------------------
  // Table state
  // ---------------------------------------------------------------------------
  notifications = signal<AdminNotification[]>([]);
  totalElements = signal<number>(0);
  isLoading     = signal<boolean>(false);

  // Pagination state (kept in sync with MatPaginator via PageEvent)
  pageIndex = 0;
  pageSize  = ADMIN_NOTIFICATIONS_DEFAULT_PAGE_SIZE;

  // ---------------------------------------------------------------------------
  // Filter state
  // ---------------------------------------------------------------------------
  filters: NotificationFilters = { status: null, channel: null };

  // ---------------------------------------------------------------------------
  // Detail modal state
  // ---------------------------------------------------------------------------
  selectedDetail    = signal<AdminNotificationDetail | null>(null);
  deliveryAttempts  = signal<AdminNotificationAttempt[]>([]);
  isLoadingDetail   = signal<boolean>(false);
  isLoadingAttempts = signal<boolean>(false);
  private dialogRef: MatDialogRef<unknown> | null = null;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  loadNotifications(): void {
    this.isLoading.set(true);

    this.adminNotificationService
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

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;    // MatPaginator is already zero-based
    this.pageSize  = event.pageSize;
    this.loadNotifications();
  }

  private resetPaginator(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  onStatusFilterChange(value: NotificationStatus | null): void {
    this.filters = { ...this.filters, status: value };
    this.resetPaginator();
    this.loadNotifications();
  }

  onChannelFilterChange(value: NotificationChannel | null): void {
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

  // ---------------------------------------------------------------------------
  // Detail modal
  // ---------------------------------------------------------------------------

  openDetail(notification: AdminNotification): void {
    this.selectedDetail.set(null);
    this.deliveryAttempts.set([]);
    this.isLoadingDetail.set(true);
    this.isLoadingAttempts.set(true);

    // Open the dialog immediately — loading state is shown inside
    this.dialogRef = this.dialog.open(this.detailDialog, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'admin-notification-dialog',
      autoFocus: false,
    });

    // Load notification detail
    this.adminNotificationService
      .getNotification(notification.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingDetail.set(false)))
      .subscribe({
        next: (detail) => this.selectedDetail.set(detail),
        error: () => {
          this.toastr.error('Failed to load notification details.');
          this.dialogRef?.close();
        },
      });

    // Load delivery attempts independently
    this.adminNotificationService
      .getNotificationAttempts(notification.id)
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

  // ---------------------------------------------------------------------------
  // Display helpers
  // ---------------------------------------------------------------------------

  /** Shorten a UUID for table display: show first 8 chars only. */
  shortId(id: string): string {
    return id?.substring(0, 8) ?? '—';
  }

  /** Map a notification status to a StatusChipComponent variant. */
  statusVariant(status: NotificationStatus): StatusVariant {
    switch (status) {
      case 'SENT':             return 'success';
      case 'QUEUED':           return 'info';
      case 'PROCESSING':       return 'warning';
      case 'RETRY_SCHEDULED':  return 'warning';
      case 'FAILED':           return 'error';
      default:                 return 'info';
    }
  }

  /** Icon for the channel column. */
  channelIcon(channel: NotificationChannel): string {
    return channel === 'EMAIL' ? 'email' : 'sms';
  }

  /** Display-safe label for status. */
  statusLabel(status: NotificationStatus): string {
    switch (status) {
      case 'RETRY_SCHEDULED': return 'Retry Scheduled';
      default:                return status.charAt(0) + status.slice(1).toLowerCase();
    }
  }

  /** Render notification variables as key: value lines. */
  variableEntries(variables: Record<string, unknown>): Array<{ key: string; value: string }> {
    if (!variables) return [];
    return Object.entries(variables).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
    }));
  }

  /** Format delivery attempt status with a readable icon. */
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
