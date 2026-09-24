import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../common/constants/api-url';
import { API_ENDPOINTS } from '../../common/constants/api.constants';
import {
  EmailTemplate,
  EmailTemplatePageResponse,
  EmailTemplateStatus,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  UpdateEmailTemplateStatusRequest,
} from './admin-email-template.models';

export const ADMIN_TEMPLATES_PAGE_SIZE_OPTIONS = [10, 25, 50];
export const ADMIN_TEMPLATES_DEFAULT_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class AdminEmailTemplateService {
  private readonly http = inject(HttpClient);
  private readonly BASE = API_ENDPOINTS.ADMIN.EMAIL_TEMPLATES.BASE;

  getTemplates(
    page: number,
    size: number,
    search?: string | null,
    status?: EmailTemplateStatus | null,
  ): Observable<EmailTemplatePageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<EmailTemplatePageResponse>(apiUrl(this.BASE), { params });
  }

  getTemplate(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(apiUrl(`${this.BASE}/${id}`));
  }

  createTemplate(request: CreateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(apiUrl(this.BASE), request);
  }

  updateTemplate(id: string, request: UpdateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(apiUrl(`${this.BASE}/${id}`), request);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(apiUrl(`${this.BASE}/${id}`));
  }

  updateTemplateStatus(id: string, status: EmailTemplateStatus): Observable<EmailTemplate> {
    const body: UpdateEmailTemplateStatusRequest = { status };
    return this.http.patch<EmailTemplate>(apiUrl(`${this.BASE}/${id}/status`), body);
  }
}
