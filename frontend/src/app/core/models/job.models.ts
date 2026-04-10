import { ApplicationMode, EmploymentType, ExperienceLevel, Industry, JobListingStatus } from './enums';
import { CompanySummary } from './company.models';

export interface JobSummary {
  id: string;
  title: string;
  companyNameSnapshot: string;
  location: string | null;
  employmentType: EmploymentType | null;
  industry: Industry | null;
  experienceLevel: ExperienceLevel | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  applicationMode: ApplicationMode;
  status: JobListingStatus;
  publishedAt: string | null;
  createdAt: string;
}

export interface JobResponse extends JobSummary {
  description: string;
  requiredSkills: string[] | null;
  applicationDeadline: string | null;
  applyUrl: string | null;
  updatedAt: string;
  company: CompanySummary | null;
}

export interface JobCreate {
  title: string;
  description: string;
  location?: string;
  employmentType?: EmploymentType;
  industry?: Industry;
  experienceLevel?: ExperienceLevel;
  requiredSkills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applicationDeadline?: string;
  applicationMode: ApplicationMode;
  applyUrl?: string;
  status: JobListingStatus;
}

export interface JobUpdate extends Partial<JobCreate> {}

export interface JobStatusUpdate {
  status: JobListingStatus;
}

export interface JobSearchParams {
  page?: number;
  pageSize?: number;
  q?: string;
  location?: string;
  industry?: string;
  employmentType?: string;
  experienceLevel?: string;
}
