import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../common/constants/api-url';
import { API_ENDPOINTS } from '../../common/constants/api.constants';
import {
  AdminNotificationPageResponse,
  AdminNotificationDetail,
  AdminNotificationAttempt,
  NotificationStatus,
  NotificationChannel,
} from './admin-notification.models';

/** Default page size for the admin notification table. */
export const ADMIN_NOTIFICATIONS_PAGE_SIZE_OPTIONS = [10, 25, 50];
export const ADMIN_NOTIFICATIONS_DEFAULT_PAGE_SIZE = 10;

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationService {
  private readonly http = inject(HttpClient);
  private readonly BASE = API_ENDPOINTS.ADMIN.NOTIFICATIONS.BASE;

  /**
   * Fetch a page of notifications with optional status/channel filters.
   *
   * The existing authInterceptor automatically attaches the JWT —
   * do NOT manually attach credentials here.
   *
   * @param page  Zero-based page index (MatPaginator.pageIndex)
   * @param size  Page size
   * @param status Optional status filter; omit or null to get all
   * @param channel Optional channel filter; omit or null to get all
   */
  getNotifications(
    page: number,
    size: number,
    status?: NotificationStatus | null,
    channel?: NotificationChannel | null,
  ): Observable<AdminNotificationPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (channel) {
      params = params.set('channel', channel);
    }

    return this.http.get<AdminNotificationPageResponse>(apiUrl(this.BASE), { params });
  }

  /**
   * Fetch the full detail for a single notification.
   * Called when the admin clicks "View" on a table row.
   */
  getNotification(notificationId: string): Observable<AdminNotificationDetail> {
    return this.http.get<AdminNotificationDetail>(
      apiUrl(`${this.BASE}/${notificationId}`),
    );
  }

  /**
   * Fetch delivery attempts for a notification.
   * Called after the detail is loaded so the modal can show attempt history.
   */
  getNotificationAttempts(notificationId: string): Observable<AdminNotificationAttempt[]> {
    return this.http.get<AdminNotificationAttempt[]>(
      apiUrl(`${this.BASE}/${notificationId}/attempts`),
    );
  }
}
