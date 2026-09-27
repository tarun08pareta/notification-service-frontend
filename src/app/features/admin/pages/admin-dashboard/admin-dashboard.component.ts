import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AdminDashboardService } from '../../../../core/admin/services/admin-dashboard.service';
import { AdminDashboardResponse, AdminDashboardRecentFailure } from '../../../../core/admin/services/admin-dashboard.models';
import { ToastService } from '../../../../core/common/toast/toast.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

export interface StatCard {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  iconBg: string;
  subtitle: string;
  subtitleColor: string;
  chartColor?: string;
  chartData?: number[];
}

export interface ChannelData {
  name: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  count: number;
  percentage: number;
  barColor: string;
}

export interface ProviderData {
  name: string;
  icon: string;
  status: 'Enabled' | 'Disabled';
  priority: number;
  lastEvent: string;
  lastEventTime: string;
  lastEventType: 'success' | 'failure' | 'none';
}

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AdminNotificationModalComponent } from '../notifications/admin-notification-modal/admin-notification-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    EmptyStateComponent,
    DatePipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  providers: [DatePipe]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(AdminDashboardService);
  private readonly toastService = inject(ToastService);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  isLoading = signal(true);
  currentDate = new Date();

  stats = signal<StatCard[]>([]);
  channels = signal<ChannelData[]>([]);
  providers = signal<ProviderData[]>([]);
  recentFailedNotifications = signal<AdminDashboardRecentFailure[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.buildStats(data);
          this.buildChannels(data);
          this.buildProviders(data);
          this.recentFailedNotifications.set(data.recentFailures || []);
        },
        error: () => {
          this.toastService.error('Failed to load admin dashboard data.');
        }
      });
  }

  private buildStats(data: AdminDashboardResponse): void {
    this.stats.set([
      {
        title: 'Total Users',
        value: data.statistics.totalUsers,
        icon: 'person_add',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        subtitle: 'Active users in the system',
        subtitleColor: 'text-slate-500 dark:text-slate-400',
      },
      {
        title: 'Total Notifications',
        value: data.statistics.totalNotifications,
        icon: 'send',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        subtitle: 'Total recorded',
        subtitleColor: 'text-emerald-600 dark:text-emerald-400',
        chartColor: 'bg-blue-300 dark:bg-blue-700',
        chartData: [30, 50, 40, 70, 60, 90]
      },
      {
        title: 'Sent',
        value: data.statistics.sent,
        icon: 'check_circle',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        subtitle: data.statistics.totalNotifications > 0 ? `${(data.statistics.sent / data.statistics.totalNotifications * 100).toFixed(1)}% of total` : '0%',
        subtitleColor: 'text-emerald-600 dark:text-emerald-400',
        chartColor: 'bg-emerald-300 dark:bg-emerald-700',
        chartData: [40, 60, 55, 80, 75, 100]
      },
      {
        title: 'Failed',
        value: data.statistics.failed,
        icon: 'error',
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-50 dark:bg-rose-900/20',
        subtitle: data.statistics.totalNotifications > 0 ? `${(data.statistics.failed / data.statistics.totalNotifications * 100).toFixed(1)}% of total` : '0%',
        subtitleColor: 'text-rose-600 dark:text-rose-400',
        chartColor: 'bg-rose-300 dark:bg-rose-700',
        chartData: [10, 20, 15, 30, 25, 40]
      },
      {
        title: 'Queued',
        value: data.statistics.queued,
        icon: 'schedule',
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-900/20',
        subtitle: data.statistics.totalNotifications > 0 ? `${(data.statistics.queued / data.statistics.totalNotifications * 100).toFixed(1)}% of total` : '0%',
        subtitleColor: 'text-amber-600 dark:text-amber-400',
        chartColor: 'bg-amber-300 dark:bg-amber-700',
        chartData: [15, 25, 20, 35, 30, 45]
      },
      {
        title: 'Retry Scheduled',
        value: data.statistics.retryScheduled,
        icon: 'refresh',
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        subtitle: data.statistics.totalNotifications > 0 ? `${(data.statistics.retryScheduled / data.statistics.totalNotifications * 100).toFixed(1)}% of total` : '0%',
        subtitleColor: 'text-purple-600 dark:text-purple-400',
        chartColor: 'bg-purple-300 dark:bg-purple-700',
        chartData: [20, 20, 25, 25, 30, 30]
      }
    ]);
  }

  private buildChannels(data: AdminDashboardResponse): void {
    const total = (data.channels.email || 0) + (data.channels.sms || 0);
    
    let emailPerc = 0;
    let smsPerc = 0;
    if (total > 0) {
      emailPerc = Math.round((data.channels.email / total) * 1000) / 10;
      smsPerc = Math.round((data.channels.sms / total) * 1000) / 10;
    }

    this.channels.set([
      {
        name: 'Email Notifications',
        icon: 'email',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800',
        count: data.channels.email || 0,
        percentage: emailPerc,
        barColor: 'bg-blue-500'
      },
      {
        name: 'SMS Notifications',
        icon: 'chat',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800',
        count: data.channels.sms || 0,
        percentage: smsPerc,
        barColor: 'bg-emerald-500'
      }
    ]);
  }

  private buildProviders(data: AdminDashboardResponse): void {
    const providerList = (data.providers || []).map(p => {
      let icon = 'settings';
      if (p.provider.toLowerCase().includes('email')) {
        icon = 'email';
      } else if (p.provider.toLowerCase().includes('sms')) {
        icon = 'chat';
      }

      // Determine last event
      let lastEvent = 'No events';
      let lastEventTime = '-';
      let lastEventType: 'success' | 'failure' | 'none' = 'none';

      const lastS = p.lastSuccessAt ? new Date(p.lastSuccessAt).getTime() : 0;
      const lastF = p.lastFailureAt ? new Date(p.lastFailureAt).getTime() : 0;

      if (lastS > 0 || lastF > 0) {
        if (lastS >= lastF) {
          lastEvent = 'Last Success';
          lastEventTime = this.datePipe.transform(p.lastSuccessAt, 'short') || '-';
          lastEventType = 'success';
        } else {
          lastEvent = 'Last Failure';
          lastEventTime = this.datePipe.transform(p.lastFailureAt, 'short') || '-';
          lastEventType = 'failure';
        }
      }

      return {
        name: p.provider,
        icon,
        status: p.enabled ? 'Enabled' : 'Disabled',
        priority: p.priority,
        lastEvent,
        lastEventTime,
        lastEventType
      } as ProviderData;
    });

    this.providers.set(providerList);
  }

  getTotalNotificationsCount(): number {
    if (this.stats().length > 1) {
      return this.stats()[1].value;
    }
    return 0;
  }

  viewAllFailedNotifications(): void {
    this.router.navigate(['/admin/notifications'], { 
      queryParams: { status: 'FAILED' } 
    });
  }

  openNotificationDetail(notificationId: string): void {
    this.dialog.open(AdminNotificationModalComponent, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'admin-notification-dialog',
      autoFocus: false,
      data: { id: notificationId }
    });
  }
}