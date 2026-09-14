import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginResponse, LoginRequest, SignupRequest } from './auth.models';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../constants/api.constants';
import { apiUrl } from '../constants/api-url';
import { Store } from '@ngrx/store';
import { AuthStorageService } from './auth-storage.service';
import { loginSuccess, logout } from '../store/auth/auth.actions';
import { selectCurrentUser, selectIsAuthenticated, selectUserRoles, selectAccessToken } from '../store/auth/auth.selectors';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private store = inject(Store);
    private authStorage = inject(AuthStorageService);

    currentUser = this.store.selectSignal(selectCurrentUser);
    isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
    private currentRoles = this.store.selectSignal(selectUserRoles);
    private currentToken = this.store.selectSignal(selectAccessToken);

    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(apiUrl(API_ENDPOINTS.AUTH.LOGIN), request).pipe(
            tap(response => {
                this.setUser(response.user, response.accessToken, response.expiresIn);
            })
        );
    }

    signup(request: SignupRequest): Observable<User> {
        return this.http.post<User>(apiUrl(API_ENDPOINTS.AUTH.SIGNUP), request);
    }

    setUser(user: User, accessToken: string, expiresIn: number) {
        // Update reactive source of truth
        this.store.dispatch(loginSuccess({ user, accessToken, expiresIn }));
        
        // Persist to localStorage
        this.authStorage.setAuth({ user, accessToken, expiresIn });
    }

    logout() {
        this.authStorage.clearAuth();
        this.store.dispatch(logout());
        this.router.navigate(['/login']);
    }

    hasRole(role: string): boolean {
        const roles = this.currentRoles();
        return roles ? roles.includes(role) : false;
    }

    hasAnyRole(roles: string[]): boolean {
        const currentRoles = this.currentRoles();
        if (!currentRoles) return false;
        return roles.some(role => currentRoles.includes(role));
    }

    getToken(): string | null {
        // Read directly from synchronous signal (NgRx state)
        return this.currentToken() || null;
    }
}
