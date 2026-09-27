import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../constants/api-url';
import { API_ENDPOINTS } from '../constants/api.constants';
import { UserDashboardResponse } from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getDashboardData(): Observable<UserDashboardResponse> {
    return this.http.get<UserDashboardResponse>(apiUrl(API_ENDPOINTS.DASHBOARD.BASE));
  }
}
