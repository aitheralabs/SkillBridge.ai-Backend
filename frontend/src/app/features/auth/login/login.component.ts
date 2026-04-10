import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/enums';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">✦</span>
          Skill<span>Bridge</span>
          <span class="ai-tag">AI</span>
        </div>

        <h2>Welcome back</h2>
        <p class="subtitle">Sign in to your AI-powered career platform</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field-group">
            <label>Email address</label>
            <mat-form-field appearance="outline" class="full-width">
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="you@example.com" autocomplete="email">
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="field-group">
            <label>Password</label>
            <mat-form-field appearance="outline" class="full-width">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
                <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
          </div>

          @if (error) {
            <div class="error-message">{{ error }}</div>
          }

          <button mat-raised-button color="primary" class="full-width submit-btn" type="submit" [disabled]="loading || form.invalid">
            @if (loading) {
              <mat-spinner diameter="20" style="display:inline-block"></mat-spinner>
            } @else {
              <mat-icon>login</mat-icon> Sign In
            }
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/auth/forgot-password">Forgot password?</a>
          <span class="divider">•</span>
          <a routerLink="/auth/register">Create account</a>
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
      max-width: 440px;
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
      margin-bottom: 28px;

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
      font-size: 28px;
      margin: 0 0 8px;
    }

    .subtitle {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      margin: 0 0 28px;
    }

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

      a { color: #00e5ff; text-decoration: none; font-weight: 500; }
      a:hover { text-decoration: underline; }
      .divider { margin: 0 10px; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  showPwd = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        if (res.user.role === UserRole.RECRUITER || res.user.role === UserRole.ADMIN) {
          this.router.navigate(['/recruiter/dashboard']);
        } else {
          this.router.navigate(['/seeker/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
