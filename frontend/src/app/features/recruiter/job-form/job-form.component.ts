import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { JobService } from '../../../core/services/job.service';
import { ApplicationMode, EmploymentType, ExperienceLevel, Industry, JobListingStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatChipsModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <!-- Header -->
    <div class="page-header">
      <div class="header-glow"></div>
      <div class="header-inner">
        <a routerLink="/recruiter/jobs" class="back-link">
          <mat-icon>arrow_back</mat-icon> My Jobs
        </a>
        <div class="header-badge">
          <mat-icon>{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon>
          {{ isEdit ? 'Edit Job' : 'New Job Posting' }}
        </div>
        <h1>{{ isEdit ? 'Edit Job Listing' : 'Post a New Job' }}</h1>
        <p>{{ isEdit ? 'Update the job details below' : 'Fill in the details to find your next great hire' }}</p>
      </div>
    </div>

    <div class="page-container">
      @if (loading) {
        <div class="center"><mat-spinner color="accent"></mat-spinner></div>
      }

      @if (!loading) {
        <div class="form-layout">
          <form [formGroup]="form" (ngSubmit)="save()">
            <!-- Basic Info -->
            <div class="form-section">
              <div class="section-title">
                <div class="section-icon"><mat-icon>info</mat-icon></div>
                Basic Information
              </div>

              <div class="field-group">
                <label class="field-label">Job Title *</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-icon matPrefix>work</mat-icon>
                  <input matInput formControlName="title" placeholder="e.g. Senior Frontend Developer">
                  @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                    <mat-error>Job title is required</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="field-group">
                <label class="field-label">Job Description *</label>
                <mat-form-field appearance="outline" class="full-width">
                  <textarea matInput formControlName="description" rows="8"
                    placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity great..."></textarea>
                  @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
                    <mat-error>Description is required</mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

            <!-- Role Details -->
            <div class="form-section">
              <div class="section-title">
                <div class="section-icon cyan"><mat-icon>tune</mat-icon></div>
                Role Details
              </div>

              <div class="form-row">
                <div class="field-group">
                  <label class="field-label">Location</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>location_on</mat-icon>
                    <input matInput formControlName="location" placeholder="City or Remote">
                  </mat-form-field>
                </div>
                <div class="field-group">
                  <label class="field-label">Employment Type</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>schedule</mat-icon>
                    <mat-select formControlName="employmentType">
                      <mat-option value="">None</mat-option>
                      @for (t of employmentTypes; track t) {
                        <mat-option [value]="t">{{ t.replace('_', ' ') | titlecase }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <div class="form-row">
                <div class="field-group">
                  <label class="field-label">Industry</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>category</mat-icon>
                    <mat-select formControlName="industry">
                      <mat-option value="">None</mat-option>
                      @for (i of industries; track i) {
                        <mat-option [value]="i">{{ i | titlecase }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="field-group">
                  <label class="field-label">Experience Level</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>trending_up</mat-icon>
                    <mat-select formControlName="experienceLevel">
                      <mat-option value="">None</mat-option>
                      @for (l of experienceLevels; track l) {
                        <mat-option [value]="l">{{ l.replace('_', ' ') | titlecase }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <!-- Compensation -->
            <div class="form-section">
              <div class="section-title">
                <div class="section-icon green"><mat-icon>payments</mat-icon></div>
                Compensation
              </div>

              <div class="form-row three">
                <div class="field-group">
                  <label class="field-label">Salary Min</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <input matInput type="number" formControlName="salaryMin" placeholder="50000">
                  </mat-form-field>
                </div>
                <div class="field-group">
                  <label class="field-label">Salary Max</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <input matInput type="number" formControlName="salaryMax" placeholder="80000">
                  </mat-form-field>
                </div>
                <div class="field-group">
                  <label class="field-label">Currency</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <input matInput formControlName="currency" placeholder="USD">
                  </mat-form-field>
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div class="form-section">
              <div class="section-title">
                <div class="section-icon purple"><mat-icon>psychology</mat-icon></div>
                Required Skills
              </div>

              <div class="field-group">
                <label class="field-label">Add skills (press Enter or comma)</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-chip-grid #chipGrid>
                    @for (skill of skills; track skill) {
                      <mat-chip-row (removed)="removeSkill(skill)" class="skill-chip">
                        {{ skill }}
                        <button matChipRemove>
                          <mat-icon>close</mat-icon>
                        </button>
                      </mat-chip-row>
                    }
                  </mat-chip-grid>
                  <input placeholder="e.g. React, TypeScript..."
                         [matChipInputFor]="chipGrid"
                         [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
                         (matChipInputTokenEnd)="addSkill($event)">
                </mat-form-field>
              </div>
            </div>

            <!-- Application Settings -->
            <div class="form-section">
              <div class="section-title">
                <div class="section-icon gold"><mat-icon>settings</mat-icon></div>
                Application Settings
              </div>

              <div class="form-row">
                <div class="field-group">
                  <label class="field-label">Application Mode</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>send</mat-icon>
                    <mat-select formControlName="applicationMode">
                      <mat-option [value]="ApplicationMode.INTERNAL">Internal (apply on SkillBridge)</mat-option>
                      <mat-option [value]="ApplicationMode.EXTERNAL">External (link to external site)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="field-group">
                  <label class="field-label">Application Deadline</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>event</mat-icon>
                    <input matInput type="date" formControlName="applicationDeadline">
                  </mat-form-field>
                </div>
              </div>

              @if (form.get('applicationMode')?.value === ApplicationMode.EXTERNAL) {
                <div class="field-group">
                  <label class="field-label">External Apply URL</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>open_in_new</mat-icon>
                    <input matInput formControlName="applyUrl" placeholder="https://...">
                  </mat-form-field>
                </div>
              }

              <div class="field-group" style="max-width: 280px">
                <label class="field-label">Listing Status</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-icon matPrefix>toggle_on</mat-icon>
                  <mat-select formControlName="status">
                    <mat-option [value]="JobListingStatus.DRAFT">Save as Draft</mat-option>
                    <mat-option [value]="JobListingStatus.PUBLISHED">Publish Now</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            @if (error) {
              <div class="error-msg">
                <mat-icon>error_outline</mat-icon>
                {{ error }}
              </div>
            }

            <div class="form-actions">
              <button mat-raised-button class="save-btn" type="submit" [disabled]="saving || form.invalid">
                @if (saving) {
                  <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner>
                } @else {
                  <mat-icon>{{ isEdit ? 'save' : 'publish' }}</mat-icon>
                }
                {{ isEdit ? 'Save Changes' : (form.get('status')?.value === JobListingStatus.PUBLISHED ? 'Publish Job' : 'Save Draft') }}
              </button>
              <button mat-stroked-button type="button" class="cancel-btn" (click)="cancel()">
                Cancel
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
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
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      margin-bottom: 12px;
      &:hover { color: #00e5ff; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
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

    .page-header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(22px, 3vw, 34px);
      font-weight: 800;
      color: white;
      margin: 0 0 6px;
    }

    .page-header p { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; }

    .center { display: flex; justify-content: center; padding: 64px; }

    .form-layout { max-width: 820px; }

    .form-section {
      background: white;
      border-radius: 20px;
      padding: 24px 28px;
      border: 1px solid rgba(108,63,197,0.08);
      box-shadow: 0 4px 20px rgba(108,63,197,0.05);
      margin-bottom: 20px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 20px;
    }

    .section-icon {
      width: 34px; height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6c3fc5, #9333ea);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; font-size: 17px; width: 17px; height: 17px; }
      &.cyan { background: linear-gradient(135deg, #0097a7, #00bcd4); }
      &.green { background: linear-gradient(135deg, #388e3c, #66bb6a); }
      &.gold { background: linear-gradient(135deg, #f57c00, #ffb300); }
      &.purple { background: linear-gradient(135deg, #6c3fc5, #a78bfa); }
    }

    .field-group { margin-bottom: 4px; }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      &.three { grid-template-columns: 1fr 1fr 1fr; }
    }

    .skill-chip {
      background: rgba(108,63,197,0.08) !important;
      color: #6c3fc5 !important;
      border: 1px solid rgba(108,63,197,0.2) !important;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #c62828;
      font-size: 14px;
      margin-bottom: 16px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .save-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      height: 46px !important;
      font-weight: 600 !important;
      padding: 0 28px !important;
      box-shadow: 0 4px 20px rgba(108,63,197,0.35) !important;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    .cancel-btn {
      border-radius: 50px !important;
      color: #888 !important;
      height: 46px !important;
      padding: 0 24px !important;
    }

    @media (max-width: 600px) {
      .form-row, .form-row.three { grid-template-columns: 1fr; }
    }
  `]
})
export class JobFormComponent implements OnInit {
  private jobSvc = inject(JobService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  isEdit = false;
  jobId = '';
  loading = false;
  saving = false;
  error = '';
  skills: string[] = [];
  separatorKeyCodes = [ENTER, COMMA];

  ApplicationMode = ApplicationMode;
  JobListingStatus = JobListingStatus;
  employmentTypes = Object.values(EmploymentType);
  industries = Object.values(Industry);
  experienceLevels = Object.values(ExperienceLevel);

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    location: [''],
    employmentType: [''],
    industry: [''],
    experienceLevel: [''],
    salaryMin: [null as number | null],
    salaryMax: [null as number | null],
    currency: ['USD'],
    applicationMode: [ApplicationMode.INTERNAL, Validators.required],
    applyUrl: [''],
    applicationDeadline: [''],
    status: [JobListingStatus.DRAFT, Validators.required],
  });

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.isEdit = true;
      this.loading = true;
      this.jobSvc.getMyJob(this.jobId).subscribe({
        next: (job) => {
          this.form.patchValue(job as any);
          this.skills = job.requiredSkills || [];
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
  }

  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) this.skills.push(value);
    event.chipInput!.clear();
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter(s => s !== skill);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';
    const data = { ...this.form.value, requiredSkills: this.skills } as any;

    const obs = this.isEdit
      ? this.jobSvc.updateJob(this.jobId, data)
      : this.jobSvc.createJob(data);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.snack.open(this.isEdit ? 'Job updated' : 'Job posted', 'Close', { duration: 2000 });
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Save failed';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/recruiter/jobs']);
  }
}
