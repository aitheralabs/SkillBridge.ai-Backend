import { CompanyVerificationStatus, Industry } from './enums';

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  industry: Industry | null;
  verificationStatus: CompanyVerificationStatus;
}

export interface CompanyResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: Industry | null;
  websiteUrl: string | null;
  headquartersLocation: string | null;
  verificationStatus: CompanyVerificationStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreate {
  name: string;
  description?: string;
  industry?: Industry;
  websiteUrl?: string;
  headquartersLocation?: string;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {}
