/**
 * TypeScript interfaces for the Email Template API.
 * Field names match the backend response contract exactly.
 */

export type EmailTemplateStatus = 'ACTIVE' | 'INACTIVE';
export type TemplateVariableSource = 'COMPANY_PROFILE' | 'PLAYGROUND' | 'USER' | 'EVENT' | (string & {});

export interface TemplateVariable {
  key: string;
  source: TemplateVariableSource;
  required: boolean;
}

// ---------------------------------------------------------------------------
// Core model
// ---------------------------------------------------------------------------

export interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string | null;
  status: EmailTemplateStatus;
  version: number;
  variables?: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Paginated response
// ---------------------------------------------------------------------------

export interface EmailTemplatePageResponse {
  content: EmailTemplate[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ---------------------------------------------------------------------------
// Request types (admin)
// ---------------------------------------------------------------------------

export interface CreateEmailTemplateRequest {
  code: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: TemplateVariable[];
}

export interface UpdateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: TemplateVariable[];
}

export interface UpdateEmailTemplateStatusRequest {
  status: EmailTemplateStatus;
}
