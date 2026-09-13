import { environment } from '../../../../environments/environment';

export function apiUrl(endpoint: string): string {
  return `${environment.apiBaseUrl}${endpoint}`;
}
