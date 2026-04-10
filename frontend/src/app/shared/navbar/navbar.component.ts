import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse } from '../../core/models/notification.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="brand">
          <span class="brand-icon">✦</span>
          Skill<span class="brand-accent">Bridge</span>
          <span class="brand-tag">AI</span>
        </a>

        <div class="nav-links">
          <a mat-button routerLink="/jobs" routerLinkActive="active-link" class="nav-btn">
            <mat-icon>work_outline</mat-icon> Browse Jobs
          </a>

          @if (!auth.isLoggedIn()) {
            <a mat-button routerLink="/auth/login" class="nav-btn">Sign In</a>
            <a mat-raised-button routerLink="/auth/register" class="nav-cta">Get Started</a>
          }

          @if (auth.isJobSeeker()) {
            <a mat-button routerLink="/seeker/dashboard" routerLinkActive="active-link" class="nav-btn">
              <mat-icon>dashboard</mat-icon> Dashboard
            </a>
            <a mat-button routerLink="/seeker/profile" routerLinkActive="active-link" class="nav-btn">
              <mat-icon>person</mat-icon> Profile
            </a>
            <a mat-button routerLink="/seeker/applications" routerLinkActive="active-link" class="nav-btn">
              <mat-icon>description</mat-icon> Applications
            </a>
          }

          @if (auth.isRecruiter()) {
            <a mat-button routerLink="/recruiter/dashboard" routerLinkActive="active-link" class="nav-btn">
              <mat-icon>dashboard</mat-icon> Dashboard
            </a>
            <a mat-button routerLink="/recruiter/jobs/new" class="nav-btn post-job-btn">
              <mat-icon>add_circle</mat-icon> Post Job
            </a>
            <a mat-button routerLink="/recruiter/jobs" routerLinkActive="active-link" class="nav-btn">
              <mat-icon>work</mat-icon> Jobs
            </a>
            <a mat-button routerLink="/recruiter/company" routerLinkActive="active-link" class="nav-btn">
              <mat-icon>business</mat-icon> Company
            </a>
          }

          @if (auth.isLoggedIn()) {
            <!-- Notifications Bell -->
            <button mat-icon-button class="notif-btn" [matMenuTriggerFor]="notifMenu"
                    (menuOpened)="onNotifOpen()">
              <mat-icon [matBadge]="unreadCount() || null" matBadgeColor="warn"
                        matBadgeSize="small">notifications</mat-icon>
            </button>
            <mat-menu #notifMenu="matMenu" class="notif-menu-panel">
              <div class="notif-header" (click)="$event.stopPropagation()">
                <span>Notifications</span>
                @if (unreadCount() > 0) {
                  <button class="mark-all-btn" (click)="markAllRead()">Mark all read</button>
                }
              </div>
              @if (notifications().length === 0) {
                <div class="notif-empty">
                  <mat-icon>notifications_none</mat-icon>
                  <p>No notifications</p>
                </div>
              }
              @for (n of notifications(); track n.id) {
                <button mat-menu-item class="notif-item" [class.unread]="!n.readAt"
                        (click)="markRead(n)">
                  <div class="notif-dot" [class.visible]="!n.readAt"></div>
                  <div class="notif-content">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-msg">{{ n.message }}</div>
                    <div class="notif-time">{{ n.createdAt | date:'MMM d, h:mm a' }}</div>
                  </div>
                </button>
              }
              @if (notifications().length > 0) {
                <a mat-menu-item routerLink="/notifications" class="view-all-notifs">
                  View all notifications
                </a>
              }
            </mat-menu>

            <!-- User Avatar Menu -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="avatar-btn">
              <div class="avatar-circle">{{ userInitial }}</div>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header">
                <div class="user-email">{{ auth.user()?.email }}</div>
                <div class="user-role">{{ auth.user()?.role | titlecase }}</div>
              </div>
              @if (auth.isJobSeeker()) {
                <a mat-menu-item routerLink="/seeker/profile">
                  <mat-icon>person</mat-icon> My Profile
                </a>
                <a mat-menu-item routerLink="/seeker/applications">
                  <mat-icon>description</mat-icon> My Applications
                </a>
              }
              @if (auth.isRecruiter()) {
                <a mat-menu-item routerLink="/recruiter/company">
                  <mat-icon>business</mat-icon> My Company
                </a>
                <a mat-menu-item routerLink="/recruiter/jobs">
                  <mat-icon>work</mat-icon> My Jobs
                </a>
              }
              <div class="menu-divider"></div>
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(10, 10, 26, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(108, 63, 197, 0.3);
      box-shadow: 0 4px 30px rgba(0,0,0,0.3);
    }

    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 20px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: white;
    }

    .brand-icon { color: #00e5ff; font-size: 18px; animation: pulse 2s infinite; }
    .brand-accent { color: #00e5ff; }

    .brand-tag {
      font-size: 10px;
      font-weight: 700;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      padding: 2px 7px;
      border-radius: 50px;
      letter-spacing: 1px;
    }

    .nav-links { display: flex; align-items: center; gap: 2px; }

    .nav-btn {
      color: rgba(255,255,255,0.7) !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      transition: all 0.2s !important;
      padding: 0 10px !important;

      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; vertical-align: middle; }
      &:hover { color: white !important; background: rgba(108,63,197,0.2) !important; }
    }

    .active-link { color: #00e5ff !important; background: rgba(0,229,255,0.08) !important; }

    .post-job-btn {
      color: #a78bfa !important;
      border: 1px solid rgba(108,63,197,0.4) !important;
      border-radius: 50px !important;
      &:hover { background: rgba(108,63,197,0.2) !important; }
    }

    .nav-cta {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      font-weight: 600 !important;
      padding: 0 20px !important;
      box-shadow: 0 4px 15px rgba(108,63,197,0.4) !important;
      margin-left: 4px !important;
    }

    .notif-btn {
      color: rgba(255,255,255,0.7) !important;
      margin-left: 4px !important;
      &:hover { color: white !important; }
    }

    ::ng-deep .mat-badge-content { font-size: 9px !important; min-width: 16px !important; height: 16px !important; line-height: 16px !important; }

    .avatar-btn { margin-left: 4px !important; }

    .avatar-circle {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Notification menu panel */
    ::ng-deep .notif-menu-panel .mat-mdc-menu-panel {
      max-width: 360px !important;
      width: 360px !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: #1a1a2e;
      border-bottom: 1px solid rgba(108,63,197,0.1);
    }

    .mark-all-btn {
      background: none;
      border: none;
      color: #6c3fc5;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      &:hover { text-decoration: underline; }
    }

    .notif-empty {
      text-align: center;
      padding: 28px 20px;
      color: #aaa;
      mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.4; }
      p { font-size: 13px; margin: 8px 0 0; }
    }

    .notif-item {
      display: flex !important;
      align-items: flex-start !important;
      gap: 10px !important;
      padding: 10px 16px !important;
      height: auto !important;
      min-height: 56px !important;
      border-left: 3px solid transparent !important;

      &.unread { border-left-color: #6c3fc5 !important; background: rgba(108,63,197,0.03) !important; }
    }

    .notif-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #6c3fc5;
      flex-shrink: 0;
      margin-top: 5px;
      opacity: 0;
      &.visible { opacity: 1; }
    }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px; white-space: normal; }
    .notif-msg { font-size: 12px; color: #666; white-space: normal; line-height: 1.4; margin-bottom: 4px; }
    .notif-time { font-size: 11px; color: #bbb; }

    .view-all-notifs {
      text-align: center;
      color: #6c3fc5 !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      border-top: 1px solid rgba(108,63,197,0.1) !important;
    }

    /* User menu */
    ::ng-deep .mat-mdc-menu-panel { border-radius: 14px !important; }

    .user-menu-header {
      padding: 12px 16px 8px;
      border-bottom: 1px solid rgba(108,63,197,0.1);
      margin-bottom: 4px;
    }

    .user-email { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .user-role { font-size: 11px; color: #888; margin-top: 1px; text-transform: capitalize; }
    .menu-divider { height: 1px; background: rgba(108,63,197,0.1); margin: 4px 0; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  private notifSvc = inject(NotificationService);

  notifications = signal<NotificationResponse[]>([]);
  unreadCount = signal(0);

  get userInitial(): string {
    const email = this.auth.user()?.email || '';
    return email[0]?.toUpperCase() || '?';
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notifSvc.getNotifications(1, 10).subscribe({
      next: (res) => {
        this.notifications.set(res.items);
        this.unreadCount.set(res.items.filter(n => !n.readAt).length);
      }
    });
  }

  onNotifOpen(): void {
    this.loadNotifications();
  }

  markRead(n: NotificationResponse): void {
    if (n.readAt) return;
    this.notifSvc.markRead(n.id).subscribe({
      next: (updated) => {
        this.notifications.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.unreadCount.update(c => Math.max(0, c - 1));
      }
    });
  }

  markAllRead(): void {
    this.notifSvc.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, readAt: new Date().toISOString() })));
        this.unreadCount.set(0);
      }
    });
  }
}
