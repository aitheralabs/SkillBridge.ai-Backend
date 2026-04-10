import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../core/services/job.service';
import { JobListingStatus } from '../../../core/models/enums';
import { JobResponse } from '../../../core/models/job.models';

@Component({
  selector: 'app-recruiter-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <!-- Header -->
    <div class="jobs-header">
      <div class="header-glow"></div>
      <div class="header-inner">
        <div>
          <div class="header-badge">
            <mat-icon>work</mat-icon>
            Job Management
          </div>
          <h1>My Job <span>Listings</span></h1>
          <p>{{ total }} listing{{ total !== 1 ? 's' : '' }} total</p>
        </div>
        <a mat-raised-button routerLink="/recruiter/jobs/new" class="post-btn">
          <mat-icon>add_circle</mat-icon>
          Post New Job
        </a>
      </div>
    </div>

    <div class="page-container">
      @if (loading) {
        <div class="center"><mat-spinner color="accent"></mat-spinner></div>
      }

      @if (!loading) {
        @if (jobs.length === 0) {
          <div class="empty-state">
            <mat-icon>work_off</mat-icon>
            <h3>No job listings yet</h3>
            <p>Create your first job posting to start finding candidates</p>
            <a mat-raised-button routerLink="/recruiter/jobs/new" class="post-btn">
              <mat-icon>add</mat-icon> Post a Job
            </a>
          </div>
        }

        @if (jobs.length > 0) {
          <div class="jobs-list">
            @for (job of jobs; track job.id) {
              <div class="job-card">
                <div class="job-card-left">
                  <div class="job-icon">{{ job.title[0] }}</div>
                  <div class="job-info">
                    <a [routerLink]="['/recruiter/jobs', job.id, 'edit']" class="job-title">
                      {{ job.title }}
                    </a>
                    <div class="job-meta">
                      @if (job.location) {
                        <span><mat-icon>location_on</mat-icon>{{ job.location }}</span>
                      }
                      @if (job.employmentType) {
                        <span><mat-icon>schedule</mat-icon>{{ job.employmentType.replace('_', ' ') | titlecase }}</span>
                      }
                      <span>
                        <mat-icon>calendar_today</mat-icon>
                        {{ job.publishedAt ? (job.publishedAt | date:'MMM d, y') : 'Not published' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="job-card-right">
                  <span class="status-badge status-{{ job.status }}">
                    <span class="status-dot"></span>
                    {{ job.status | titlecase }}
                  </span>

                  <div class="job-actions">
                    <a mat-icon-button [routerLink]="['/recruiter/jobs', job.id, 'applications']"
                       class="icon-btn" title="View Applications">
                      <mat-icon>people</mat-icon>
                    </a>
                    <a mat-icon-button [routerLink]="['/recruiter/jobs', job.id, 'edit']"
                       class="icon-btn" title="Edit Job">
                      <mat-icon>edit</mat-icon>
                    </a>
                    <button mat-icon-button [matMenuTriggerFor]="menu" class="icon-btn">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      @if (job.status === 'draft') {
                        <button mat-menu-item (click)="publish(job)">
                          <mat-icon>publish</mat-icon> Publish
                        </button>
                      }
                      @if (job.status === 'published') {
                        <button mat-menu-item (click)="close(job)">
                          <mat-icon>do_not_disturb</mat-icon> Close Listing
                        </button>
                      }
                    </mat-menu>
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
      }
    </div>
  `,
  styles: [`
    .jobs-header {
      background: linear-gradient(135deg, #0a0a1a 0%, #0d1a3a 50%, #0a0a1a 100%);
      padding: 40px 24px 32px;
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
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0,188,212,0.1);
      border: 1px solid rgba(0,188,212,0.25);
      border-radius: 50px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #00e5ff;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }

    .jobs-header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(22px, 3vw, 34px);
      font-weight: 800;
      color: white;
      margin: 0 0 6px;
      span { background: linear-gradient(135deg, #00e5ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    }

    .jobs-header p { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; }

    .post-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      font-weight: 600 !important;
      padding: 0 20px !important;
      height: 44px !important;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    .center { display: flex; justify-content: center; padding: 64px; }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ddd; }
      h3 { font-size: 20px; color: #555; margin: 16px 0 8px; }
      p { font-size: 14px; color: #aaa; margin-bottom: 24px; }
    }

    .jobs-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

    .job-card {
      background: white;
      border-radius: 16px;
      padding: 18px 22px;
      border: 1px solid rgba(108,63,197,0.1);
      border-left: 4px solid #00bcd4;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s;
      box-shadow: 0 2px 12px rgba(0,188,212,0.05);

      &:hover {
        box-shadow: 0 6px 24px rgba(0,188,212,0.12);
        transform: translateY(-2px);
      }
    }

    .job-card-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .job-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0097a7, #00bcd4);
      color: white;
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .job-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
      text-decoration: none;
      display: block;
      margin-bottom: 6px;
      &:hover { color: #0097a7; }
    }

    .job-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      span {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 12px;
        color: #888;
        mat-icon { font-size: 13px; width: 13px; height: 13px; color: #bbb; }
      }
    }

    .job-card-right {
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

    .status-published { background: rgba(46,125,50,0.1); color: #2e7d32; }
    .status-draft { background: rgba(97,97,97,0.1); color: #555; }
    .status-closed { background: rgba(198,40,40,0.1); color: #c62828; }
    .status-paused { background: rgba(230,81,0,0.1); color: #e65100; }

    .job-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-btn {
      color: #888 !important;
      &:hover { color: #0097a7 !important; background: rgba(0,188,212,0.08) !important; }
    }

    .paginator { background: transparent; margin-top: 8px; }

    @media (max-width: 600px) {
      .job-card { flex-direction: column; align-items: flex-start; }
      .job-card-right { align-items: flex-start; }
    }
  `]
})
export class RecruiterJobsComponent implements OnInit {
  private jobSvc = inject(JobService);
  private snack = inject(MatSnackBar);

  jobs: JobResponse[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  loading = false;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.jobSvc.listMyJobs(this.page, this.pageSize).subscribe({
      next: (res) => { this.jobs = res.items; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  publish(job: JobResponse): void {
    this.jobSvc.updateJobStatus(job.id, { status: JobListingStatus.PUBLISHED }).subscribe({
      next: (updated) => {
        const idx = this.jobs.findIndex(j => j.id === job.id);
        if (idx >= 0) this.jobs[idx] = updated;
        this.snack.open('Job published', 'Close', { duration: 2000 });
      }
    });
  }

  close(job: JobResponse): void {
    this.jobSvc.updateJobStatus(job.id, { status: JobListingStatus.CLOSED }).subscribe({
      next: (updated) => {
        const idx = this.jobs.findIndex(j => j.id === job.id);
        if (idx >= 0) this.jobs[idx] = updated;
        this.snack.open('Job closed', 'Close', { duration: 2000 });
      }
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }
}
