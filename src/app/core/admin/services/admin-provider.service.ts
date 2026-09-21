import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../common/constants/api-url';
import { API_ENDPOINTS } from '../constants/admin.constants';
import { AdminProvider } from '../models/admin-provider.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProviderService {
  private readonly http = inject(HttpClient);

  getProviders(): Observable<AdminProvider[]> {
    return this.http.get<AdminProvider[]>(apiUrl(API_ENDPOINTS.ADMIN.PROVIDERS.BASE));
  }

  updateProviderEnabledState(providerName: string, enabled: boolean): Observable<AdminProvider> {
    return this.http.patch<AdminProvider>(
      apiUrl(API_ENDPOINTS.ADMIN.PROVIDERS.ENABLED(providerName)),
      { enabled }
    );
  }

  updateProviderPriority(providerName: string, priority: number): Observable<AdminProvider> {
    return this.http.patch<AdminProvider>(
      apiUrl(API_ENDPOINTS.ADMIN.PROVIDERS.PRIORITY(providerName)),
      { priority }
    );
  }
}