import { Injectable } from '@angular/core';
import { User } from './auth.models';

export interface AuthData {
  user: User;
  accessToken: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly AUTH_STORAGE_KEY = 'notification_engine_auth';

  setAuth(data: AuthData): void {
    localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(data));
  }

  getAuth(): AuthData | null {
    const data = localStorage.getItem(this.AUTH_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthData;
    } catch {
      return null;
    }
  }

  clearAuth(): void {
    localStorage.removeItem(this.AUTH_STORAGE_KEY);
  }
}
