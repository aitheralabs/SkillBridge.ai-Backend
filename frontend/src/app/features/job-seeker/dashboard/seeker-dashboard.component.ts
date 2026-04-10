import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../core/services/application.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationResponse } from '../../../core/models/application.models';

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <!-- Hero -->
    <div class="dash-hero">
      <div class="hero-glow"></div>
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="greeting-badge">
          <span class="pulse-dot"></span>
          AI Dashboard
        </div>
        <h1>Welcome back, <span>{{ firstName || 'there' }}</span></h1>
        <p>Your AI-powered career journey continues</p>
      </div>
      <div class="hero-stats">
        <div class="stat-pill">
          <mat-icon>send</mat-icon>
          <div>
            <div class="stat-num">{{ totalApps }}</div>
            <div class="stat-label">Applied</div>
          </div>
        </div>
        <div class="stat-pill">
          <mat-icon>visibility</mat-icon>
          <div>
            <div class="stat-num">{{ reviewCount }}</div>
            <div class="stat-label">In Review</div>
          </div>
        </div>
        <div class="stat-pill">
          <mat-icon>stars</mat-icon>
          <div>
            <div class="stat-num">{{ shortlistCount }}</div>
            <div class="stat-label">Shortlisted</div>
          </div>
        </div>
        <div class="stat-pill">
          <mat-icon>bar_chart</mat-icon>
          <div>
            <div class="stat-num">{{ profileCompletion }}%</div>
            <div class="stat-label">Profile</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-container">
      <!-- Profile Completion -->
      @if (profileCompletion < 100) {
        <div class="completion-banner">
          <div class="completion-info">
            <mat-icon>person</mat-icon>
            <div>
              <div class="completion-title">Complete your profile</div>
              <div class="completion-sub">A complete profile gets 3x more recruiter views</div>
            </div>
          </div>
          <div class="completion-right">
            <span class="completion-pct">{{ profileCompletion }}%</span>
            <a mat-stroked-button routerLink="/seeker/profile" class="complete-btn">
              Complete Now <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
          <mat-progress-bar mode="determinate" [value]="profileCompletion" class="comp-bar"></mat-progress-bar>
        </div>
      }

      <div class="dash-grid">
        <!-- Recent Applications -->
        <div class="dash-card wide">
          <div class="card-header">
            <div class="card-title">
              <div class="card-icon"><mat-icon>work_history</mat-icon></div>
              Recent Applications
            </div>
            <a routerLink="/seeker/applications" class="view-all-link">
              View all <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>

          @if (applications.length === 0) {
            <div class="empty-apps">
              <mat-icon>inbox</mat-icon>
              <p>No applications yet</p>
              <a mat-raised-button routerLink="/jobs" class="browse-btn">Browse Jobs</a>
            </div>
          }

          @if (applications.length > 0) {
            <div class="app-list">
              @for (app of applications; track app.id) {
                <div class="app-row" [routerLink]="['/jobs', app.jobId]">
                  <div class="app-avatar">{{ (app.job?.companyNameSnapshot || '?')[0] }}</div>
                  <div class="app-info">
                    <div class="app-title">{{ app.job?.title || 'Unknown Job' }}</div>
                    <div class="app-company">{{ app.job?.companyNameSnapshot }}</div>
                  </div>
                  <div class="app-meta">
                    <span class="status-badge status-{{ app.status }}">{{ app.status | titlecase }}</span>
                    <span class="app-date">{{ app.createdAt | date:'MMM d' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="dash-card">
          <div class="card-header">
            <div class="card-title">
              <div class="card-icon cyan"><mat-icon>bolt</mat-icon></div>
              Quick Actions
            </div>
          </div>
          <div class="action-list">
            <a routerLink="/jobs" class="action-item">
              <div class="action-icon">
                <mat-icon>search</mat-icon>
              </div>
              <div class="action-text">
                <div class="action-name">Browse Jobs</div>
                <div class="action-desc">Find AI-matched opportunities</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
            <a routerLink="/seeker/profile" class="action-item">
              <div class="action-icon purple">
                <mat-icon>person_edit</mat-icon>
              </div>
              <div class="action-text">
                <div class="action-name">Edit Profile</div>
                <div class="action-desc">Update skills & experience</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
            <a routerLink="/seeker/applications" class="action-item">
              <div class="action-icon green">
                <mat-icon>description</mat-icon>
              </div>
              <div class="action-text">
                <div class="action-name">My Applications</div>
                <div class="action-desc">Track application status</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
          </div>
        </div>

        <!-- AI Tips -->
        <div class="dash-card">
          <div class="card-header">
            <div class="card-title">
              <div class="card-icon gold"><mat-icon>auto_awesome</mat-icon></div>
              AI Career Tips
            </div>
          </div>
          <div class="tips-list">
            <div class="tip-item">
              <div class="tip-num">01</div>
              <p>Add measurable achievements to your experience entries to stand out.</p>
            </div>
            <div class="tip-item">
              <div class="tip-num">02</div>
              <p>Tailor your headline to match the roles you're targeting.</p>
            </div>
            <div class="tip-item">
              <div class="tip-num">03</div>
              <p>Upload a professional resume PDF for faster recruiter review.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-hero {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      padding: 48px 24px 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      width: 700px; height: 400px;
      background: radial-gradient(ellipse, rgba(108,63,197,0.25) 0%, transparent 70%);
      top: -100px; left: 50%; transform: translateX(-50%);
      pointer-events: none;
    }

    .hero-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(108,63,197,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(108,63,197,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
    }

    .greeting-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,229,255,0.08);
      border: 1px solid rgba(0,229,255,0.25);
      border-radius: 50px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #00e5ff;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .pulse-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #00e5ff;
      animation: pulse-anim 2s infinite;
    }

    @keyframes pulse-anim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    .hero-content h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(24px, 4vw, 40px);
      font-weight: 800;
      color: white;
      margin: 0 0 8px;
      span { background: linear-gradient(135deg, #00e5ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    }

    .hero-content p { color: rgba(255,255,255,0.5); font-size: 15px; margin: 0; }

    .hero-stats {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 32px auto 0;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 14px 20px;
      flex: 1 1 120px;
      backdrop-filter: blur(10px);

      mat-icon { color: #00e5ff; font-size: 22px; width: 22px; height: 22px; }
    }

    .stat-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

    .completion-banner {
      background: linear-gradient(135deg, rgba(108,63,197,0.12), rgba(0,188,212,0.08));
      border: 1px solid rgba(108,63,197,0.25);
      border-radius: 16px;
      padding: 20px 24px 14px;
      margin: -40px 0 28px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      overflow: hidden;
    }

    .completion-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      mat-icon { color: #a78bfa; font-size: 28px; width: 28px; height: 28px; }
    }

    .completion-title { font-weight: 700; color: white; font-size: 15px; }
    .completion-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }

    .completion-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .completion-pct {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #a78bfa, #00e5ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .complete-btn {
      border-color: rgba(108,63,197,0.5) !important;
      color: #a78bfa !important;
      border-radius: 50px !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-left: 4px; vertical-align: middle; }
    }

    .comp-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px !important;
      border-radius: 0;
      --mdc-linear-progress-active-indicator-color: #a78bfa;
    }

    .dash-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 20px;
    }

    .dash-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(108,63,197,0.1);
      box-shadow: 0 4px 20px rgba(108,63,197,0.06);

      &.wide { grid-column: 1 / -1; }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .card-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6c3fc5, #9333ea);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; font-size: 18px; width: 18px; height: 18px; }

      &.cyan { background: linear-gradient(135deg, #0097a7, #00bcd4); }
      &.gold { background: linear-gradient(135deg, #f57c00, #ffb300); }
      &.green { background: linear-gradient(135deg, #388e3c, #66bb6a); }
      &.purple { background: linear-gradient(135deg, #6c3fc5, #a78bfa); }
    }

    .view-all-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #6c3fc5;
      font-weight: 600;
      text-decoration: none;
      &:hover { text-decoration: underline; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .empty-apps {
      text-align: center;
      padding: 40px 20px;
      color: #bbb;
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; }
      p { margin: 12px 0; font-size: 15px; }
    }

    .browse-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
    }

    .app-list { display: flex; flex-direction: column; gap: 2px; }

    .app-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
      &:hover { background: rgba(108,63,197,0.05); }
    }

    .app-avatar {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .app-info { flex: 1; }
    .app-title { font-weight: 600; font-size: 14px; color: #1a1a2e; }
    .app-company { font-size: 12px; color: #888; margin-top: 2px; }

    .app-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .status-badge {
      padding: 2px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-submitted { background: rgba(21,101,192,0.1); color: #1565c0; }
    .status-under_review { background: rgba(230,81,0,0.1); color: #e65100; }
    .status-shortlisted { background: rgba(46,125,50,0.1); color: #2e7d32; }
    .status-rejected { background: rgba(198,40,40,0.1); color: #c62828; }
    .status-withdrawn { background: rgba(97,97,97,0.1); color: #616161; }
    .status-hired { background: rgba(27,94,32,0.1); color: #1b5e20; }

    .app-date { font-size: 11px; color: #bbb; }

    .action-list { display: flex; flex-direction: column; gap: 4px; }

    .action-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 10px;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
      &:hover { background: rgba(108,63,197,0.05); }
    }

    .action-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      background: rgba(0,229,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: #00bcd4; font-size: 20px; width: 20px; height: 20px; }
      &.purple { background: rgba(108,63,197,0.1); mat-icon { color: #6c3fc5; } }
      &.green { background: rgba(46,125,50,0.1); mat-icon { color: #2e7d32; } }
    }

    .action-text { flex: 1; }
    .action-name { font-weight: 600; font-size: 14px; color: #1a1a2e; }
    .action-desc { font-size: 12px; color: #888; margin-top: 2px; }
    .action-arrow { color: #ccc; font-size: 20px; width: 20px; height: 20px; }

    .tips-list { display: flex; flex-direction: column; gap: 16px; }

    .tip-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .tip-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 800;
      color: #a78bfa;
      background: rgba(108,63,197,0.08);
      border-radius: 6px;
      padding: 2px 8px;
      flex-shrink: 0;
    }

    .tip-item p { font-size: 13px; color: #555; margin: 0; line-height: 1.5; }

    @media (max-width: 768px) {
      .dash-grid { grid-template-columns: 1fr; }
      .dash-card.wide { grid-column: 1; }
      .hero-stats { gap: 8px; }
    }
  `]
})
export class SeekerDashboardComponent implements OnInit {
  private appSvc = inject(ApplicationService);
  private profileSvc = inject(ProfileService);
  private authSvc = inject(AuthService);

  user = this.authSvc.user();
  applications: ApplicationResponse[] = [];
  firstName = '';
  profileCompletion = 0;
  totalApps = 0;
  reviewCount = 0;
  shortlistCount = 0;

  ngOnInit(): void {
    this.appSvc.getMyApplications(1, 5).subscribe({
      next: (res) => {
        this.applications = res.items;
        this.totalApps = res.total;
        this.reviewCount = res.items.filter(a => a.status === 'under_review').length;
        this.shortlistCount = res.items.filter(a => a.status === 'shortlisted').length;
      }
    });
    this.profileSvc.getProfile().subscribe({
      next: (p) => {
        const nameParts = (p.fullName || '').trim().split(' ');
        this.firstName = nameParts[0] || '';
        let filled = 0;
        if (p.fullName) filled++;
        if (p.headline) filled++;
        if (p.bio) filled++;
        if (p.phone) filled++;
        if (p.currentLocation) filled++;
        if (p.educations?.length) filled++;
        if (p.experiences?.length) filled++;
        if (p.skills?.length) filled++;
        if (p.resumeUrl) filled++;
        filled++; // placeholder for avatar (tracked locally)
        this.profileCompletion = Math.round((filled / 10) * 100);
      }
    });
  }
}
