import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { JobResponse } from '../../../core/models/job.models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatIconModule, MatSnackBarModule],
  template: `
    @if (loading) {
      <div class="loading-screen">
        <mat-spinner color="accent" diameter="48"></mat-spinner>
      </div>
    }

    @if (job) {
      <!-- Hero -->
      <div class="job-hero">
        <div class="hero-glow"></div>
        <div class="hero-grid"></div>
        <div class="hero-inner">
          <a routerLink="/jobs" class="back-link">
            <mat-icon>arrow_back</mat-icon> All Jobs
          </a>
          <div class="job-hero-content">
            <div class="company-avatar-lg">{{ job.companyNameSnapshot[0] }}</div>
            <div class="job-hero-info">
              <div class="job-hero-title">{{ job.title }}</div>
              <div class="job-hero-company">
                <mat-icon>business</mat-icon>
                {{ job.companyNameSnapshot }}
              </div>
              <div class="job-hero-meta">
                @if (job.location) {
                  <span><mat-icon>location_on</mat-icon>{{ job.location }}</span>
                }
                @if (job.employmentType) {
                  <span><mat-icon>schedule</mat-icon>{{ job.employmentType.replace('_', ' ') | titlecase }}</span>
                }
                @if (job.experienceLevel) {
                  <span><mat-icon>trending_up</mat-icon>{{ job.experienceLevel.replace('_', ' ') | titlecase }}</span>
                }
                @if (job.industry) {
                  <span><mat-icon>category</mat-icon>{{ job.industry | titlecase }}</span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-container detail-layout">
        <!-- Main content -->
        <div class="detail-main">
          <!-- Salary -->
          @if (job.salaryMin && job.salaryMax) {
            <div class="salary-card">
              <mat-icon>payments</mat-icon>
              <div>
                <div class="salary-label">Salary Range</div>
                <div class="salary-value">
                  {{ job.currency || 'USD' }} {{ job.salaryMin | number }} – {{ job.salaryMax | number }}
                </div>
              </div>
            </div>
          }

          <!-- Description -->
          <div class="content-card">
            <div class="section-title">
              <mat-icon>description</mat-icon>
              About This Role
            </div>
            <div class="job-description">{{ job.description }}</div>
          </div>

          <!-- Required Skills -->
          @if (job.requiredSkills?.length) {
            <div class="content-card">
              <div class="section-title">
                <mat-icon>psychology</mat-icon>
                Required Skills
              </div>
              <div class="skills-grid">
                @for (skill of job.requiredSkills; track skill) {
                  <span class="skill-chip">{{ skill }}</span>
                }
              </div>
            </div>
          }

          <!-- Apply Form -->
          @if (showApplyForm && auth.isJobSeeker()) {
            <div class="content-card apply-form-card">
              <div class="section-title">
                <mat-icon>send</mat-icon>
                Submit Application
              </div>
              <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Cover Letter (optional)</mat-label>
                  <textarea matInput formControlName="coverLetter" rows="6"
                    placeholder="Tell the employer why you're a great fit..."></textarea>
                </mat-form-field>
                @if (applyError) {
                  <div class="error-msg">
                    <mat-icon>error_outline</mat-icon>
                    {{ applyError }}
                  </div>
                }
                <div class="form-actions">
                  <button mat-raised-button class="submit-apply-btn" type="submit" [disabled]="applying">
                    @if (applying) {
                      <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner>
                    } @else {
                      <mat-icon>send</mat-icon>
                    }
                    Submit Application
                  </button>
                  <button mat-stroked-button type="button" class="cancel-btn" (click)="showApplyForm = false">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          }
        </div>

        <!-- Sidebar -->
        <div class="detail-sidebar">
          <div class="sidebar-card">
            <!-- Apply CTA -->
            @if (!auth.isLoggedIn()) {
              <a mat-raised-button routerLink="/auth/register" class="apply-btn">
                <mat-icon>person_add</mat-icon>
                Sign Up to Apply
              </a>
            }
            @if (auth.isJobSeeker()) {
              @if (job.applicationMode === 'internal') {
                @if (!applied) {
                  <button mat-raised-button class="apply-btn" (click)="showApplyForm = !showApplyForm">
                    <mat-icon>{{ showApplyForm ? 'close' : 'send' }}</mat-icon>
                    {{ showApplyForm ? 'Cancel' : 'Apply Now' }}
                  </button>
                } @else {
                  <div class="applied-badge">
                    <mat-icon>check_circle</mat-icon>
                    Application Submitted
                  </div>
                }
              } @else {
                <a mat-raised-button class="apply-btn" [href]="job.applyUrl" target="_blank" rel="noopener">
                  <mat-icon>open_in_new</mat-icon>
                  Apply Externally
                </a>
              }
            }

            <!-- Job details list -->
            <div class="detail-list">
              @if (job.applicationDeadline) {
                <div class="detail-item">
                  <mat-icon>event</mat-icon>
                  <div>
                    <div class="detail-item-label">Deadline</div>
                    <div class="detail-item-value">{{ job.applicationDeadline | date:'longDate' }}</div>
                  </div>
                </div>
              }
              @if (job.publishedAt) {
                <div class="detail-item">
                  <mat-icon>calendar_today</mat-icon>
                  <div>
                    <div class="detail-item-label">Posted</div>
                    <div class="detail-item-value">{{ job.publishedAt | date:'mediumDate' }}</div>
                  </div>
                </div>
              }
              @if (job.employmentType) {
                <div class="detail-item">
                  <mat-icon>work</mat-icon>
                  <div>
                    <div class="detail-item-label">Employment Type</div>
                    <div class="detail-item-value">{{ job.employmentType.replace('_', ' ') | titlecase }}</div>
                  </div>
                </div>
              }
              @if (job.experienceLevel) {
                <div class="detail-item">
                  <mat-icon>trending_up</mat-icon>
                  <div>
                    <div class="detail-item-label">Experience Level</div>
                    <div class="detail-item-value">{{ job.experienceLevel.replace('_', ' ') | titlecase }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .job-hero {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      padding: 36px 24px 48px;
      position: relative;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, rgba(108,63,197,0.2) 0%, transparent 70%);
      top: -50px; left: 50%; transform: translateX(-50%);
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

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      margin-bottom: 20px;
      &:hover { color: #00e5ff; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .job-hero-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .company-avatar-lg {
      width: 64px; height: 64px;
      border-radius: 18px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-weight: 800;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .job-hero-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(20px, 3vw, 32px);
      font-weight: 800;
      color: white;
      margin-bottom: 6px;
      line-height: 1.2;
    }

    .job-hero-company {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 15px;
      color: #a78bfa;
      font-weight: 600;
      margin-bottom: 12px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .job-hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      span {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: rgba(255,255,255,0.55);
        mat-icon { font-size: 14px; width: 14px; height: 14px; color: rgba(255,255,255,0.3); }
      }
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
      margin-top: -24px;
    }

    .salary-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: linear-gradient(135deg, rgba(46,125,50,0.1), rgba(46,125,50,0.05));
      border: 1px solid rgba(46,125,50,0.2);
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 20px;
      mat-icon { color: #2e7d32; font-size: 28px; width: 28px; height: 28px; }
    }

    .salary-label { font-size: 11px; color: #2e7d32; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .salary-value { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #2e7d32; }

    .content-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(108,63,197,0.1);
      box-shadow: 0 4px 20px rgba(108,63,197,0.06);
      margin-bottom: 20px;
    }

    .apply-form-card {
      border-color: rgba(108,63,197,0.2);
      border-top: 3px solid #6c3fc5;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 16px;
      mat-icon { color: #6c3fc5; font-size: 20px; width: 20px; height: 20px; }
    }

    .job-description {
      font-size: 14px;
      color: #444;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-chip {
      background: rgba(108,63,197,0.08);
      color: #6c3fc5;
      border: 1px solid rgba(108,63,197,0.2);
      border-radius: 50px;
      padding: 5px 14px;
      font-size: 13px;
      font-weight: 600;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #c62828;
      font-size: 14px;
      margin-bottom: 12px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .submit-apply-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      font-weight: 600 !important;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    .cancel-btn {
      border-radius: 50px !important;
      color: #888 !important;
    }

    /* Sidebar */
    .sidebar-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid rgba(108,63,197,0.1);
      box-shadow: 0 4px 20px rgba(108,63,197,0.06);
      position: sticky;
      top: 80px;
    }

    .apply-btn {
      width: 100%;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      height: 48px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 20px rgba(108,63,197,0.4) !important;
      margin-bottom: 20px;
      mat-icon { margin-right: 8px; vertical-align: middle; }
    }

    .applied-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(46,125,50,0.1);
      border: 1px solid rgba(46,125,50,0.3);
      border-radius: 50px;
      padding: 12px 20px;
      color: #2e7d32;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 20px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .detail-list { display: flex; flex-direction: column; gap: 2px; }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 8px;
      border-radius: 10px;
      mat-icon { color: #bbb; font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    }

    .detail-item-label { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .detail-item-value { font-size: 14px; font-weight: 600; color: #333; margin-top: 1px; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
      .detail-sidebar { order: -1; }
      .sidebar-card { position: static; }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobSvc = inject(JobService);
  private appSvc = inject(ApplicationService);
  private snack = inject(MatSnackBar);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  job: JobResponse | null = null;
  loading = true;
  showApplyForm = false;
  applied = false;
  applying = false;
  applyError = '';

  applyForm = this.fb.group({ coverLetter: [''] });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.jobSvc.getPublicJob(id).subscribe({
      next: (j) => { this.job = j; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  submitApplication(): void {
    if (!this.job) return;
    this.applying = true;
    this.applyError = '';
    this.appSvc.applyToJob(this.job.id, { coverLetter: this.applyForm.value.coverLetter || undefined }).subscribe({
      next: () => {
        this.applying = false;
        this.applied = true;
        this.showApplyForm = false;
        this.snack.open('Application submitted!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.applyError = err.error?.message || 'Application failed';
        this.applying = false;
      }
    });
  }
}
