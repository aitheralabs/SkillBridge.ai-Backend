import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
import { JobService } from '../../../core/services/job.service';
import { JobSummary } from '../../../core/models/job.models';
import { EmploymentType, Industry } from '../../../core/models/enums';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule],
  template: `
    <!-- Hero -->
    <div class="jobs-hero">
      <div class="hero-content">
        <div class="ai-badge">AI-Powered Job Matching</div>
        <h1>Find Your <span>Dream Career</span></h1>
        <p>Discover opportunities matched to your skills using intelligent AI recommendations</p>
      </div>
    </div>

    <div class="page-container">
      <!-- Filters -->
      <div class="filter-panel">
        <form [formGroup]="filters" class="filter-form">
          <mat-form-field appearance="outline">
            <mat-label>Search jobs</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput formControlName="q" placeholder="Title, company, skill...">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <mat-icon matPrefix>location_on</mat-icon>
            <input matInput formControlName="location" placeholder="City or Remote">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Industry</mat-label>
            <mat-select formControlName="industry">
              <mat-option value="">All Industries</mat-option>
              @for (i of industries; track i) {
                <mat-option [value]="i">{{ i | titlecase }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Employment Type</mat-label>
            <mat-select formControlName="employmentType">
              <mat-option value="">All Types</mat-option>
              @for (t of employmentTypes; track t) {
                <mat-option [value]="t">{{ t.replace('_',' ') | titlecase }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </form>
      </div>

      <!-- Results count -->
      @if (!loading) {
        <div class="results-bar">
          <span class="results-count">
            <mat-icon>work</mat-icon>
            {{ total }} job{{ total !== 1 ? 's' : '' }} found
          </span>
        </div>
      }

      @if (loading) {
        <div class="center">
          <mat-spinner color="accent"></mat-spinner>
        </div>
      }

      @if (!loading) {
        <div class="job-grid">
          @for (job of jobs; track job.id) {
            <div class="job-card" [routerLink]="['/jobs', job.id]">
              <div class="job-card-header">
                <div class="company-avatar">{{ job.companyNameSnapshot[0] }}</div>
                <div>
                  <div class="job-title">{{ job.title }}</div>
                  <div class="company-name">{{ job.companyNameSnapshot }}</div>
                </div>
                <div class="job-type-badge">{{ job.employmentType?.replace('_',' ') || 'Full Time' }}</div>
              </div>

              <div class="job-meta">
                <span><mat-icon>location_on</mat-icon>{{ job.location || 'Remote' }}</span>
                @if (job.experienceLevel) {
                  <span><mat-icon>trending_up</mat-icon>{{ job.experienceLevel.replace('_',' ') | titlecase }}</span>
                }
                @if (job.industry) {
                  <span><mat-icon>business</mat-icon>{{ job.industry | titlecase }}</span>
                }
              </div>

              @if (job.salaryMin && job.salaryMax) {
                <div class="salary-range">
                  <mat-icon>payments</mat-icon>
                  {{ job.currency || 'USD' }} {{ job.salaryMin | number }} – {{ job.salaryMax | number }}
                </div>
              }

              <div class="job-card-footer">
                <span class="posted-date">
                  <mat-icon>schedule</mat-icon>
                  {{ job.publishedAt | date:'mediumDate' }}
                </span>
                <button mat-stroked-button color="primary" class="view-btn">
                  View Details <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>

        @if (jobs.length === 0) {
          <div class="empty-state">
            <mat-icon>search_off</mat-icon>
            <h3>No jobs found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        }

        <mat-paginator
          [length]="total"
          [pageSize]="pageSize"
          [pageIndex]="page - 1"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)">
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    .jobs-hero {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      padding: 60px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .jobs-hero::before {
      content: '';
      position: absolute;
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, rgba(108,63,197,0.2) 0%, transparent 70%);
      top: 0; left: 50%; transform: translateX(-50%);
    }

    .hero-content { position: relative; z-index: 1; }

    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0,229,255,0.1);
      border: 1px solid rgba(0,229,255,0.3);
      border-radius: 50px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      color: #00e5ff;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .ai-badge::before { content: '✦'; }

    .jobs-hero h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(28px, 5vw, 48px);
      font-weight: 800;
      color: white;
      margin: 0 0 12px;
      span { background: linear-gradient(135deg, #00e5ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    }

    .jobs-hero p { color: rgba(255,255,255,0.6); font-size: 16px; margin: 0; }

    .filter-panel {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin: -24px 0 32px;
      box-shadow: 0 8px 32px rgba(108,63,197,0.12);
      border: 1px solid rgba(108,63,197,0.1);
    }

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      mat-form-field { flex: 1 1 200px; }
    }

    .results-bar {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #6c3fc5;
      font-size: 15px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .job-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .job-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(108,63,197,0.12);
      border-left: 4px solid #6c3fc5;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 2px 12px rgba(108,63,197,0.06);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(108,63,197,0.18);
        border-left-color: #00bcd4;
      }
    }

    .job-card-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 16px;
    }

    .company-avatar {
      width: 44px; height: 44px;
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

    .job-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: #1a1a2e;
      line-height: 1.3;
    }

    .company-name {
      color: #6c3fc5;
      font-size: 13px;
      font-weight: 500;
      margin-top: 2px;
    }

    .job-type-badge {
      margin-left: auto;
      flex-shrink: 0;
      background: rgba(108,63,197,0.08);
      color: #6c3fc5;
      border: 1px solid rgba(108,63,197,0.2);
      border-radius: 50px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .job-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #666;
        mat-icon { font-size: 15px; width: 15px; height: 15px; color: #aaa; }
      }
    }

    .salary-range {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #2e7d32;
      background: rgba(46,125,50,0.08);
      border-radius: 8px;
      padding: 6px 12px;
      margin-bottom: 16px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .job-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(108,63,197,0.08);
      padding-top: 14px;
    }

    .posted-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #aaa;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .view-btn {
      border-radius: 50px !important;
      font-size: 13px !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-left: 4px; }
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #aaa;
      mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.3; }
      h3 { font-size: 20px; color: #666; margin: 16px 0 8px; }
      p { font-size: 14px; }
    }

    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class JobListComponent implements OnInit {
  private jobSvc = inject(JobService);
  private fb = inject(FormBuilder);

  jobs: JobSummary[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  loading = false;

  industries = Object.values(Industry);
  employmentTypes = Object.values(EmploymentType);

  filters = this.fb.group({ q: [''], location: [''], industry: [''], employmentType: [''] });

  ngOnInit(): void {
    this.load();
    this.filters.valueChanges.pipe(debounceTime(400)).subscribe(() => { this.page = 1; this.load(); });
  }

  load(): void {
    this.loading = true;
    const f = this.filters.value;
    this.jobSvc.searchJobs({
      page: this.page, pageSize: this.pageSize,
      q: f.q ?? undefined, location: f.location ?? undefined,
      industry: f.industry ?? undefined, employmentType: f.employmentType ?? undefined,
    }).subscribe({
      next: (res) => { this.jobs = res.items; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
}
