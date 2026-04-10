import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { JobCreate, JobResponse, JobSearchParams, JobStatusUpdate, JobUpdate } from '../models/job.models';
import { PaginatedResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchJobs(params: JobSearchParams): Observable<PaginatedResponse<any>> {
    let p = new HttpParams();
    if (params.page) p = p.set('page', params.page);
    if (params.pageSize) p = p.set('page_size', params.pageSize);
    if (params.q) p = p.set('q', params.q);
    if (params.location) p = p.set('location', params.location);
    if (params.industry) p = p.set('industry', params.industry);
    if (params.employmentType) p = p.set('employment_type', params.employmentType);
    if (params.experienceLevel) p = p.set('experience_level', params.experienceLevel);
    return this.http.get<PaginatedResponse<any>>(`${this.base}/jobs`, { params: p });
  }

  getPublicJob(id: string): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.base}/jobs/${id}`);
  }

  // Recruiter endpoints
  listMyJobs(page = 1, pageSize = 20): Observable<PaginatedResponse<JobResponse>> {
    return this.http.get<PaginatedResponse<JobResponse>>(`${this.base}/recruiter/jobs`, {
      params: { page, page_size: pageSize }
    });
  }

  createJob(data: JobCreate): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.base}/recruiter/jobs`, data);
  }

  getMyJob(id: string): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.base}/recruiter/jobs/${id}`);
  }

  updateJob(id: string, data: JobUpdate): Observable<JobResponse> {
    return this.http.patch<JobResponse>(`${this.base}/recruiter/jobs/${id}`, data);
  }

  updateJobStatus(id: string, data: JobStatusUpdate): Observable<JobResponse> {
    return this.http.patch<JobResponse>(`${this.base}/recruiter/jobs/${id}/status`, data);
  }
}
