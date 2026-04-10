import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">✦</span>
          Skill<span>Bridge</span>
          <span class="ai-tag">AI</span>
        </div>

        @if (!sent) {
          <h2>Forgot Password</h2>
          <p class="subtitle">Enter your email and we'll send a reset link</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-icon matPrefix>email</mat-icon>
                <input matInput type="email" formControlName="email" placeholder="you@example.com">
              </mat-form-field>
            </div>

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            <button mat-raised-button class="full-width submit-btn" type="submit" [disabled]="loading || form.invalid">
              @if (loading) {
                <mat-spinner diameter="20" style="display:inline-block"></mat-spinner>
              } @else {
                <mat-icon>send</mat-icon> Send Reset Link
              }
            </button>
          </form>
        } @else {
          <div class="success-state">
            <div class="success-icon"><mat-icon>mark_email_read</mat-icon></div>
            <h2>Check your inbox</h2>
            <p class="subtitle">If that email is registered, a reset link has been sent.</p>
          </div>
        }

        <div class="auth-footer">
          <a routerLink="/auth/login">
            <mat-icon>arrow_back</mat-icon> Back to Sign In
          </a>
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
      background: radial-gradient(circle, rgba(108,63,197,0.2) 0%, transparent 70%);
      top: -150px; right: -150px;
      border-radius: 50%;
    }

    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
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

    h2 { color: white; font-family: 'Space Grotesk', sans-serif; font-size: 26px; margin: 0 0 8px; }
    .subtitle { color: rgba(255,255,255,0.5); font-size: 14px; margin: 0 0 28px; }

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
      .mat-mdc-form-field-icon-prefix mat-icon { color: rgba(255,255,255,0.5) !important; }
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

    .success-state { text-align: center; }

    .success-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: rgba(46,125,50,0.15);
      border: 1px solid rgba(46,125,50,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      mat-icon { color: #66bb6a; font-size: 32px; width: 32px; height: 32px; }
    }

    .auth-footer {
      margin-top: 24px;
      text-align: center;
      a {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: rgba(255,255,255,0.5);
        text-decoration: none;
        font-size: 14px;
        &:hover { color: #00e5ff; }
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = false;
  sent = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: () => { this.loading = false; this.sent = true; },
      error: (err) => { this.error = err.error?.message || 'Request failed'; this.loading = false; }
    });
  }
}
