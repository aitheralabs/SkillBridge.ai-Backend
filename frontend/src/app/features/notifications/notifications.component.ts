import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse } from '../../core/models/notification.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatPaginatorModule],
  template: `
    <!-- Header -->
    <div class="notif-header-bg">
      <div class="header-glow"></div>
      <div class="header-inner">
        <div class="header-badge">
          <mat-icon>notifications</mat-icon>
          Notifications
        </div>
        <h1>Your <span>Notifications</span></h1>
        <p>{{ total }} notification{{ total !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div class="page-container">
      <!-- Actions bar -->
      <div class="actions-bar">
        <div class="filter-tabs">
          <button class="tab-btn" [class.active]="!unreadOnly" (click)="setFilter(false)">
            All
          </button>
          <button class="tab-btn" [class.active]="unreadOnly" (click)="setFilter(true)">
            Unread
            @if (unreadTotal > 0) {
              <span class="unread-badge">{{ unreadTotal }}</span>
            }
          </button>
        </div>
        @if (unreadTotal > 0) {
          <button mat-stroked-button class="mark-all-btn" (click)="markAllRead()">
            <mat-icon>done_all</mat-icon> Mark all as read
          </button>
        }
      </div>

      @if (loading) {
        <div class="center"><mat-spinner color="accent"></mat-spinner></div>
      }

      @if (!loading) {
        @if (notifications.length === 0) {
          <div class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <h3>No notifications</h3>
            <p>{{ unreadOnly ? 'No unread notifications' : "You're all caught up!" }}</p>
          </div>
        }

        <div class="notif-list">
          @for (n of notifications; track n.id) {
            <div class="notif-card" [class.unread]="!n.readAt" (click)="markRead(n)">
              <div class="notif-icon-col">
                <div class="notif-icon {{ getIconClass(n.type) }}">
                  <mat-icon>{{ getIcon(n.type) }}</mat-icon>
                </div>
              </div>
              <div class="notif-body">
                <div class="notif-top">
                  <div class="notif-title">{{ n.title }}</div>
                  @if (!n.readAt) {
                    <span class="unread-dot"></span>
                  }
                </div>
                <div class="notif-message">{{ n.message }}</div>
                <div class="notif-time">
                  <mat-icon>schedule</mat-icon>
                  {{ n.createdAt | date:'MMM d, y · h:mm a' }}
                </div>
              </div>
            </div>
          }
        </div>

        @if (total > pageSize) {
          <mat-paginator
            [length]="total"
            [pageSize]="pageSize"
            [pageIndex]="page - 1"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            class="paginator">
          </mat-paginator>
        }
      }
    </div>
  `,
  styles: [`
    .notif-header-bg {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      padding: 40px 24px 28px;
      position: relative;
      overflow: hidden;
    }

    .header-glow {
      position: absolute;
      width: 500px; height: 300px;
      background: radial-gradient(ellipse, rgba(108,63,197,0.2) 0%, transparent 70%);
      top: -50px; left: 50%; transform: translateX(-50%);
    }

    .header-inner {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(108,63,197,0.15);
      border: 1px solid rgba(108,63,197,0.3);
      border-radius: 50px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #a78bfa;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .notif-header-bg h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(22px, 3vw, 34px);
      font-weight: 800;
      color: white;
      margin: 0 0 6px;
      span { background: linear-gradient(135deg, #a78bfa, #00e5ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    }

    .notif-header-bg p { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; }

    .actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      background: rgba(108,63,197,0.05);
      border: 1px solid rgba(108,63,197,0.1);
      border-radius: 50px;
      padding: 4px;
    }

    .tab-btn {
      background: none;
      border: none;
      border-radius: 50px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &.active {
        background: white;
        color: #6c3fc5;
        box-shadow: 0 2px 8px rgba(108,63,197,0.15);
      }

      &:not(.active):hover { color: #6c3fc5; }
    }

    .unread-badge {
      background: #6c3fc5;
      color: white;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 50px;
    }

    .mark-all-btn {
      border-color: rgba(108,63,197,0.3) !important;
      color: #6c3fc5 !important;
      border-radius: 50px !important;
      font-size: 13px !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; vertical-align: middle; }
    }

    .center { display: flex; justify-content: center; padding: 64px; }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ddd; }
      h3 { font-size: 20px; color: #555; margin: 16px 0 8px; }
      p { font-size: 14px; color: #aaa; }
    }

    .notif-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }

    .notif-card {
      background: white;
      border-radius: 16px;
      padding: 18px 20px;
      border: 1px solid rgba(108,63,197,0.08);
      border-left: 4px solid transparent;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(108,63,197,0.04);

      &.unread {
        border-left-color: #6c3fc5;
        background: rgba(108,63,197,0.02);
      }

      &:hover { box-shadow: 0 6px 20px rgba(108,63,197,0.1); transform: translateY(-1px); }
    }

    .notif-icon-col { flex-shrink: 0; }

    .notif-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: white; }

      &.app { background: linear-gradient(135deg, #6c3fc5, #9333ea); }
      &.status { background: linear-gradient(135deg, #0097a7, #00bcd4); }
      &.job { background: linear-gradient(135deg, #f57c00, #ffb300); }
      &.system { background: linear-gradient(135deg, #388e3c, #66bb6a); }
      &.default { background: linear-gradient(135deg, #555, #888); }
    }

    .notif-body { flex: 1; }

    .notif-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .notif-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #1a1a2e; }

    .unread-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #6c3fc5;
      flex-shrink: 0;
    }

    .notif-message { font-size: 13px; color: #555; line-height: 1.5; margin-bottom: 6px; }

    .notif-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #aaa;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .paginator { background: transparent; }
  `]
})
export class NotificationsComponent implements OnInit {
  private notifSvc = inject(NotificationService);

  notifications: NotificationResponse[] = [];
  total = 0;
  unreadTotal = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  unreadOnly = false;

  ngOnInit(): void {
    this.load();
    this.loadUnreadCount();
  }

  load(): void {
    this.loading = true;
    this.notifSvc.getNotifications(this.page, this.pageSize, this.unreadOnly).subscribe({
      next: (res) => { this.notifications = res.items; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadUnreadCount(): void {
    this.notifSvc.getNotifications(1, 1, true).subscribe({
      next: (res) => { this.unreadTotal = res.total; }
    });
  }

  setFilter(unreadOnly: boolean): void {
    this.unreadOnly = unreadOnly;
    this.page = 1;
    this.load();
  }

  markRead(n: NotificationResponse): void {
    if (n.readAt) return;
    this.notifSvc.markRead(n.id).subscribe({
      next: (updated) => {
        const idx = this.notifications.findIndex(x => x.id === n.id);
        if (idx >= 0) this.notifications[idx] = updated;
        this.unreadTotal = Math.max(0, this.unreadTotal - 1);
      }
    });
  }

  markAllRead(): void {
    this.notifSvc.markAllRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, readAt: new Date().toISOString() }));
        this.unreadTotal = 0;
      }
    });
  }

  getIcon(type: string): string {
    if (type?.includes('application')) return 'description';
    if (type?.includes('status') || type?.includes('job')) return 'work';
    if (type?.includes('system') || type?.includes('welcome')) return 'info';
    return 'notifications';
  }

  getIconClass(type: string): string {
    if (type?.includes('application')) return 'app';
    if (type?.includes('status')) return 'status';
    if (type?.includes('job')) return 'job';
    if (type?.includes('system') || type?.includes('welcome')) return 'system';
    return 'default';
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }
}
