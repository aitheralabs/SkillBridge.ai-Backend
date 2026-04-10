import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationStatus } from '../../../core/models/enums';
import { ApplicationWithSeeker } from '../../../core/models/application.models';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatSelectModule,
    MatFormFieldModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <!-- Header -->
    <div class="apps-header">
      <div class="header-glow"></div>
      <div class="header-inner">
        <div>
          <a routerLink="/recruiter/jobs" class="back-link">
            <mat-icon>arrow_back</mat-icon> Back to Jobs
          </a>
          <h1>Job <span>Applications</span></h1>
          <p>{{ total }} candidate{{ total !== 1 ? 's' : '' }} applied</p>
        </div>
        <div class="header-stats">
          @for (s of statusSummary; track s.key) {
            <div class="mini-stat count-{{ s.key }}">
              <span class="mini-num">{{ s.count }}</span>
              <span class="mini-label">{{ s.label }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <div class="page-container">
      @if (loading) {
        <div class="center"><mat-spinner color="accent"></mat-spinner></div>
      }

      @if (!loading) {
        @if (applications.length === 0) {
          <div class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <h3>No applications yet</h3>
            <p>Candidates who apply will appear here</p>
          </div>
        }

        <div class="apps-list">
          @for (app of applications; track app.id) {
            <div class="app-card" [class.expanded]="expanded[app.id]">
              <!-- Card header row -->
              <div class="app-card-header" (click)="toggle(app.id)">
                <div class="candidate-info">
                  <div class="candidate-avatar">
                    {{ (app.seeker?.fullName || app.id)[0].toUpperCase() }}
                  </div>
                  <div>
                    <div class="candidate-name">{{ app.seeker?.fullName || 'Anonymous' }}</div>
                    @if (app.seeker?.headline) {
                      <div class="candidate-headline">{{ app.seeker!.headline }}</div>
                    }
                    @if (app.seeker?.currentLocation) {
                      <div class="candidate-location">
                        <mat-icon>location_on</mat-icon>{{ app.seeker!.currentLocation }}
                      </div>
                    }
                  </div>
                </div>
                <div class="card-header-right">
                  <span class="status-badge status-{{ app.status }}">
                    <span class="status-dot"></span>
                    {{ formatStatus(app.status) }}
                  </span>
                  <span class="app-date">{{ app.createdAt | date:'MMM d' }}</span>
                  <mat-icon class="expand-icon" [class.rotated]="expanded[app.id]">expand_more</mat-icon>
                </div>
              </div>

              <!-- Expanded detail -->
              @if (expanded[app.id]) {
                <div class="app-card-body">
                  @if (app.coverLetter) {
                    <div class="cover-letter-section">
                      <div class="section-label">
                        <mat-icon>description</mat-icon>
                        Cover Letter
                      </div>
                      <div class="cover-letter-text">{{ app.coverLetter }}</div>
                    </div>
                  }

                  <div class="update-status-row">
                    <div class="section-label">
                      <mat-icon>swap_horiz</mat-icon>
                      Update Status
                    </div>
                    <div class="update-controls">
                      <mat-form-field appearance="outline" class="status-select">
                        <mat-select [(ngModel)]="statusUpdates[app.id]" placeholder="Select new status">
                          @for (s of allowedStatuses; track s) {
                            <mat-option [value]="s">{{ formatStatus(s) }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <button mat-raised-button class="update-btn"
                        (click)="updateStatus(app)"
                        [disabled]="!statusUpdates[app.id]">
                        <mat-icon>check</mat-icon> Update
                      </button>
                    </div>
                  </div>
                </div>
              }
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
    .apps-header {
      background: linear-gradient(135deg, #0a0a1a 0%, #0d1a3a 50%, #0a0a1a 100%);
      padding: 36px 24px 28px;
      position: relative;
      overflow: hidden;
    }

    .header-glow {
      position: absolute;
      width: 500px; height: 300px;
      background: radial-gradient(ellipse, rgba(0,188,212,0.15) 0%, transparent 70%);
      top: -50px; right: -50px;
    }

    .header-inner {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      margin-bottom: 10px;
      &:hover { color: #00e5ff; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .apps-header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(22px, 3vw, 34px);
      font-weight: 800;
      color: white;
      margin: 0 0 6px;
      span { background: linear-gradient(135deg, #00e5ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    }

    .apps-header p { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; }

    .header-stats {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .mini-stat {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px 16px;
      text-align: center;
      min-width: 64px;
    }

    .mini-num {
      display: block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .mini-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; display: block; }

    .count-shortlisted .mini-num { color: #66bb6a; }
    .count-hired .mini-num { color: #00e5ff; }
    .count-rejected .mini-num { color: #ef5350; }

    .center { display: flex; justify-content: center; padding: 64px; }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ddd; }
      h3 { font-size: 20px; color: #555; margin: 16px 0 8px; }
      p { font-size: 14px; color: #aaa; }
    }

    .apps-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

    .app-card {
      background: white;
      border-radius: 16px;
      border: 1px solid rgba(108,63,197,0.1);
      border-left: 4px solid #00bcd4;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,188,212,0.05);
      transition: box-shadow 0.2s;

      &.expanded { border-left-color: #6c3fc5; box-shadow: 0 8px 28px rgba(108,63,197,0.1); }
    }

    .app-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 22px;
      cursor: pointer;
      transition: background 0.15s;
      &:hover { background: rgba(108,63,197,0.02); }
    }

    .candidate-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
    }

    .candidate-avatar {
      width: 46px; height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .candidate-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .candidate-headline { font-size: 13px; color: #666; margin-top: 2px; }

    .candidate-location {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: #aaa;
      margin-top: 2px;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .card-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 11px;
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
    .status-interview_scheduled { background: rgba(103,58,183,0.1); color: #4527a0; }
    .status-offered { background: rgba(0,150,136,0.1); color: #00695c; }
    .status-rejected { background: rgba(198,40,40,0.1); color: #c62828; }
    .status-withdrawn { background: rgba(97,97,97,0.1); color: #616161; }
    .status-hired { background: rgba(0,150,136,0.12); color: #00695c; }

    .app-date { font-size: 12px; color: #bbb; }

    .expand-icon {
      color: #bbb;
      transition: transform 0.2s;
      &.rotated { transform: rotate(180deg); }
    }

    .app-card-body {
      border-top: 1px solid rgba(108,63,197,0.08);
      padding: 20px 22px;
      background: rgba(108,63,197,0.02);
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #6c3fc5;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    .cover-letter-section { margin-bottom: 20px; }

    .cover-letter-text {
      font-size: 14px;
      color: #444;
      line-height: 1.7;
      white-space: pre-wrap;
      background: white;
      border: 1px solid rgba(108,63,197,0.1);
      border-radius: 12px;
      padding: 16px;
    }

    .update-status-row { }

    .update-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .status-select { flex: 0 0 220px; margin: 0; }

    .update-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      mat-icon { margin-right: 6px; vertical-align: middle; font-size: 16px; width: 16px; height: 16px; }
    }

    .paginator { background: transparent; margin-top: 8px; }
  `]
})
export class JobApplicationsComponent implements OnInit {
  private appSvc = inject(ApplicationService);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);

  jobId = '';
  applications: ApplicationWithSeeker[] = [];
  statusUpdates: Record<string, ApplicationStatus> = {};
  expanded: Record<string, boolean> = {};
  total = 0;
  page = 1;
  pageSize = 20;
  loading = false;

  allowedStatuses = [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.OFFERED,
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
  ];

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

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.appSvc.getJobApplications(this.jobId, this.page, this.pageSize).subscribe({
      next: (res) => { this.applications = res.items; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggle(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  updateStatus(app: ApplicationWithSeeker): void {
    const status = this.statusUpdates[app.id];
    if (!status) return;
    this.appSvc.updateApplicationStatus(app.id, { status }).subscribe({
      next: (updated) => {
        const idx = this.applications.findIndex(a => a.id === app.id);
        if (idx >= 0) this.applications[idx] = updated;
        delete this.statusUpdates[app.id];
        this.snack.open('Status updated', 'Close', { duration: 2000 });
      },
      error: (err) => { this.snack.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 }); }
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }
}
