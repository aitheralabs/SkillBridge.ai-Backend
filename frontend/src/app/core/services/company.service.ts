import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CompanyCreate, CompanyResponse, CompanyUpdate } from '../models/company.models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private base = `${environment.apiUrl}/recruiter/company`;

  constructor(private http: HttpClient) {}

  getMyCompany(): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(this.base);
  }

  createCompany(data: CompanyCreate): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(this.base, data);
  }

  updateCompany(data: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.patch<CompanyResponse>(this.base, data);
  }
}
