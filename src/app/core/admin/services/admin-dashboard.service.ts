import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../common/constants/api-url';
import { API_ENDPOINTS } from '../constants/admin.constants';
import { AdminDashboardResponse } from './admin-dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);

  getDashboardData(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(apiUrl(API_ENDPOINTS.ADMIN.DASHBOARD.BASE));
  }
}
