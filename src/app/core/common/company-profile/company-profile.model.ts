export interface CompanyProfile {
  id: string | null;
  companyName: string;
  logoUrl: string | null;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  smsSenderId: string;
  smsSenderNumber: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateCompanyProfileRequest {
  companyName: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  smsSenderId: string;
  smsSenderNumber: string;
}
