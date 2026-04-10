import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/enums';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">✦</span>
          Skill<span>Bridge</span>
          <span class="ai-tag">AI</span>
        </div>

        <h2>Create Account</h2>
        <p class="subtitle">Join the AI-powered career platform</p>

        <!-- Role selector cards -->
        <div class="role-selector">
          <div class="role-card" [class.selected]="selectedRole === UserRole.JOB_SEEKER"
               (click)="selectRole(UserRole.JOB_SEEKER)">
            <div class="role-icon">
              <mat-icon>person_search</mat-icon>
            </div>
            <div class="role-name">Job Seeker</div>
            <div class="role-desc">Find your dream career</div>
          </div>
          <div class="role-card" [class.selected]="selectedRole === UserRole.RECRUITER"
               (click)="selectRole(UserRole.RECRUITER)">
            <div class="role-icon recruiter">
              <mat-icon>business_center</mat-icon>
            </div>
            <div class="role-name">Recruiter</div>
            <div class="role-desc">Hire top talent</div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field-group">
            <label>Email address</label>
            <mat-form-field appearance="outline" class="full-width">
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="you@example.com" autocomplete="email">
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="field-group">
            <label>Password</label>
            <mat-form-field appearance="outline" class="full-width">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
                <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>At least 8 characters required</mat-error>
              }
            </mat-form-field>
          </div>

          @if (error) {
            <div class="error-message">{{ error }}</div>
          }

          <button mat-raised-button class="full-width submit-btn" type="submit" [disabled]="loading || form.invalid">
            @if (loading) {
              <mat-spinner diameter="20" style="display:inline-block"></mat-spinner>
            } @else {
              <mat-icon>rocket_launch</mat-icon> Get Started
            }
          </button>
        </form>

        <div class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .auth-container::before {
      content: '';
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(108,63,197,0.25) 0%, transparent 70%);
      top: -150px; right: -150px;
      border-radius: 50%;
    }

    .auth-container::after {
      content: '';
      position: absolute;
      width: 350px; height: 350px;
      background: radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%);
      bottom: -100px; left: -100px;
      border-radius: 50%;
    }

    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin-bottom: 24px;
      span:not(.logo-icon):not(.ai-tag) { color: #00e5ff; }
    }

    .logo-icon { color: #00e5ff; animation: pulse 2s infinite; }

    .ai-tag {
      font-size: 10px;
      font-weight: 700;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      padding: 2px 7px;
      border-radius: 50px;
      letter-spacing: 1px;
    }

    h2 {
      color: white;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      margin: 0 0 6px;
    }

    .subtitle {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      margin: 0 0 24px;
    }

    .role-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .role-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;

      &:hover { border-color: rgba(108,63,197,0.4); background: rgba(108,63,197,0.08); }
      &.selected { border-color: #6c3fc5; background: rgba(108,63,197,0.15); }
    }

    .role-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      background: rgba(108,63,197,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
      mat-icon { color: #a78bfa; font-size: 20px; width: 20px; height: 20px; }
      &.recruiter { background: rgba(0,188,212,0.15); mat-icon { color: #00e5ff; } }
    }

    .role-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 3px; }
    .role-desc { font-size: 11px; color: rgba(255,255,255,0.4); }

    .field-group {
      margin-bottom: 4px;
      label {
        display: block;
        color: rgba(255,255,255,0.7);
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
      }
    }

    ::ng-deep .auth-card .mat-mdc-form-field {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.2) !important; }
      input { color: white !important; }
      .mat-mdc-form-field-icon-prefix mat-icon,
      .mat-mdc-form-field-icon-suffix mat-icon { color: rgba(255,255,255,0.5) !important; }
    }

    .error-message {
      background: rgba(198,40,40,0.15);
      border: 1px solid rgba(198,40,40,0.3);
      border-radius: 10px;
      padding: 10px 14px;
      color: #ef9a9a;
      font-size: 13px;
      margin-bottom: 12px;
    }

    .submit-btn {
      margin-top: 20px !important;
      height: 48px !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      border-radius: 50px !important;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      box-shadow: 0 4px 20px rgba(108,63,197,0.5) !important;
      mat-icon { margin-right: 8px; vertical-align: middle; }
    }

    .auth-footer {
      margin-top: 24px;
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      a { color: #00e5ff; text-decoration: none; font-weight: 500; margin-left: 4px; }
      a:hover { text-decoration: underline; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  UserRole = UserRole;

  showPwd = false;
  selectedRole = UserRole.JOB_SEEKER;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: [UserRole.JOB_SEEKER, Validators.required],
  });

  loading = false;
  error = '';

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.form.patchValue({ role });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value as any).subscribe({
      next: (res) => {
        if (res.user.role === UserRole.RECRUITER) {
          this.router.navigate(['/recruiter/dashboard']);
        } else {
          this.router.navigate(['/seeker/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
