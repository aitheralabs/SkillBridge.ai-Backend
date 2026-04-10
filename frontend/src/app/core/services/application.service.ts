import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate, ApplicationWithSeeker
} from '../models/application.models';
import { PaginatedResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  applyToJob(jobId: string, data: ApplicationCreate): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(`${this.base}/jobs/${jobId}/apply`, data);
  }

  getMyApplications(page = 1, pageSize = 20): Observable<PaginatedResponse<ApplicationResponse>> {
    return this.http.get<PaginatedResponse<ApplicationResponse>>(`${this.base}/job-seeker/applications`, {
      params: { page, page_size: pageSize }
    });
  }

  withdrawApplication(appId: string): Observable<ApplicationResponse> {
    return this.http.delete<ApplicationResponse>(`${this.base}/job-seeker/applications/${appId}`);
  }

  getJobApplications(jobId: string, page = 1, pageSize = 20): Observable<PaginatedResponse<ApplicationWithSeeker>> {
    return this.http.get<PaginatedResponse<ApplicationWithSeeker>>(
      `${this.base}/recruiter/jobs/${jobId}/applications`,
      { params: { page, page_size: pageSize } }
    );
  }

  updateApplicationStatus(appId: string, data: ApplicationStatusUpdate): Observable<ApplicationWithSeeker> {
    return this.http.patch<ApplicationWithSeeker>(`${this.base}/recruiter/applications/${appId}/status`, data);
  }
}
