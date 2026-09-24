import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../constants/api-url';
import { API_ENDPOINTS } from '../constants/api.constants';
import { EmailTemplate, EmailTemplatePageResponse } from '../../admin/services/admin-email-template.models';

export const USER_TEMPLATES_PAGE_SIZE_OPTIONS = [10, 25, 50];
export const USER_TEMPLATES_DEFAULT_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class EmailTemplateService {
  private readonly http = inject(HttpClient);
  private readonly BASE = API_ENDPOINTS.EMAIL_TEMPLATES.BASE;

  /**
   * Fetch paginated active email templates for the user-facing view.
   * The backend should only return ACTIVE templates on this endpoint.
   */
  getTemplates(page: number, size: number): Observable<EmailTemplatePageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<EmailTemplatePageResponse>(apiUrl(this.BASE), { params });
  }

  getTemplate(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(apiUrl(`${this.BASE}/${id}`));
  }
}
