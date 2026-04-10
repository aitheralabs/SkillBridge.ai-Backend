import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../core/services/company.service';
import { CompanyResponse } from '../../../core/models/company.models';
import { CompanyVerificationStatus, Industry } from '../../../core/models/enums';

@Component({
  selector: 'app-recruiter-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <!-- Header -->
    <div class="page-header">
      <div class="header-glow"></div>
      <div class="header-inner">
        <div class="header-badge">
          <mat-icon>business</mat-icon>
          Company Profile
        </div>
        <h1>{{ company ? company.name : 'Register Your Company' }}</h1>
        <p>{{ company ? 'Manage your company information' : 'Set up your company to start posting jobs' }}</p>
      </div>
    </div>

    <div class="page-container">
      @if (loading) {
        <div class="center"><mat-spinner color="accent"></mat-spinner></div>
      }

      @if (!loading) {
        <!-- Status banner -->
        @if (company) {
          <div class="status-banner status-{{ company.verificationStatus }}">
            <mat-icon>{{ company.verificationStatus === CVS.VERIFIED ? 'verified' : company.verificationStatus === CVS.REJECTED ? 'cancel' : 'pending' }}</mat-icon>
            <div>
              <div class="status-title">{{ company.verificationStatus | titlecase }}</div>
              <div class="status-sub">
                @if (company.verificationStatus === CVS.PENDING) { Your company profile is under review. You can still post jobs. }
                @if (company.verificationStatus === CVS.VERIFIED) { Your company is verified. }
                @if (company.verificationStatus === CVS.REJECTED) { {{ company.rejectionReason || 'Verification was rejected.' }} }
              </div>
            </div>
          </div>
        }

        <div class="form-card">
          <div class="form-card-title">
            <div class="form-title-icon"><mat-icon>edit</mat-icon></div>
            Company Details
          </div>

          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="field-group">
              <label class="field-label">Company Name *</label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-icon matPrefix>apartment</mat-icon>
                <input matInput formControlName="name" placeholder="e.g. Acme Corporation">
                @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                  <mat-error>Company name is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="field-group">
              <label class="field-label">About Your Company</label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput formControlName="description" rows="5"
                  placeholder="Describe your company, culture, and mission..."></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <div class="field-group">
                <label class="field-label">Industry</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-icon matPrefix>category</mat-icon>
                  <mat-select formControlName="industry">
                    <mat-option value="">Select industry...</mat-option>
                    @for (i of industries; track i) {
                      <mat-option [value]="i">{{ i | titlecase }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="field-group">
                <label class="field-label">Headquarters Location</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-icon matPrefix>location_on</mat-icon>
                  <input matInput formControlName="headquartersLocation" placeholder="City, Country">
                </mat-form-field>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Website URL</label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-icon matPrefix>language</mat-icon>
                <input matInput formControlName="websiteUrl" placeholder="https://yourcompany.com">
              </mat-form-field>
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
                  <mat-icon>{{ company ? 'save' : 'business_center' }}</mat-icon>
                }
                {{ company ? 'Save Changes' : 'Register Company' }}
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

    .status-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; flex-shrink: 0; }
    }

    .status-pending { background: rgba(230,81,0,0.08); border: 1px solid rgba(230,81,0,0.2); mat-icon { color: #e65100; } }
    .status-verified { background: rgba(46,125,50,0.08); border: 1px solid rgba(46,125,50,0.2); mat-icon { color: #2e7d32; } }
    .status-rejected { background: rgba(198,40,40,0.08); border: 1px solid rgba(198,40,40,0.2); mat-icon { color: #c62828; } }

    .status-title { font-weight: 700; font-size: 14px; color: #1a1a2e; }
    .status-sub { font-size: 13px; color: #666; margin-top: 2px; }

    .form-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      border: 1px solid rgba(108,63,197,0.1);
      box-shadow: 0 4px 24px rgba(108,63,197,0.06);
      max-width: 760px;
    }

    .form-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 24px;
    }

    .form-title-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0097a7, #00bcd4);
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; font-size: 18px; width: 18px; height: 18px; }
    }

    .field-group { margin-bottom: 4px; }

    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .form-actions { margin-top: 8px; }

    .save-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      height: 46px !important;
      font-weight: 600 !important;
      padding: 0 28px !important;
      mat-icon { margin-right: 6px; vertical-align: middle; }
    }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RecruiterCompanyComponent implements OnInit {
  private companySvc = inject(CompanyService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  CVS = CompanyVerificationStatus;
  company: CompanyResponse | null = null;
  loading = true;
  saving = false;
  error = '';
  industries = Object.values(Industry);

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    industry: [''],
    headquartersLocation: [''],
    websiteUrl: [''],
  });

  ngOnInit(): void {
    this.companySvc.getMyCompany().subscribe({
      next: (c) => {
        this.company = c;
        this.form.patchValue(c as any);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';
    const data = this.form.value as any;
    const obs = this.company
      ? this.companySvc.updateCompany(data)
      : this.companySvc.createCompany(data);

    obs.subscribe({
      next: (c) => {
        this.company = c;
        this.saving = false;
        this.snack.open('Company saved', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.error = err.error?.message || 'Save failed';
        this.saving = false;
      }
    });
  }
}
