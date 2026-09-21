import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotificationRequest,
  NotificationResponse,
  DeliveryAttempt,
} from './notification.models';
import { apiUrl } from '../constants/api-url';
import { API_ENDPOINTS } from '../constants/api.constants';
import { SKIP_GLOBAL_LOADER } from '../interceptors/loader.interceptor';
import { SKIP_AUTH_INTERCEPTOR } from '../interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  /**
   * Send a notification using JWT authentication (standard dashboard flow).
   */
  sendNotification(
    request: NotificationRequest,
    idempotencyKey: string,
  ): Observable<NotificationResponse> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<NotificationResponse>(
      apiUrl(API_ENDPOINTS.NOTIFICATIONS.BASE),
      request,
      { headers },
    );
  }

  /**
   * Send a notification using X-API-Key authentication (Playground flow).
   *
   * Uses the X-API-Key header as required by ApiTokenAuthenticationFilter.
   * SKIP_AUTH_INTERCEPTOR prevents the auth interceptor from adding
   * "Authorization: Bearer JWT" — the backend rejects requests that carry
   * both JWT and X-API-Key simultaneously, and Spring Security then
   * falls through to an OAuth2 redirect.
   * SKIP_GLOBAL_LOADER lets the Playground manage its own loading spinner.
   * The full API token value is ONLY used here — never stored or logged.
   */
  sendWithApiKey(
    request: NotificationRequest,
    idempotencyKey: string,
    apiToken: string,
  ): Observable<NotificationResponse> {
    const headers = new HttpHeaders()
      .set('X-API-Key', apiToken)
      .set('Idempotency-Key', idempotencyKey);
    const context = new HttpContext()
      .set(SKIP_AUTH_INTERCEPTOR, true)
      .set(SKIP_GLOBAL_LOADER, true);
    return this.http.post<NotificationResponse>(
      apiUrl(API_ENDPOINTS.NOTIFICATIONS.BASE),
      request,
      { headers, context },
    );
  }

  /**
   * Fetch delivery attempts for a given notification.
   * Uses JWT authentication via the existing auth interceptor.
   */
  getDeliveryAttempts(notificationId: string): Observable<DeliveryAttempt[]> {
    return this.http.get<DeliveryAttempt[]>(
      apiUrl(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}/attempts`),
      {
        context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
      },
    );
  }
}
