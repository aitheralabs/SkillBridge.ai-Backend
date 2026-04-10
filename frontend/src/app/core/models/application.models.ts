import { ApplicationStatus } from './enums';
import { JobSummary } from './job.models';

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobSeekerUserId: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: JobSummary | null;
}

export interface SeekerBrief {
  userId: string;
  fullName: string | null;
  headline: string | null;
  currentLocation: string | null;
}

export interface ApplicationWithSeeker extends ApplicationResponse {
  seeker: SeekerBrief | null;
}

export interface ApplicationCreate {
  coverLetter?: string;
}

export interface ApplicationStatusUpdate {
  status: ApplicationStatus;
  note?: string;
}
