import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { jobSeekerGuard, recruiterGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' },

  // Auth
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    ]
  },

  // Public job browsing
  { path: 'jobs', loadComponent: () => import('./features/jobs/job-list/job-list.component').then(m => m.JobListComponent) },
  { path: 'jobs/:id', loadComponent: () => import('./features/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent) },

  // Job seeker
  {
    path: 'seeker',
    canActivate: [jobSeekerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/job-seeker/dashboard/seeker-dashboard.component').then(m => m.SeekerDashboardComponent) },
      { path: 'profile', loadComponent: () => import('./features/job-seeker/profile/seeker-profile.component').then(m => m.SeekerProfileComponent) },
      { path: 'applications', loadComponent: () => import('./features/job-seeker/applications/seeker-applications.component').then(m => m.SeekerApplicationsComponent) },
    ]
  },

  // Recruiter — jobs sub-routes MUST be nested so 'jobs/new' doesn't get swallowed by 'jobs' prefix match
  {
    path: 'recruiter',
    canActivate: [recruiterGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/recruiter/dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboardComponent) },
      { path: 'company', loadComponent: () => import('./features/recruiter/company/recruiter-company.component').then(m => m.RecruiterCompanyComponent) },
      {
        path: 'jobs',
        children: [
          { path: '', pathMatch: 'full', loadComponent: () => import('./features/recruiter/jobs/recruiter-jobs.component').then(m => m.RecruiterJobsComponent) },
          { path: 'new', loadComponent: () => import('./features/recruiter/job-form/job-form.component').then(m => m.JobFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/recruiter/job-form/job-form.component').then(m => m.JobFormComponent) },
          { path: ':id/applications', loadComponent: () => import('./features/recruiter/job-applications/job-applications.component').then(m => m.JobApplicationsComponent) },
        ]
      },
    ]
  },

  // Notifications (all logged-in users)
  { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },

  { path: '**', redirectTo: 'jobs' },
];
