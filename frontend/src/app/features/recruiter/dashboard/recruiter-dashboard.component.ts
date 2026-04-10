import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../core/services/job.service';
import { CompanyService } from '../../../core/services/company.service';
import { JobListingStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- Hero -->
    <div class="dash-hero">
      <div class="hero-glow"></div>
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          Recruiter Portal
        </div>
        <h1>Recruiter <span>Dashboard</span></h1>
        <p>Manage your jobs, candidates, and company profile</p>
      </div>
      <div class="hero-stats">
        <div class="stat-pill">
          <div class="stat-icon"><mat-icon>work</mat-icon></div>
          <div>
            <div class="stat-num">{{ publishedCount }}</div>
            <div class="stat-label">Published</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-icon draft"><mat-icon>edit_note</mat-icon></div>
          <div>
            <div class="stat-num">{{ draftCount }}</div>
            <div class="stat-label">Drafts</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-icon apps"><mat-icon>people</mat-icon></div>
          <div>
            <div class="stat-num">{{ totalJobs }}</div>
            <div class="stat-label">Total Jobs</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-icon verified"><mat-icon>verified</mat-icon></div>
          <div>
            <div class="stat-num">{{ companyStatus }}</div>
            <div class="stat-label">Company</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-container">
      <div class="dash-grid">
        <!-- Company Card -->
        <div class="dash-card company-card">
          <div class="card-header">
            <div class="card-title">
              <div class="card-icon"><mat-icon>business</mat-icon></div>
              Company Profile
            </div>
          </div>

          @if (company) {
            <div class="company-info">
              <div class="company-avatar">{{ company.name[0] }}</div>
              <div>
                <div class="company-name">{{ company.name }}</div>
                @if (company.industry) {
                  <div class="company-industry">
                    <mat-icon>category</mat-icon>
                    {{ company.industry | titlecase }}
                  </div>
                }
              </div>
              <span class="verify-badge verify-{{ company.verificationStatus }}">
                <mat-icon>{{ company.verificationStatus === 'approved' ? 'verified' : 'pending' }}</mat-icon>
                {{ company.verificationStatus | titlecase }}
              </span>
            </div>

            @if (company.websiteUrl) {
              <div class="company-website">
                <mat-icon>language</mat-icon>
                {{ company.websiteUrl }}
              </div>
            }
          } @else {
            <div class="empty-company">
              <mat-icon>add_business</mat-icon>
              <p>Register your company to start posting jobs</p>
            </div>
          }

          <a mat-raised-button routerLink="/recruiter/company" class="card-action-btn">
            <mat-icon>{{ company ? 'edit' : 'add' }}</mat-icon>
            {{ company ? 'Manage Company' : 'Register Company' }}
          </a>
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
            <a routerLink="/recruiter/jobs/new" class="action-item primary">
              <div class="action-icon">
                <mat-icon>add_circle</mat-icon>
              </div>
              <div class="action-text">
                <div class="action-name">Post a Job</div>
                <div class="action-desc">Create a new job listing</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
            <a routerLink="/recruiter/jobs" class="action-item">
              <div class="action-icon purple">
                <mat-icon>list_alt</mat-icon>
              </div>
              <div class="action-text">
                <div class="action-name">Manage Jobs</div>
                <div class="action-desc">Edit, publish or close listings</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
            <a routerLink="/recruiter/company" class="action-item">
              <div class="action-icon green">
                <mat-icon>business</mat-icon>
              </div>
              <div class="action-text">
                <div class="action-name">Company Settings</div>
                <div class="action-desc">Update company information</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
          </div>
        </div>

        <!-- Recent Jobs -->
        <div class="dash-card wide">
          <div class="card-header">
            <div class="card-title">
              <div class="card-icon gold"><mat-icon>work_history</mat-icon></div>
              Recent Job Postings
            </div>
            <a routerLink="/recruiter/jobs" class="view-all-link">
              View all <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>

          @if (recentJobs.length === 0) {
            <div class="empty-jobs">
              <mat-icon>work_off</mat-icon>
              <p>No jobs posted yet</p>
              <a mat-raised-button routerLink="/recruiter/jobs/new" class="post-btn">
                <mat-icon>add</mat-icon> Post Your First Job
              </a>
            </div>
          }

          @if (recentJobs.length > 0) {
            <div class="jobs-list">
              @for (job of recentJobs; track job.id) {
                <div class="job-row" [routerLink]="['/recruiter/jobs', job.id, 'applications']">
                  <div class="job-avatar">{{ job.title[0] }}</div>
                  <div class="job-info">
                    <div class="job-title">{{ job.title }}</div>
                    <div class="job-meta-row">
                      @if (job.location) {
                        <span><mat-icon>location_on</mat-icon>{{ job.location }}</span>
                      }
                      <span><mat-icon>schedule</mat-icon>{{ job.createdAt | date:'MMM d, y' }}</span>
                    </div>
                  </div>
                  <span class="job-status-badge status-{{ job.status }}">{{ job.status | titlecase }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-hero {
      background: linear-gradient(135deg, #0a0a1a 0%, #0d1a3a 50%, #0a0a1a 100%);
      padding: 48px 24px 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      width: 700px; height: 400px;
      background: radial-gradient(ellipse, rgba(0,188,212,0.2) 0%, transparent 70%);
      top: -100px; right: -100px;
    }

    .hero-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(0,188,212,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,188,212,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,188,212,0.1);
      border: 1px solid rgba(0,188,212,0.3);
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
      gap: 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 14px 20px;
      flex: 1 1 120px;
      backdrop-filter: blur(10px);
    }

    .stat-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: rgba(0,229,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: #00e5ff; font-size: 20px; width: 20px; height: 20px; }
      &.draft { background: rgba(255,179,0,0.1); mat-icon { color: #ffb300; } }
      &.apps { background: rgba(108,63,197,0.12); mat-icon { color: #a78bfa; } }
      &.verified { background: rgba(46,125,50,0.12); mat-icon { color: #66bb6a; } }
    }

    .stat-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

    .dash-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
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

    .company-info {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }

    .company-avatar {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-weight: 800;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .company-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .company-industry {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #888;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .verify-badge {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .verify-approved { background: rgba(46,125,50,0.1); color: #2e7d32; }
    .verify-pending { background: rgba(230,81,0,0.1); color: #e65100; }
    .verify-rejected { background: rgba(198,40,40,0.1); color: #c62828; }

    .company-website {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #6c3fc5;
      margin-bottom: 16px;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    .empty-company {
      text-align: center;
      padding: 28px 0;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #ddd; }
      p { font-size: 14px; color: #aaa; margin: 10px 0 0; }
    }

    .card-action-btn {
      width: 100%;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      margin-top: 8px;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    .action-list { display: flex; flex-direction: column; gap: 4px; }

    .action-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 10px;
      border-radius: 12px;
      text-decoration: none;
      transition: background 0.2s;
      cursor: pointer;
      &:hover { background: rgba(108,63,197,0.05); }
      &.primary .action-icon { background: rgba(0,229,255,0.12); mat-icon { color: #00bcd4; } }
    }

    .action-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      background: rgba(0,188,212,0.1);
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

    .empty-jobs {
      text-align: center;
      padding: 40px 20px;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ddd; }
      p { font-size: 15px; color: #aaa; margin: 12px 0; }
    }

    .post-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    .jobs-list { display: flex; flex-direction: column; gap: 4px; }

    .job-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
      &:hover { background: rgba(108,63,197,0.05); }
    }

    .job-avatar {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0097a7, #00bcd4);
      color: white;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .job-info { flex: 1; }
    .job-title { font-weight: 600; font-size: 14px; color: #1a1a2e; }

    .job-meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 3px;
      span {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        color: #888;
        mat-icon { font-size: 13px; width: 13px; height: 13px; color: #bbb; }
      }
    }

    .job-status-badge {
      padding: 3px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .status-published { background: rgba(46,125,50,0.1); color: #2e7d32; }
    .status-draft { background: rgba(97,97,97,0.1); color: #555; }
    .status-closed { background: rgba(198,40,40,0.1); color: #c62828; }
    .status-paused { background: rgba(230,81,0,0.1); color: #e65100; }

    @media (max-width: 768px) {
      .dash-grid { grid-template-columns: 1fr; }
      .dash-card.wide { grid-column: 1; }
    }
  `]
})
export class RecruiterDashboardComponent implements OnInit {
  private jobSvc = inject(JobService);
  private companySvc = inject(CompanyService);

  company: any = null;
  recentJobs: any[] = [];
  publishedCount = 0;
  draftCount = 0;
  totalJobs = 0;

  get companyStatus(): string {
    if (!this.company) return 'None';
    return this.company.verificationStatus?.replace('_', ' ') || 'Pending';
  }

  ngOnInit(): void {
    this.companySvc.getMyCompany().subscribe({ next: (c) => { this.company = c; } });
    this.jobSvc.listMyJobs(1, 20).subscribe({
      next: (res) => {
        this.totalJobs = res.total;
        this.recentJobs = res.items.slice(0, 5);
        this.publishedCount = res.items.filter((j: any) => j.status === JobListingStatus.PUBLISHED).length;
        this.draftCount = res.items.filter((j: any) => j.status === JobListingStatus.DRAFT).length;
      }
    });
  }
}
