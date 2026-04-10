import { EmploymentType } from './enums';

export interface EducationResponse {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  isCurrent: boolean;
  description: string | null;
  sortOrder: number;
}

export interface ExperienceResponse {
  id: string;
  companyName: string;
  title: string;
  employmentType: EmploymentType | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  sortOrder: number;
}

export interface SkillResponse {
  id: string;
  name: string;
  level: string | null;
  sortOrder: number;
}

export interface PreferencesResponse {
  id: string;
  desiredRoles: string[] | null;
  preferredLocations: string[] | null;
  employmentTypes: string[] | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  remoteOnly: boolean;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  currentLocation: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  resumeUrl: string | null;
  visibility: string;
  openToWork: boolean;
  educations: EducationResponse[];
  experiences: ExperienceResponse[];
  skills: SkillResponse[];
  preferences: PreferencesResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdate {
  fullName?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  currentLocation?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  visibility?: string;
  openToWork?: boolean;
}

export interface EducationCreate {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  isCurrent?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface ExperienceCreate {
  companyName: string;
  title: string;
  employmentType?: EmploymentType;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface SkillCreate {
  name: string;
  level?: string;
  sortOrder?: number;
}

export interface PreferencesUpsert {
  desiredRoles?: string[];
  preferredLocations?: string[];
  employmentTypes?: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  remoteOnly?: boolean;
}
