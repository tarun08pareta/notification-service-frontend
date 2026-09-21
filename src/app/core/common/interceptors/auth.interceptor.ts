import { HttpContextToken, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
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

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

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
                authService.logout();
            }
            return throwError(() => error);
        })
    );
};
