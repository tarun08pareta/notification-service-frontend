import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../constants/api-url';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface ApiTokenListResponse {
  id: string;
  name: string;
  tokenPrefix: string;
  token:string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface ApiTokenCreateRequest {
  name: string;
}

export interface ApiTokenCreateResponse {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiTokenService {
  private http = inject(HttpClient);

  getApiTokens(): Observable<ApiTokenListResponse[]> {
    return this.http.get<ApiTokenListResponse[]>(apiUrl(API_ENDPOINTS.API_TOKENS.BASE));
  }

  createApiToken(name: string): Observable<ApiTokenCreateResponse> {
    const request: ApiTokenCreateRequest = { name };
    return this.http.post<ApiTokenCreateResponse>(apiUrl(API_ENDPOINTS.API_TOKENS.BASE), request);
  }

  revokeApiToken(tokenId: string): Observable<void> {
    return this.http.delete<void>(apiUrl(`${API_ENDPOINTS.API_TOKENS.BASE}/${tokenId}`));
  }
}
