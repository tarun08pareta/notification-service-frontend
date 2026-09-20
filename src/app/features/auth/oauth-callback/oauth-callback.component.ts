import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

/**
 * OAuthCallbackComponent — runs ONLY inside the popup window.
 *
 * Route: /auth/google/callback  (top-level in app.routes.ts, no layout wrapper)
 *
 * This component is intentionally minimal:
 *   1. Reads the one-time opaque `code` from the URL query param.
 *      (Placed there by GoogleOAuth2SuccessHandler via response.sendRedirect)
 *   2. Forwards the code to the MAIN window via window.opener.postMessage.
 *      The main window's GoogleAuthService receives it and performs the HTTP
 *      exchange — so all HttpClient / interceptor / NgRx store work happens
 *      in the main window, not in this isolated popup instance.
 *   3. Shows a brief "Completing sign-in..." message.
 *   4. Closes itself.
 *
 * Why no HttpClient here:
 *   Keeping the popup as a dumb relay avoids a second Angular bootstrap with
 *   its own isolated NgRx store, and prevents any CORS or interceptor
 *   issues that can occur in a short-lived popup context.
 *
 * Security:
 *   - targetOrigin is set to environment.frontendUrl — never '*'.
 *   - The code is an opaque UUID; it is not the JWT.
 *   - The main window validates event.origin before processing the message.
 */
@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-callback.component.html',
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);

  hasError     = false;
  errorMessage = '';

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const code   = params.get('code');
    const error  = params.get('error');

    if (error || !code) {
      // Backend reported an error (e.g. email_unavailable), or no code present.
      const message = this.friendlyError(error);
      this.hasError     = true;
      this.errorMessage = message;
      this.postToOpener({ type: 'GOOGLE_LOGIN_ERROR', error: message });
      this.scheduleClose(1500);
      return;
    }

    // Happy path: relay the opaque code to the main window and close.
    // The main window performs the actual HTTP exchange.
    this.postToOpener({ type: 'GOOGLE_LOGIN_CODE', code });
    this.scheduleClose(300);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private postToOpener(message: Record<string, string>): void {
    try {
      if (window.opener && !window.opener.closed) {
        const targetOrigin = environment.frontendUrl ?? window.location.origin;
        window.opener.postMessage(message, targetOrigin);
      }
    } catch {
      // window.opener may be cross-origin in some edge cases — ignore silently.
    }
  }

  private scheduleClose(delayMs: number): void {
    setTimeout(() => window.close(), delayMs);
  }

  private friendlyError(error: string | null): string {
    switch (error) {
      case 'email_unavailable':
        return 'Google did not provide an email address. Please use an account with a verified email.';
      default:
        return 'Google sign-in could not be completed. Please try again.';
    }
  }
}