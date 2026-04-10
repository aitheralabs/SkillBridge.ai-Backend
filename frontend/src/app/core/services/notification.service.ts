import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { NotificationResponse } from '../models/notification.models';
import { PaginatedResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/me`;

  constructor(private http: HttpClient) {}

  getNotifications(page = 1, pageSize = 20, unreadOnly = false): Observable<PaginatedResponse<NotificationResponse>> {
    return this.http.get<PaginatedResponse<NotificationResponse>>(`${this.base}/notifications`, {
      params: { page, page_size: pageSize, unread_only: unreadOnly }
    });
  }

  markRead(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.base}/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/notifications/read-all`, {});
  }
}
