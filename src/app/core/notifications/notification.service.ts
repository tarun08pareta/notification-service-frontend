import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationRequest, NotificationResponse, DeliveryAttempt } from './notification.models';
import { apiUrl } from '../constants/api-url';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  sendNotification(request: NotificationRequest, idempotencyKey: string): Observable<NotificationResponse> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<NotificationResponse>(apiUrl(API_ENDPOINTS.NOTIFICATIONS.BASE), request, { headers });
  }

  getDeliveryAttempts(notificationId: string): Observable<DeliveryAttempt[]> {
    return this.http.get<DeliveryAttempt[]>(apiUrl(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}/attempts`));
  }
}
