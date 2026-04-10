import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationResponse } from '../../../core/models/application.models';

@Component({
  selector: 'app-seeker-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatSelectModule, MatFormFieldModule, MatPaginatorModule],
  template: `
    <!-- Hero -->
    <div class="apps-hero">
      <div class="hero-glow"></div>
      <div class="hero-grid"></div>
      <div class="hero-inner">
        <div class="hero-badge">
          <mat-icon>description</mat-icon>
          Application Tracker
        </div>
        <h1>My <span>Applications</span></h1>
        <p>Track every application in one place</p>
      </div>
      <div class="hero-counts">
        @for (s of statusSummary; track s.label) {
          <div class="count-pill" [class]="'count-' + s.key">
            <span class="count-num">{{ s.count }}</span>
            <span class="count-label">{{ s.label }}</span>
          </div>
        }
      </div>
    </div>

    <div class="page-container">
      <!-- Filter bar -->
      <div class="filter-bar">
        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Filter by status</mat-label>
          <mat-icon matPrefix>filter_list</mat-icon>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilter()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="submitted">Submitted</mat-option>
            <mat-option value="under_review">Under Review</mat-option>
            <mat-option value="shortlisted">Shortlisted</mat-option>
            <mat-option value="rejected">Rejected</mat-option>
            <mat-option value="hired">Hired</mat-option>
            <mat-option value="withdrawn">Withdrawn</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="total-label">
          <mat-icon>work</mat-icon>
          {{ total }} application{{ total !== 1 ? 's' : '' }}
        </div>
      </div>

      @if (loading) {
        <div class="center"><mat-spinner color="accent"></mat-spinner></div>
      }

      @if (!loading) {
        <div class="apps-list">
          @if (filtered.length === 0) {
            <div class="empty-state">
              <mat-icon>inbox</mat-icon>
              <h3>No applications found</h3>
              <p>{{ statusFilter ? 'Try a different status filter' : 'Start applying to jobs' }}</p>
              @if (!statusFilter) {
                <a mat-raised-button routerLink="/jobs" class="browse-btn">
                  <mat-icon>search</mat-icon> Browse Jobs
                </a>
              }
            </div>
          }

          @for (app of filtered; track app.id) {
            <div class="app-card">
              <div class="app-card-left">
                <div class="company-avatar">{{ (app.job?.companyNameSnapshot || '?')[0] }}</div>
                <div class="app-details">
                  <a [routerLink]="['/jobs', app.jobId]" class="app-job-title">
                    {{ app.job?.title || 'Unknown Job' }}
                  </a>
                  <div class="app-company">
                    <mat-icon>business</mat-icon>
                    {{ app.job?.companyNameSnapshot || 'Unknown Company' }}
                  </div>
                  @if (app.job?.location) {
                    <div class="app-location">
                      <mat-icon>location_on</mat-icon>
                      {{ app.job?.location }}
                    </div>
                  }
                </div>
              </div>

              <div class="app-card-right">
                <span class="status-badge status-{{ app.status }}">
                  <span class="status-dot"></span>
                  {{ formatStatus(app.status) }}
                </span>
                <div class="app-date">
                  <mat-icon>schedule</mat-icon>
                  Applied {{ app.createdAt | date:'MMM d, y' }}
                </div>
                @if (canWithdraw(app.status)) {
                  <button mat-stroked-button class="withdraw-btn" (click)="withdraw(app)">
                    <mat-icon>close</mat-icon> Withdraw
                  </button>
                }
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
    .apps-hero {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      padding: 48px 24px 72px;
      position: relative;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, rgba(108,63,197,0.2) 0%, transparent 70%);
      top: 0; left: 50%; transform: translateX(-50%);
    }

    .hero-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(108,63,197,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(108,63,197,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .hero-inner {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(108,63,197,0.15);
      border: 1px solid rgba(108,63,197,0.3);
      border-radius: 50px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #a78bfa;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 14px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .hero-inner h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(24px, 4vw, 38px);
      font-weight: 800;
      color: white;
      margin: 0 0 8px;
      span { background: linear-gradient(135deg, #a78bfa, #00e5ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    }

    .hero-inner p { color: rgba(255,255,255,0.5); font-size: 14px; margin: 0; }

    .hero-counts {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 24px auto 0;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .count-pill {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      backdrop-filter: blur(10px);
    }

    .count-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .count-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }

    .count-shortlisted .count-num { color: #66bb6a; }
    .count-hired .count-num { color: #00e5ff; }
    .count-rejected .count-num { color: #ef5350; }

    .filter-bar {
      background: white;
      border-radius: 16px;
      padding: 16px 24px;
      margin: -32px 0 28px;
      box-shadow: 0 8px 32px rgba(108,63,197,0.1);
      border: 1px solid rgba(108,63,197,0.1);
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .status-filter { flex: 0 0 220px; margin: 0; }

    .total-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #6c3fc5;
      font-size: 14px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .center { display: flex; justify-content: center; padding: 64px; }

    .apps-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

    .app-card {
      background: white;
      border-radius: 16px;
      padding: 20px 24px;
      border: 1px solid rgba(108,63,197,0.1);
      border-left: 4px solid #6c3fc5;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.2s;
      box-shadow: 0 2px 12px rgba(108,63,197,0.05);

      &:hover {
        box-shadow: 0 8px 28px rgba(108,63,197,0.12);
        transform: translateY(-2px);
      }
    }

    .app-card-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .company-avatar {
      width: 48px; height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-weight: 700;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .app-job-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      text-decoration: none;
      display: block;
      margin-bottom: 4px;
      &:hover { color: #6c3fc5; }
    }

    .app-company, .app-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #888;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #bbb; }
    }

    .app-company { color: #6c3fc5; font-weight: 500; margin-bottom: 2px; }

    .app-card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-submitted { background: rgba(21,101,192,0.1); color: #1565c0; }
    .status-under_review { background: rgba(230,81,0,0.1); color: #e65100; }
    .status-shortlisted { background: rgba(46,125,50,0.12); color: #2e7d32; }
    .status-rejected { background: rgba(198,40,40,0.1); color: #c62828; }
    .status-withdrawn { background: rgba(97,97,97,0.1); color: #616161; }
    .status-hired { background: rgba(0,150,136,0.1); color: #00695c; }

    .app-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #aaa;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .withdraw-btn {
      border-color: rgba(198,40,40,0.3) !important;
      color: #c62828 !important;
      border-radius: 50px !important;
      font-size: 12px !important;
      mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; vertical-align: middle; }
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ddd; }
      h3 { font-size: 20px; color: #555; margin: 16px 0 8px; }
      p { font-size: 14px; color: #aaa; margin-bottom: 24px; }
    }

    .browse-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    .paginator {
      background: transparent;
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .app-card { flex-direction: column; align-items: flex-start; }
      .app-card-right { align-items: flex-start; }
    }
  `]
})
export class SeekerApplicationsComponent implements OnInit {
  private appSvc = inject(ApplicationService);
  private snack = inject(MatSnackBar);

  applications: ApplicationResponse[] = [];
  filtered: ApplicationResponse[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  statusFilter = '';

  get statusSummary() {
    const counts: Record<string, number> = {};
    this.applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return [
      { key: 'submitted', label: 'Applied', count: counts['submitted'] || 0 },
      { key: 'under_review', label: 'In Review', count: counts['under_review'] || 0 },
      { key: 'shortlisted', label: 'Shortlisted', count: counts['shortlisted'] || 0 },
      { key: 'hired', label: 'Hired', count: counts['hired'] || 0 },
      { key: 'rejected', label: 'Rejected', count: counts['rejected'] || 0 },
    ];
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.appSvc.getMyApplications(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.applications = res.items;
        this.total = res.total;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    this.filtered = this.statusFilter
      ? this.applications.filter(a => a.status === this.statusFilter)
      : [...this.applications];
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  canWithdraw(status: string): boolean {
    return !['rejected', 'withdrawn', 'hired'].includes(status);
  }

  withdraw(app: ApplicationResponse): void {
    if (!confirm('Withdraw this application?')) return;
    this.appSvc.withdrawApplication(app.id).subscribe({
      next: (updated) => {
        const idx = this.applications.findIndex(a => a.id === app.id);
        if (idx >= 0) this.applications[idx] = updated;
        this.applyFilter();
        this.snack.open('Application withdrawn', 'Close', { duration: 2000 });
      },
      error: (err) => { this.snack.open(err.error?.message || 'Failed', 'Close', { duration: 3000 }); }
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }
}
