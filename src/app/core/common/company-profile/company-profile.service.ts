import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../constants/api-url';
import { API_ENDPOINTS } from '../constants/api.constants';
import { CompanyProfile, UpdateCompanyProfileRequest } from './company-profile.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<CompanyProfile> {
    return this.http.get<CompanyProfile>(apiUrl(API_ENDPOINTS.COMPANY_PROFILE.BASE));
  }

  updateProfile(request: UpdateCompanyProfileRequest): Observable<CompanyProfile> {
    return this.http.put<CompanyProfile>(apiUrl(API_ENDPOINTS.COMPANY_PROFILE.BASE), request);
  }

  uploadLogo(file: File): Observable<CompanyProfile> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<CompanyProfile>(apiUrl(API_ENDPOINTS.COMPANY_PROFILE.LOGO), formData);
  }

  deleteLogo(): Observable<CompanyProfile> {
    return this.http.delete<CompanyProfile>(apiUrl(API_ENDPOINTS.COMPANY_PROFILE.LOGO));
  }
}
