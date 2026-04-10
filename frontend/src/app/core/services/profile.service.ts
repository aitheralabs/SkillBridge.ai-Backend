import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  EducationCreate, EducationResponse, ExperienceCreate, ExperienceResponse,
  PreferencesResponse, PreferencesUpsert, ProfileResponse, ProfileUpdate,
  SkillCreate, SkillResponse
} from '../models/profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = `${environment.apiUrl}/job-seeker`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.base}/profile`);
  }

  updateProfile(data: ProfileUpdate): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(`${this.base}/profile`, data);
  }

  addEducation(data: EducationCreate): Observable<EducationResponse> {
    return this.http.post<EducationResponse>(`${this.base}/profile/education`, data);
  }

  updateEducation(id: string, data: EducationCreate): Observable<EducationResponse> {
    return this.http.put<EducationResponse>(`${this.base}/profile/education/${id}`, data);
  }

  deleteEducation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/profile/education/${id}`);
  }

  addExperience(data: ExperienceCreate): Observable<ExperienceResponse> {
    return this.http.post<ExperienceResponse>(`${this.base}/profile/experience`, data);
  }

  updateExperience(id: string, data: ExperienceCreate): Observable<ExperienceResponse> {
    return this.http.put<ExperienceResponse>(`${this.base}/profile/experience/${id}`, data);
  }

  deleteExperience(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/profile/experience/${id}`);
  }

  addSkill(data: SkillCreate): Observable<SkillResponse> {
    return this.http.post<SkillResponse>(`${this.base}/profile/skills`, data);
  }

  deleteSkill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/profile/skills/${id}`);
  }

  getPreferences(): Observable<PreferencesResponse | null> {
    return this.http.get<PreferencesResponse | null>(`${this.base}/profile/preferences`);
  }

  upsertPreferences(data: PreferencesUpsert): Observable<PreferencesResponse> {
    return this.http.put<PreferencesResponse>(`${this.base}/profile/preferences`, data);
  }
}
