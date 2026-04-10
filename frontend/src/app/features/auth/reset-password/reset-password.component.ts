import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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

        @if (!done) {
          <h2>Set New Password</h2>
          <p class="subtitle">Choose a strong password for your account</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field-group">
              <label>New Password</label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="newPassword">
                <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
                  <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
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
                <mat-icon>lock_reset</mat-icon> Reset Password
              }
            </button>
          </form>
        } @else {
          <div class="success-state">
            <div class="success-icon"><mat-icon>check_circle</mat-icon></div>
            <h2>Password Reset!</h2>
            <p class="subtitle">Your password has been updated successfully.</p>
            <a mat-raised-button routerLink="/auth/login" class="login-btn">
              <mat-icon>login</mat-icon> Sign In Now
            </a>
          </div>
        }
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

    .success-state { text-align: center; }

    .success-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: rgba(0,188,212,0.12);
      border: 1px solid rgba(0,188,212,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      mat-icon { color: #00e5ff; font-size: 32px; width: 32px; height: 32px; }
    }

    .login-btn {
      background: linear-gradient(135deg, #6c3fc5, #00bcd4) !important;
      color: white !important;
      border-radius: 50px !important;
      height: 48px !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      mat-icon { margin-right: 8px; vertical-align: middle; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  showPwd = false;
  form = this.fb.group({ newPassword: ['', [Validators.required, Validators.minLength(8)]] });
  token = '';
  loading = false;
  done = false;
  error = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.error = 'Invalid reset link';
  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    this.loading = true;
    this.auth.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: () => { this.loading = false; this.done = true; },
      error: (err) => { this.error = err.error?.message || 'Reset failed'; this.loading = false; }
    });
  }
}
