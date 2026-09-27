import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { DashboardService } from '../../../../core/common/dashboard/dashboard.service';
import { UserDashboardResponse, UserDashboardRecentNotification } from '../../../../core/common/dashboard/dashboard.models';
import { ToastService } from '../../../../core/common/toast/toast.service';
import { AuthService } from '../../../../core/common/auth/auth.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

import { MatDialog } from '@angular/material/dialog';
import { UserNotificationModalComponent } from '../notifications/user-notification-modal/user-notification-modal.component';

export interface StatCard {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  iconBg: string;
  trendValue: string;
  trendText: string;
  trendType: 'up' | 'down' | 'neutral';
  chartColor: string;
  chartData: number[];
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule,
    EmptyStateComponent,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  isLoading = signal(true);
  userName = signal('User');
  currentDate = new Date();

  stats = signal<StatCard[]>([]);
  channels = signal<ChannelData[]>([]);
  recentNotifications = signal<UserDashboardRecentNotification[]>([]);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(user.name.split(' ')[0]);
    }
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
          this.recentNotifications.set(data.recentNotifications || []);
        },
        error: () => {
          this.toastService.error('Failed to load dashboard data.');
        }
      });
  }

  private buildStats(data: UserDashboardResponse): void {
    this.stats.set([
      {
        title: 'Total Notifications',
        value: data.statistics.totalNotifications,
        icon: 'send',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        trendValue: '-',
        trendText: 'since last week',
        trendType: 'neutral',
        chartColor: 'bg-blue-300 dark:bg-blue-700',
        chartData: [30, 50, 40, 70, 60, 90]
      },
      {
        title: 'Sent',
        value: data.statistics.sent,
        icon: 'check_circle',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        trendValue: '-',
        trendText: 'since last week',
        trendType: 'neutral',
        chartColor: 'bg-emerald-300 dark:bg-emerald-700',
        chartData: [40, 60, 55, 80, 75, 100]
      },
      {
        title: 'Failed',
        value: data.statistics.failed,
        icon: 'error',
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-50 dark:bg-rose-900/20',
        trendValue: '-',
        trendText: 'since last week',
        trendType: 'neutral',
        chartColor: 'bg-rose-300 dark:bg-rose-700',
        chartData: [10, 20, 15, 30, 25, 40]
      },
      {
        title: 'Queued',
        value: data.statistics.queued,
        icon: 'schedule',
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-900/20',
        trendValue: '-',
        trendText: 'since last week',
        trendType: 'neutral',
        chartColor: 'bg-amber-300 dark:bg-amber-700',
        chartData: [15, 25, 20, 35, 30, 45]
      },
      {
        title: 'Retry Scheduled',
        value: data.statistics.retryScheduled,
        icon: 'refresh',
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        trendValue: '-',
        trendText: 'since last week',
        trendType: 'neutral',
        chartColor: 'bg-purple-300 dark:bg-purple-700',
        chartData: [20, 20, 25, 25, 30, 30]
      }
    ]);
  }

  private buildChannels(data: UserDashboardResponse): void {
    const total = (data.channels.email || 0) + (data.channels.sms || 0);
    
    let emailPerc = 0;
    let smsPerc = 0;
    if (total > 0) {
      emailPerc = Math.round((data.channels.email / total) * 1000) / 10;
      smsPerc = Math.round((data.channels.sms / total) * 1000) / 10;
    }

    this.channels.set([
      {
        name: 'Email',
        icon: 'email',
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800',
        count: data.channels.email || 0,
        percentage: emailPerc,
        barColor: 'bg-blue-500'
      },
      {
        name: 'SMS',
        icon: 'chat',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800',
        count: data.channels.sms || 0,
        percentage: smsPerc,
        barColor: 'bg-emerald-500'
      }
    ]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'SENT':
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'FAILED':
        return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
      case 'QUEUED':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'RETRY_SCHEDULED':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-900/50';
    }
  }

  getStatusDotClasses(status: string): string {
    switch (status) {
      case 'SENT': return 'bg-emerald-500';
      case 'FAILED': return 'bg-rose-500';
      case 'QUEUED': return 'bg-amber-500';
      case 'RETRY_SCHEDULED': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  }

  viewAllNotifications(): void {
    this.router.navigate(['/user/notifications']);
  }

  openNotificationDetail(notificationId: string): void {
    this.dialog.open(UserNotificationModalComponent, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'user-notification-dialog',
      autoFocus: false,
      data: { id: notificationId }
    });
  }
}