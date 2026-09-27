import { HttpContextToken, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';
import { catchError, throwError } from 'rxjs';

/**
 * Set this context token to true on requests that must NOT carry the
 * Authorization: Bearer JWT header (e.g. X-API-Key playground requests).
 *
 * Rationale: the backend rejects requests that carry both JWT and X-API-Key
 * simultaneously. The 401 handler in this interceptor would also incorrectly
 * log the user out if an X-API-Key request fails.
 */
export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

let isLoggingOut = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const toastService = inject(ToastService);

    // If the caller explicitly requested no JWT header, bypass the interceptor entirely.
    if (req.context.get(SKIP_AUTH_INTERCEPTOR)) {
        return next(req);
    }

    const token = authService.getToken();

    let modifiedReq = req;

    if (token) {
        modifiedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                if (!isLoggingOut) {
                    isLoggingOut = true;
                    toastService.error('Session expired. Please log in again.');
                    authService.logout();
                    
                    // Reset flag after a delay in case the user navigates without a full page reload
                    setTimeout(() => {
                        isLoggingOut = false;
                    }, 5000);
                }
            }
            return throwError(() => error);
        })
    );
};
