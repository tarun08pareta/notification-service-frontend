import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginResponse } from './auth.models';
import { API_ENDPOINTS } from '../constants/api.constants';
import { apiUrl } from '../constants/api-url';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private http        = inject(HttpClient);
  private router      = inject(Router);
  private authService = inject(AuthService);
  private ngZone      = inject(NgZone);

  /** Emits user-facing error messages to GoogleLoginComponent. */
  readonly error$   = new Subject<string>();

  /** Emits true while the popup is open / exchange is in progress. */
  readonly loading$ = new Subject<boolean>();

  private popup:             Window | null                      = null;
  private messageListener:   ((e: MessageEvent) => void) | null = null;
  private popupPollInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * True after the popup sends GOOGLE_LOGIN_CODE or GOOGLE_LOGIN_ERROR.
   * Prevents the popup-closed poll from firing a spurious "cancelled" message
   * after authentication already completed.
   */
  private codeReceived = false;

  private readonly allowedOrigin = environment.frontendUrl;

  // ─── Public API ────────────────────────────────────────────────────────────

  loginWithGoogle(): void {
    this.cleanup();
    this.codeReceived = false;
    this.loading$.next(true);

    const oauthUrl = `${environment.apiBaseUrl}/oauth2/authorization/google`;

    const width  = 500;
    const height = 600;
    const left   = Math.round(window.screenX + (window.outerWidth  - width)  / 2);
    const top    = Math.round(window.screenY + (window.outerHeight - height) / 2);

    this.popup = window.open(
      oauthUrl,
      'google_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},` +
      `toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes`
    );

    if (!this.popup || this.popup.closed) {
      this.loading$.next(false);
      this.error$.next(
        'Popups are blocked by your browser. Please allow popups for this site and try again.'
      );
      return;
    }

    this.registerMessageListener();
    this.pollForPopupClosed();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private registerMessageListener(): void {
    this.messageListener = (event: MessageEvent) => {
      // Strict origin validation — reject anything that is not our own frontend.
      if (event.origin !== this.allowedOrigin) {
        return;
      }

      const data = event.data as { type?: string; code?: string; error?: string };

      if (data?.type === 'GOOGLE_LOGIN_CODE' && data.code) {
        // Mark received BEFORE cleanup so the poll does not fire "cancelled".
        this.codeReceived = true;
        this.cleanup(); // Stop polling; remove listener

        // Exchange runs in the main window — full Angular context, stable HttpClient.
        this.ngZone.run(() => this.exchangeCode(data.code!));

      } else if (data?.type === 'GOOGLE_LOGIN_ERROR') {
        this.codeReceived = true;
        this.cleanup();

        this.ngZone.run(() => {
          this.loading$.next(false);
          this.error$.next(data.error ?? 'Google sign-in failed. Please try again.');
        });
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Polls every 500 ms to detect manual popup closure.
   * Only emits "cancelled" if the popup closed without sending a code.
   */
  private pollForPopupClosed(): void {
    this.popupPollInterval = setInterval(() => {
      if (this.popup?.closed) {
        this.ngZone.run(() => {
          const alreadyHandled = this.codeReceived;
          this.cleanup();

          if (!alreadyHandled) {
            this.loading$.next(false);
            this.error$.next('Google sign-in was cancelled.');
          }
        });
      }
    }, 500);
  }

  /**
   * Exchanges the opaque one-time code for a LoginResponse.
   *
   * Runs entirely in the main window — same HttpClient, same interceptors,
   * same NgRx store as the rest of the application.
   *
   * After AuthService.setUser(), the application state is indistinguishable
   * from a normal email/password login.
   */
  private exchangeCode(code: string): void {
    this.http
      .post<LoginResponse>(apiUrl(API_ENDPOINTS.AUTH.OAUTH2_EXCHANGE), { code })
      .subscribe({
        next: (response) => {
          // Reuse the exact same auth-state path as email/password login.
          this.authService.setUser(
            response.user,
            response.accessToken,
            response.expiresIn
          );
          this.loading$.next(false);
          this.navigateByRole(response);
        },
        error: (err) => {
          this.loading$.next(false);
          if (err.status === 400) {
            this.error$.next('The sign-in session expired. Please try again.');
          } else if (err.status === 401 || err.status === 403) {
            this.error$.next('Your account is not authorized to access this application.');
          } else if (err.status === 0) {
            this.error$.next('Cannot reach the server. Please check your connection and try again.');
          } else {
            this.error$.next(
              err.error?.message ?? 'Google sign-in could not be completed. Please try again.'
            );
          }
        }
      });
  }

  /**
   * Role-based navigation — identical to LoginComponent.onSubmit().
   */
  private navigateByRole(response: LoginResponse): void {
    const roles = response.user?.roles ?? [];
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('USER')) {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.authService.logout();
      this.error$.next(
        'Unauthorized: your account does not have a valid role. Please contact an administrator.'
      );
    }
  }

  private cleanup(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    if (this.popupPollInterval !== null) {
      clearInterval(this.popupPollInterval);
      this.popupPollInterval = null;
    }
    this.popup = null;
  }
}