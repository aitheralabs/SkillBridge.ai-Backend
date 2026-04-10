import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Email Verification</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading) {
            <div class="center"><mat-spinner></mat-spinner></div>
          }
          @if (success) {
            <p>Your email has been verified successfully!</p>
            <a mat-raised-button color="primary" routerLink="/auth/login">Go to Login</a>
          }
          @if (error) {
            <p class="error-message">{{ error }}</p>
            <a mat-button routerLink="/auth/login">Go to Login</a>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 24px; }
    .auth-card { width: 100%; max-width: 400px; padding: 16px; }
    .center { display: flex; justify-content: center; padding: 24px; }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  loading = true;
  success = false;
  error = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading = false;
      this.error = 'No verification token provided';
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: () => { this.loading = false; this.success = true; },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Verification failed'; }
    });
  }
}
