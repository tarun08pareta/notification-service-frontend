import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../common/constants/api-url';
import { API_ENDPOINTS } from '../../common/constants/api.constants';
import {
  AdminUser,
  AdminUserPageResponse,
  AdminUserStatus,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  UpdateAdminUserStatusRequest,
} from './admin-user.models';

export const ADMIN_USERS_PAGE_SIZE_OPTIONS = [10, 25, 50];
export const ADMIN_USERS_DEFAULT_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly BASE = API_ENDPOINTS.ADMIN.USERS.BASE;

  getUsers(
    page: number,
    size: number,
    search?: string | null,
    status?: AdminUserStatus | null,
    role?: string | null,
    sortBy: string = 'createdAt',
    direction: string = 'desc'
  ): Observable<AdminUserPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
      
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (role) params = params.set('role', role);
    
    return this.http.get<AdminUserPageResponse>(apiUrl(this.BASE), { params });
  }

  getUser(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(apiUrl(`${this.BASE}/${id}`));
  }

  createUser(request: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(apiUrl(this.BASE), request);
  }

  updateUser(id: string, request: UpdateAdminUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(apiUrl(`${this.BASE}/${id}`), request);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(apiUrl(`${this.BASE}/${id}`));
  }

  updateUserStatus(id: string, status: AdminUserStatus): Observable<AdminUser> {
    const body: UpdateAdminUserStatusRequest = { status };
    return this.http.patch<AdminUser>(apiUrl(`${this.BASE}/${id}/status`), body);
  }
}
