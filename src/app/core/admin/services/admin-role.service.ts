import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../common/constants/api-url';
import { API_ENDPOINTS } from '../../common/constants/api.constants';
import {
  AdminRole,
  AdminRolePageResponse,
  AdminRoleStatus,
  CreateAdminRoleRequest,
  UpdateAdminRoleRequest,
  UpdateAdminRoleStatusRequest,
} from './admin-role.models';

export const ADMIN_ROLES_PAGE_SIZE_OPTIONS = [10, 25, 50];
export const ADMIN_ROLES_DEFAULT_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class AdminRoleService {
  private readonly http = inject(HttpClient);
  private readonly BASE = API_ENDPOINTS.ADMIN.ROLES.BASE;

  getRoles(
    page: number,
    size: number,
    search?: string | null,
    status?: AdminRoleStatus | null,
    sortBy: string = 'createdAt',
    direction: string = 'desc'
  ): Observable<AdminRolePageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
      
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    
    return this.http.get<AdminRolePageResponse>(apiUrl(this.BASE), { params });
  }

  getRole(id: string): Observable<AdminRole> {
    return this.http.get<AdminRole>(apiUrl(`${this.BASE}/${id}`));
  }

  createRole(request: CreateAdminRoleRequest): Observable<AdminRole> {
    return this.http.post<AdminRole>(apiUrl(this.BASE), request);
  }

  updateRole(id: string, request: UpdateAdminRoleRequest): Observable<AdminRole> {
    return this.http.put<AdminRole>(apiUrl(`${this.BASE}/${id}`), request);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(apiUrl(`${this.BASE}/${id}`));
  }

  updateRoleStatus(id: string, status: AdminRoleStatus): Observable<AdminRole> {
    const body: UpdateAdminRoleStatusRequest = { status };
    return this.http.patch<AdminRole>(apiUrl(`${this.BASE}/${id}/status`), body);
  }
}
