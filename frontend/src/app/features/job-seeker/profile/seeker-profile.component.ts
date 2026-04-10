import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import {
  ProfileResponse, EducationCreate, ExperienceCreate, SkillCreate, PreferencesUpsert
} from '../../../core/models/profile.models';
import { EmploymentType } from '../../../core/models/enums';

@Component({
  selector: 'app-seeker-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatTooltipModule, MatSlideToggleModule,
  ],
  template: `
    <div class="profile-root">

      <!-- ── Cover + Avatar Header ──────────────────────────── -->
      <div class="profile-cover">
        <div class="cover-glow"></div>
        <div class="cover-grid"></div>

        <div class="profile-header-inner page-container">
          <!-- Avatar -->
          <div class="avatar-wrapper">
            <div class="avatar-ring">
              <img *ngIf="avatarPreview" [src]="avatarPreview" class="avatar-img" alt="avatar">
              <div *ngIf="!avatarPreview" class="avatar-placeholder">
                {{ initials }}
              </div>
            </div>
            <button class="avatar-upload-btn" (click)="avatarInput.click()" matTooltip="Upload photo">
              <mat-icon>photo_camera</mat-icon>
            </button>
            <input #avatarInput type="file" accept="image/*" hidden (change)="onAvatarChange($event)">
          </div>

          <!-- Name + headline -->
          <div class="profile-hero-info">
            <div class="profile-name">{{ profile?.fullName || 'Complete your profile' }}</div>
            <div class="profile-headline">{{ profile?.headline || 'Add your headline' }}</div>
            <div class="profile-meta">
              @if (profile?.currentLocation) {
                <span><mat-icon>location_on</mat-icon>{{ profile!.currentLocation }}</span>
              }
              @if (profile?.phone) {
                <span><mat-icon>phone</mat-icon>{{ profile!.phone }}</span>
              }
            </div>

            <div class="social-row">
              @if (profile?.linkedinUrl) {
                <a [href]="profile!.linkedinUrl" target="_blank" class="social-btn linkedin" matTooltip="LinkedIn">
                  <mat-icon>link</mat-icon> LinkedIn
                </a>
              }
              @if (profile?.githubUrl) {
                <a [href]="profile!.githubUrl" target="_blank" class="social-btn github" matTooltip="GitHub">
                  <mat-icon>code</mat-icon> GitHub
                </a>
              }
              @if (profile?.portfolioUrl) {
                <a [href]="profile!.portfolioUrl" target="_blank" class="social-btn portfolio" matTooltip="Portfolio">
                  <mat-icon>open_in_new</mat-icon> Portfolio
                </a>
              }
            </div>
          </div>

          <!-- Profile completion -->
          <div class="completion-card">
            <div class="completion-label">
              <span>Profile Strength</span>
              <span class="completion-pct">{{ completionPct }}%</span>
            </div>
            <div class="completion-bar-track">
              <div class="completion-bar-fill" [style.width.%]="completionPct"
                   [class.low]="completionPct < 40"
                   [class.mid]="completionPct >= 40 && completionPct < 75"
                   [class.high]="completionPct >= 75"></div>
            </div>
            <div class="completion-hint">{{ completionHint }}</div>

            <div class="open-to-work-row">
              <div class="otw-label">
                <span class="otw-dot" [class.active]="profile?.openToWork"></span>
                Open to Work
              </div>
              <mat-slide-toggle
                [checked]="profile?.openToWork ?? false"
                (change)="toggleOpenToWork($event.checked)"
                color="accent">
              </mat-slide-toggle>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Main Layout ─────────────────────────────────────── -->
      <div class="page-container profile-body">

        @if (loading) {
          <div class="center-spinner">
            <div class="spinner-ring"></div>
          </div>
        }

        @if (!loading && profile) {
          <!-- Tab Bar -->
          <div class="tab-bar">
            @for (tab of tabs; track tab.key) {
              <button class="tab-btn" [class.active]="activeTab === tab.key" (click)="activeTab = tab.key">
                <mat-icon>{{ tab.icon }}</mat-icon>
                <span>{{ tab.label }}</span>
                @if (tab.badge) {
                  <span class="tab-badge">{{ tab.badge }}</span>
                }
              </button>
            }
          </div>

          <!-- ── ABOUT TAB ──────────────────────────────────── -->
          @if (activeTab === 'about') {
            <div class="tab-panel">
              <div class="panel-header">
                <div class="panel-title"><mat-icon>person_outline</mat-icon> Personal Info</div>
                <div class="panel-subtitle">This info is visible to recruiters</div>
              </div>

              <form [formGroup]="basicForm" (ngSubmit)="saveBasic()" class="info-form">
                <div class="field-grid two-col">
                  <div class="field-group">
                    <label>Full Name</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>badge</mat-icon>
                      <input matInput formControlName="fullName" placeholder="John Doe">
                    </mat-form-field>
                  </div>
                  <div class="field-group">
                    <label>Professional Headline</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>title</mat-icon>
                      <input matInput formControlName="headline" placeholder="e.g. Senior Frontend Engineer">
                    </mat-form-field>
                  </div>
                </div>

                <div class="field-group">
                  <label>About / Bio</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <textarea matInput formControlName="bio" rows="4"
                      placeholder="Tell recruiters about yourself, your experience and what you're looking for..."></textarea>
                    <mat-hint align="end">{{ basicForm.get('bio')?.value?.length || 0 }} chars</mat-hint>
                  </mat-form-field>
                </div>

                <div class="field-grid two-col">
                  <div class="field-group">
                    <label>Phone</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>phone</mat-icon>
                      <input matInput formControlName="phone" placeholder="+1 (555) 000-0000">
                    </mat-form-field>
                  </div>
                  <div class="field-group">
                    <label>Current Location</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>location_on</mat-icon>
                      <input matInput formControlName="currentLocation" placeholder="San Francisco, CA">
                    </mat-form-field>
                  </div>
                </div>

                <div class="section-divider">
                  <span>Social Links</span>
                </div>

                <div class="field-grid two-col">
                  <div class="field-group">
                    <label>LinkedIn</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>link</mat-icon>
                      <input matInput formControlName="linkedinUrl" placeholder="https://linkedin.com/in/...">
                    </mat-form-field>
                  </div>
                  <div class="field-group">
                    <label>GitHub</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>code</mat-icon>
                      <input matInput formControlName="githubUrl" placeholder="https://github.com/...">
                    </mat-form-field>
                  </div>
                </div>

                <div class="field-grid two-col">
                  <div class="field-group">
                    <label>Portfolio Website</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>open_in_new</mat-icon>
                      <input matInput formControlName="portfolioUrl" placeholder="https://yoursite.com">
                    </mat-form-field>
                  </div>
                  <div class="field-group">
                    <label>Profile Visibility</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>visibility</mat-icon>
                      <mat-select formControlName="visibility">
                        <mat-option value="public">Public — visible to all</mat-option>
                        <mat-option value="connections_only">Connections Only</mat-option>
                        <mat-option value="private">Private</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-ai" [disabled]="savingBasic">
                    @if (savingBasic) {
                      <span class="btn-spinner"></span> Saving...
                    } @else {
                      <mat-icon>save</mat-icon> Save Changes
                    }
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- ── RESUME TAB ─────────────────────────────────── -->
          @if (activeTab === 'resume') {
            <div class="tab-panel">
              <div class="panel-header">
                <div class="panel-title"><mat-icon>description</mat-icon> Resume & Documents</div>
                <div class="panel-subtitle">Upload your resume to apply faster</div>
              </div>

              <!-- Upload Zone -->
              <div class="upload-zone" [class.has-file]="resumeFile || profile?.resumeUrl"
                   (click)="resumeInput.click()"
                   (dragover)="$event.preventDefault()"
                   (drop)="onResumeDrop($event)">
                <input #resumeInput type="file" accept=".pdf,.doc,.docx" hidden (change)="onResumeChange($event)">

                @if (!resumeFile && !profile?.resumeUrl) {
                  <div class="upload-idle">
                    <div class="upload-icon-wrap">
                      <mat-icon>cloud_upload</mat-icon>
                    </div>
                    <div class="upload-title">Drag & drop your resume here</div>
                    <div class="upload-sub">or click to browse — PDF, DOC, DOCX (max 5MB)</div>
                    <button type="button" class="btn-ai-outline" (click)="resumeInput.click(); $event.stopPropagation()">
                      <mat-icon>attach_file</mat-icon> Choose File
                    </button>
                  </div>
                } @else {
                  <div class="upload-preview">
                    <div class="file-icon">
                      <mat-icon>picture_as_pdf</mat-icon>
                    </div>
                    <div class="file-info">
                      <div class="file-name">{{ resumeFile?.name || 'Current Resume' }}</div>
                      <div class="file-meta">
                        {{ resumeFile ? (resumeFile.size / 1024 | number:'1.0-0') + ' KB' : 'Uploaded' }}
                        &nbsp;·&nbsp; Ready to use
                      </div>
                    </div>
                    <div class="file-actions">
                      <button type="button" class="btn-ai" (click)="saveResume(); $event.stopPropagation()" [disabled]="!resumeFile">
                        <mat-icon>upload</mat-icon> Save Resume
                      </button>
                      <button type="button" class="icon-btn danger" (click)="removeResume(); $event.stopPropagation()" matTooltip="Remove">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Resume tips -->
              <div class="tips-grid">
                <div class="tip-card">
                  <mat-icon>auto_awesome</mat-icon>
                  <div>
                    <div class="tip-title">AI Resume Analysis</div>
                    <div class="tip-body">Our AI scans your resume and matches you to relevant jobs automatically.</div>
                  </div>
                </div>
                <div class="tip-card">
                  <mat-icon>verified</mat-icon>
                  <div>
                    <div class="tip-title">ATS Friendly Format</div>
                    <div class="tip-body">Use PDF format for best compatibility with Applicant Tracking Systems.</div>
                  </div>
                </div>
                <div class="tip-card">
                  <mat-icon>update</mat-icon>
                  <div>
                    <div class="tip-title">Keep it Updated</div>
                    <div class="tip-body">Upload a fresh resume every 3–6 months to stay competitive.</div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ── EXPERIENCE TAB ─────────────────────────────── -->
          @if (activeTab === 'experience') {
            <div class="tab-panel">
              <div class="panel-header">
                <div class="panel-title"><mat-icon>work_outline</mat-icon> Work Experience</div>
                <div class="panel-subtitle">{{ profile!.experiences.length }} position{{ profile!.experiences.length !== 1 ? 's' : '' }} added</div>
              </div>

              <!-- Timeline list -->
              @if (profile!.experiences.length > 0) {
                <div class="timeline">
                  @for (exp of profile!.experiences; track exp.id; let last = $last) {
                    <div class="timeline-item" [class.last]="last">
                      <div class="timeline-dot"></div>
                      <div class="timeline-card">
                        <div class="timeline-card-header">
                          <div>
                            <div class="tl-title">{{ exp.title }}</div>
                            <div class="tl-company">
                              <mat-icon>business</mat-icon>{{ exp.companyName }}
                              @if (exp.employmentType) {
                                <span class="tl-badge">{{ exp.employmentType.replace('_',' ') }}</span>
                              }
                            </div>
                          </div>
                          <div class="tl-right">
                            <div class="tl-date">
                              {{ exp.startDate | date:'MMM yyyy' }} —
                              {{ exp.isCurrent ? 'Present' : (exp.endDate | date:'MMM yyyy') }}
                            </div>
                            @if (exp.location) {
                              <div class="tl-loc"><mat-icon>location_on</mat-icon>{{ exp.location }}</div>
                            }
                            <button class="icon-btn danger" (click)="deleteExperience(exp.id)" matTooltip="Remove">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        </div>
                        @if (exp.description) {
                          <div class="tl-desc">{{ exp.description }}</div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Add form -->
              <div class="add-card" [class.open]="showExpForm">
                <button class="add-toggle" (click)="showExpForm = !showExpForm">
                  <mat-icon>{{ showExpForm ? 'remove' : 'add' }}</mat-icon>
                  {{ showExpForm ? 'Cancel' : 'Add Experience' }}
                </button>

                @if (showExpForm) {
                  <form [formGroup]="expForm" (ngSubmit)="addExperience()" class="info-form">
                    <div class="field-grid two-col">
                      <div class="field-group">
                        <label>Company Name *</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-icon matPrefix>business</mat-icon>
                          <input matInput formControlName="companyName">
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>Job Title *</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-icon matPrefix>work</mat-icon>
                          <input matInput formControlName="title">
                        </mat-form-field>
                      </div>
                    </div>
                    <div class="field-grid two-col">
                      <div class="field-group">
                        <label>Employment Type</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-select formControlName="employmentType">
                            <mat-option value="">Select type</mat-option>
                            @for (t of employmentTypes; track t) {
                              <mat-option [value]="t">{{ t.replace('_',' ') | titlecase }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>Location</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-icon matPrefix>location_on</mat-icon>
                          <input matInput formControlName="location">
                        </mat-form-field>
                      </div>
                    </div>
                    <div class="field-grid three-col">
                      <div class="field-group">
                        <label>Start Date</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <input matInput type="date" formControlName="startDate">
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>End Date</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <input matInput type="date" formControlName="endDate">
                        </mat-form-field>
                      </div>
                      <div class="field-group currently-working">
                        <label class="toggle-label">
                          <input type="checkbox" formControlName="isCurrent">
                          <span>Currently working here</span>
                        </label>
                      </div>
                    </div>
                    <div class="field-group">
                      <label>Description</label>
                      <mat-form-field appearance="outline" class="full-width">
                        <textarea matInput formControlName="description" rows="3"
                          placeholder="Describe your responsibilities and achievements..."></textarea>
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn-ai" [disabled]="expForm.invalid">
                        <mat-icon>add_circle</mat-icon> Add Experience
                      </button>
                    </div>
                  </form>
                }
              </div>
            </div>
          }

          <!-- ── EDUCATION TAB ──────────────────────────────── -->
          @if (activeTab === 'education') {
            <div class="tab-panel">
              <div class="panel-header">
                <div class="panel-title"><mat-icon>school</mat-icon> Education</div>
                <div class="panel-subtitle">{{ profile!.educations.length }} record{{ profile!.educations.length !== 1 ? 's' : '' }} added</div>
              </div>

              @if (profile!.educations.length > 0) {
                <div class="edu-list">
                  @for (edu of profile!.educations; track edu.id) {
                    <div class="edu-card">
                      <div class="edu-icon"><mat-icon>school</mat-icon></div>
                      <div class="edu-body">
                        <div class="edu-institution">{{ edu.institution }}</div>
                        <div class="edu-degree">
                          {{ edu.degree }}{{ edu.fieldOfStudy ? ' · ' + edu.fieldOfStudy : '' }}
                        </div>
                        <div class="edu-years">
                          {{ edu.startYear }} — {{ edu.isCurrent ? 'Present' : (edu.endYear || '—') }}
                        </div>
                        @if (edu.description) {
                          <div class="edu-desc">{{ edu.description }}</div>
                        }
                      </div>
                      <button class="icon-btn danger" (click)="deleteEducation(edu.id)" matTooltip="Remove">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }

              <div class="add-card" [class.open]="showEduForm">
                <button class="add-toggle" (click)="showEduForm = !showEduForm">
                  <mat-icon>{{ showEduForm ? 'remove' : 'add' }}</mat-icon>
                  {{ showEduForm ? 'Cancel' : 'Add Education' }}
                </button>

                @if (showEduForm) {
                  <form [formGroup]="eduForm" (ngSubmit)="addEducation()" class="info-form">
                    <div class="field-grid two-col">
                      <div class="field-group">
                        <label>Institution *</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-icon matPrefix>account_balance</mat-icon>
                          <input matInput formControlName="institution" placeholder="University / School name">
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>Degree</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-icon matPrefix>workspace_premium</mat-icon>
                          <input matInput formControlName="degree" placeholder="e.g. Bachelor of Science">
                        </mat-form-field>
                      </div>
                    </div>
                    <div class="field-grid three-col">
                      <div class="field-group">
                        <label>Field of Study</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <input matInput formControlName="fieldOfStudy" placeholder="Computer Science">
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>Start Year</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <input matInput type="number" formControlName="startYear" placeholder="2018">
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>End Year</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <input matInput type="number" formControlName="endYear" placeholder="2022">
                        </mat-form-field>
                      </div>
                    </div>
                    <div class="field-group">
                      <label>Description (optional)</label>
                      <mat-form-field appearance="outline" class="full-width">
                        <textarea matInput formControlName="description" rows="2"
                          placeholder="Activities, achievements, GPA..."></textarea>
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn-ai" [disabled]="eduForm.invalid">
                        <mat-icon>add_circle</mat-icon> Add Education
                      </button>
                    </div>
                  </form>
                }
              </div>
            </div>
          }

          <!-- ── SKILLS TAB ─────────────────────────────────── -->
          @if (activeTab === 'skills') {
            <div class="tab-panel">
              <div class="panel-header">
                <div class="panel-title"><mat-icon>psychology</mat-icon> Skills</div>
                <div class="panel-subtitle">{{ profile!.skills.length }} skill{{ profile!.skills.length !== 1 ? 's' : '' }} listed</div>
              </div>

              <div class="skills-grid">
                @for (skill of profile!.skills; track skill.id) {
                  <div class="skill-pill">
                    <span class="skill-name">{{ skill.name }}</span>
                    @if (skill.level) {
                      <span class="skill-level level-{{ skill.level.toLowerCase() }}">{{ skill.level }}</span>
                    }
                    <button class="skill-remove" (click)="deleteSkill(skill.id)" matTooltip="Remove">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }

                @if (profile!.skills.length === 0) {
                  <div class="empty-skills">
                    <mat-icon>psychology_alt</mat-icon>
                    <p>No skills added yet. Add your top skills below.</p>
                  </div>
                }
              </div>

              <div class="add-card" [class.open]="showSkillForm">
                <button class="add-toggle" (click)="showSkillForm = !showSkillForm">
                  <mat-icon>{{ showSkillForm ? 'remove' : 'add' }}</mat-icon>
                  {{ showSkillForm ? 'Cancel' : 'Add Skill' }}
                </button>

                @if (showSkillForm) {
                  <form [formGroup]="skillForm" (ngSubmit)="addSkill()" class="info-form">
                    <div class="field-grid two-col">
                      <div class="field-group">
                        <label>Skill Name *</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-icon matPrefix>psychology</mat-icon>
                          <input matInput formControlName="name" placeholder="e.g. React, Python, Figma">
                        </mat-form-field>
                      </div>
                      <div class="field-group">
                        <label>Proficiency Level</label>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-select formControlName="level">
                            <mat-option value="">None</mat-option>
                            <mat-option value="Beginner">Beginner</mat-option>
                            <mat-option value="Intermediate">Intermediate</mat-option>
                            <mat-option value="Advanced">Advanced</mat-option>
                            <mat-option value="Expert">Expert</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn-ai" [disabled]="skillForm.invalid">
                        <mat-icon>add_circle</mat-icon> Add Skill
                      </button>
                    </div>
                  </form>
                }
              </div>
            </div>
          }

          <!-- ── PREFERENCES TAB ────────────────────────────── -->
          @if (activeTab === 'preferences') {
            <div class="tab-panel">
              <div class="panel-header">
                <div class="panel-title"><mat-icon>tune</mat-icon> Job Preferences</div>
                <div class="panel-subtitle">Help us match you with the right opportunities</div>
              </div>

              <form [formGroup]="prefForm" (ngSubmit)="savePreferences()" class="info-form">
                <div class="field-group">
                  <label>Desired Roles (comma separated)</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>work_outline</mat-icon>
                    <input matInput formControlName="desiredRoles" placeholder="Frontend Developer, Full Stack Engineer, React Developer">
                    <mat-hint>Separate roles with commas</mat-hint>
                  </mat-form-field>
                </div>

                <div class="field-group">
                  <label>Preferred Locations (comma separated)</label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-icon matPrefix>location_on</mat-icon>
                    <input matInput formControlName="preferredLocations" placeholder="San Francisco, Remote, New York">
                  </mat-form-field>
                </div>

                <div class="field-grid two-col">
                  <div class="field-group">
                    <label>Minimum Salary</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>payments</mat-icon>
                      <input matInput type="number" formControlName="minSalary" placeholder="80000">
                    </mat-form-field>
                  </div>
                  <div class="field-group">
                    <label>Maximum Salary</label>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-icon matPrefix>payments</mat-icon>
                      <input matInput type="number" formControlName="maxSalary" placeholder="150000">
                    </mat-form-field>
                  </div>
                </div>

                <div class="field-group">
                  <label>Currency</label>
                  <mat-form-field appearance="outline" style="max-width: 160px">
                    <mat-select formControlName="currency">
                      <mat-option value="USD">USD $</mat-option>
                      <mat-option value="EUR">EUR €</mat-option>
                      <mat-option value="GBP">GBP £</mat-option>
                      <mat-option value="INR">INR ₹</mat-option>
                      <mat-option value="CAD">CAD $</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="pref-toggle-row">
                  <div class="pref-toggle-info">
                    <div class="pref-toggle-title">Remote Only</div>
                    <div class="pref-toggle-sub">Only show fully remote positions</div>
                  </div>
                  <mat-slide-toggle formControlName="remoteOnly" color="accent"></mat-slide-toggle>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-ai" [disabled]="savingPrefs">
                    @if (savingPrefs) {
                      <span class="btn-spinner"></span> Saving...
                    } @else {
                      <mat-icon>save</mat-icon> Save Preferences
                    }
                  </button>
                </div>
              </form>
            </div>
          }

        }
      </div>
    </div>
  `,
  styles: [`
    /* ── Root ───────────────────────────────────────────────── */
    .profile-root {
      background: #f0f2ff;
      min-height: 100vh;
    }

    /* ── Cover ──────────────────────────────────────────────── */
    .profile-cover {
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 50%, #0a1a2a 100%);
      position: relative;
      overflow: hidden;
      padding: 40px 0 60px;
    }

    .cover-glow {
      position: absolute;
      width: 700px; height: 400px;
      background: radial-gradient(ellipse, rgba(108,63,197,0.25) 0%, transparent 70%);
      top: -100px; left: 50%; transform: translateX(-50%);
      pointer-events: none;
    }

    .cover-grid {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(108,63,197,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(108,63,197,0.06) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .profile-header-inner {
      position: relative; z-index: 1;
      display: flex;
      align-items: flex-end;
      gap: 32px;
      flex-wrap: wrap;
    }

    /* ── Avatar ─────────────────────────────────────────────── */
    .avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-ring {
      width: 120px; height: 120px;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, #6c3fc5, #00e5ff);
      box-shadow: 0 0 30px rgba(108,63,197,0.5);
    }

    .avatar-img, .avatar-placeholder {
      width: 100%; height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a0a3a, #0a1a3a);
      font-size: 36px;
      font-weight: 700;
      color: #00e5ff;
      font-family: 'Space Grotesk', sans-serif;
    }

    .avatar-upload-btn {
      position: absolute;
      bottom: 4px; right: 4px;
      width: 32px; height: 32px;
      border-radius: 50%;
      border: none;
      background: #6c3fc5;
      color: white;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: #00bcd4; }
    }

    /* ── Hero Info ──────────────────────────────────────────── */
    .profile-hero-info { flex: 1; min-width: 220px; }

    .profile-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: white;
    }

    .profile-headline {
      color: #00e5ff;
      font-size: 15px;
      margin: 4px 0 12px;
    }

    .profile-meta {
      display: flex; gap: 20px; flex-wrap: wrap;
      color: rgba(255,255,255,0.55);
      font-size: 13px;
      margin-bottom: 14px;
      span { display: flex; align-items: center; gap: 4px; }
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    .social-row { display: flex; gap: 8px; flex-wrap: wrap; }

    .social-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &.linkedin { background: rgba(10,102,194,0.2); border: 1px solid rgba(10,102,194,0.5); color: #4fc3f7; }
      &.github { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
      &.portfolio { background: rgba(108,63,197,0.2); border: 1px solid rgba(108,63,197,0.5); color: #ce93d8; }
      &:hover { transform: translateY(-1px); filter: brightness(1.2); }
    }

    /* ── Completion Card ────────────────────────────────────── */
    .completion-card {
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 20px 24px;
      min-width: 220px;
      max-width: 280px;
    }

    .completion-label {
      display: flex; justify-content: space-between;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 10px;
    }

    .completion-pct {
      font-weight: 700;
      color: #00e5ff;
      font-size: 15px;
    }

    .completion-bar-track {
      height: 6px;
      background: rgba(255,255,255,0.12);
      border-radius: 3px;
      overflow: hidden;
    }

    .completion-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s cubic-bezier(.4,0,.2,1);
      &.low { background: linear-gradient(90deg, #f44336, #ff7043); }
      &.mid { background: linear-gradient(90deg, #ff9800, #ffd54f); }
      &.high { background: linear-gradient(90deg, #00e5ff, #00c853); }
    }

    .completion-hint {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      margin: 8px 0 16px;
    }

    .open-to-work-row {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .otw-label {
      display: flex; align-items: center; gap: 8px;
      color: rgba(255,255,255,0.8);
      font-size: 13px; font-weight: 500;
    }

    .otw-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      &.active { background: #00e5ff; box-shadow: 0 0 8px #00e5ff; }
    }

    /* ── Profile Body ───────────────────────────────────────── */
    .profile-body { padding-top: 0; }

    .center-spinner {
      display: flex; justify-content: center; padding: 80px;
    }
    .spinner-ring {
      width: 48px; height: 48px;
      border: 3px solid rgba(108,63,197,0.2);
      border-top-color: #6c3fc5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Tab Bar ────────────────────────────────────────────── */
    .tab-bar {
      display: flex;
      gap: 4px;
      background: white;
      border-radius: 16px 16px 0 0;
      padding: 8px 8px 0;
      margin-top: -20px;
      box-shadow: 0 -4px 20px rgba(108,63,197,0.08);
      overflow-x: auto;
      border: 1px solid rgba(108,63,197,0.1);
      border-bottom: none;
    }

    .tab-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 18px;
      border: none;
      border-radius: 10px 10px 0 0;
      background: transparent;
      color: #888;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      position: relative;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(108,63,197,0.06); color: #6c3fc5; }
      &.active {
        background: linear-gradient(135deg, rgba(108,63,197,0.12), rgba(0,229,255,0.06));
        color: #6c3fc5;
        font-weight: 600;
        &::after {
          content: '';
          position: absolute;
          bottom: 0; left: 12px; right: 12px;
          height: 2px;
          background: linear-gradient(90deg, #6c3fc5, #00e5ff);
          border-radius: 2px 2px 0 0;
        }
      }
    }

    .tab-badge {
      background: #6c3fc5;
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* ── Tab Panel ──────────────────────────────────────────── */
    .tab-panel {
      background: white;
      border-radius: 0 0 16px 16px;
      padding: 32px;
      border: 1px solid rgba(108,63,197,0.1);
      border-top: none;
      box-shadow: 0 8px 32px rgba(108,63,197,0.06);
    }

    .panel-header {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(108,63,197,0.08);
    }

    .panel-title {
      display: flex; align-items: center; gap: 10px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      mat-icon { color: #6c3fc5; font-size: 24px; width: 24px; height: 24px; }
    }

    .panel-subtitle {
      color: #888;
      font-size: 13px;
      margin-top: 4px;
      margin-left: 34px;
    }

    /* ── Form Styles ────────────────────────────────────────── */
    .info-form { padding-top: 4px; }

    .field-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 4px;
      &.two-col { grid-template-columns: repeat(2, 1fr); }
      &.three-col { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 640px) {
        &.two-col, &.three-col { grid-template-columns: 1fr; }
      }
    }

    .field-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
      label {
        font-size: 12px;
        font-weight: 600;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
    }

    .section-divider {
      display: flex; align-items: center; gap: 12px;
      margin: 20px 0 16px;
      span {
        font-size: 12px;
        font-weight: 700;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 1px;
        white-space: nowrap;
      }
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(108,63,197,0.2), transparent);
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(108,63,197,0.08);
    }

    /* ── AI Buttons ─────────────────────────────────────────── */
    .btn-ai {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(108,63,197,0.35);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(108,63,197,0.5);
      }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .btn-ai-outline {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px;
      border: 1.5px solid #6c3fc5;
      border-radius: 50px;
      background: transparent;
      color: #6c3fc5;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(108,63,197,0.06); }
    }

    .icon-btn {
      width: 36px; height: 36px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &.danger { color: #ef5350; &:hover { background: rgba(239,83,80,0.1); } }
    }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    /* ── Resume Upload ───────────────────────────────────────── */
    .upload-zone {
      border: 2px dashed rgba(108,63,197,0.3);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(108,63,197,0.03), rgba(0,229,255,0.02));
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 32px;
      overflow: hidden;
      &:hover, &.has-file { border-color: #6c3fc5; background: rgba(108,63,197,0.04); }
    }

    .upload-idle {
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .upload-icon-wrap {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(108,63,197,0.15), rgba(0,229,255,0.1));
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #6c3fc5; }
    }

    .upload-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }
    .upload-sub { font-size: 13px; color: #888; text-align: center; }

    .upload-preview {
      padding: 24px 28px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .file-icon {
      width: 52px; height: 52px;
      background: linear-gradient(135deg, #6c3fc5, #00bcd4);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    }

    .file-info { flex: 1; }
    .file-name { font-weight: 600; color: #1a1a2e; font-size: 15px; }
    .file-meta { font-size: 12px; color: #888; margin-top: 4px; }
    .file-actions { display: flex; gap: 8px; align-items: center; }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    .tip-card {
      display: flex; gap: 14px;
      padding: 18px;
      background: linear-gradient(135deg, rgba(108,63,197,0.05), rgba(0,229,255,0.03));
      border: 1px solid rgba(108,63,197,0.12);
      border-radius: 12px;
      mat-icon { color: #6c3fc5; font-size: 22px; width: 22px; height: 22px; flex-shrink: 0; margin-top: 2px; }
    }
    .tip-title { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
    .tip-body { font-size: 12px; color: #888; line-height: 1.5; }

    /* ── Timeline ───────────────────────────────────────────── */
    .timeline { padding: 0 0 24px 20px; position: relative; }
    .timeline::before {
      content: '';
      position: absolute;
      left: 0; top: 8px; bottom: 8px;
      width: 2px;
      background: linear-gradient(180deg, #6c3fc5, rgba(108,63,197,0.1));
    }

    .timeline-item {
      position: relative;
      margin-bottom: 24px;
      &.last { margin-bottom: 0; }
    }

    .timeline-dot {
      position: absolute;
      left: -25px; top: 14px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: white;
      border: 2px solid #6c3fc5;
      box-shadow: 0 0 0 3px rgba(108,63,197,0.15);
    }

    .timeline-card {
      background: white;
      border: 1px solid rgba(108,63,197,0.12);
      border-radius: 12px;
      padding: 18px 20px;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 20px rgba(108,63,197,0.1); }
    }

    .timeline-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tl-title { font-weight: 700; font-size: 15px; color: #1a1a2e; margin-bottom: 4px; }
    .tl-company {
      display: flex; align-items: center; gap: 6px;
      color: #6c3fc5; font-size: 13px; font-weight: 500;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .tl-badge {
      background: rgba(108,63,197,0.1);
      color: #6c3fc5;
      padding: 1px 8px;
      border-radius: 10px;
      font-size: 11px;
      text-transform: capitalize;
    }
    .tl-right { text-align: right; flex-shrink: 0; }
    .tl-date { font-size: 12px; color: #888; font-weight: 500; margin-bottom: 4px; }
    .tl-loc { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #aaa; justify-content: flex-end;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }
    .tl-desc { font-size: 13px; color: #555; margin-top: 10px; line-height: 1.6; }

    /* ── Education ──────────────────────────────────────────── */
    .edu-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }

    .edu-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 18px 20px;
      background: white;
      border: 1px solid rgba(108,63,197,0.12);
      border-radius: 12px;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 20px rgba(108,63,197,0.08); }
    }

    .edu-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(108,63,197,0.15), rgba(0,188,212,0.1));
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #6c3fc5; font-size: 22px; width: 22px; height: 22px; }
    }

    .edu-body { flex: 1; }
    .edu-institution { font-weight: 700; font-size: 15px; color: #1a1a2e; }
    .edu-degree { color: #6c3fc5; font-size: 13px; font-weight: 500; margin-top: 2px; }
    .edu-years { font-size: 12px; color: #888; margin-top: 4px; }
    .edu-desc { font-size: 13px; color: #555; margin-top: 8px; line-height: 1.5; }

    /* ── Skills ─────────────────────────────────────────────── */
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 28px;
      min-height: 48px;
    }

    .skill-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px 6px 14px;
      background: linear-gradient(135deg, rgba(108,63,197,0.08), rgba(0,229,255,0.05));
      border: 1px solid rgba(108,63,197,0.2);
      border-radius: 50px;
      font-size: 13px;
      transition: all 0.2s;
      &:hover { border-color: #6c3fc5; background: rgba(108,63,197,0.12); }
    }

    .skill-name { font-weight: 500; color: #1a1a2e; }
    .skill-level {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      &.level-beginner { background: rgba(255,152,0,0.15); color: #e65100; }
      &.level-intermediate { background: rgba(3,169,244,0.15); color: #0277bd; }
      &.level-advanced { background: rgba(76,175,80,0.15); color: #2e7d32; }
      &.level-expert { background: rgba(108,63,197,0.15); color: #6c3fc5; }
    }

    .skill-remove {
      width: 20px; height: 20px;
      border-radius: 50%;
      border: none;
      background: rgba(239,83,80,0.1);
      color: #ef5350;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { background: rgba(239,83,80,0.2); }
    }

    .empty-skills {
      display: flex; align-items: center; gap: 12px;
      color: #aaa; font-size: 14px; padding: 12px 0;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: rgba(108,63,197,0.3); }
    }

    /* ── Add Card ───────────────────────────────────────────── */
    .add-card {
      border: 1.5px dashed rgba(108,63,197,0.25);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s;
      &.open { border-color: #6c3fc5; border-style: solid; }
    }

    .add-toggle {
      display: flex; align-items: center; gap: 8px;
      width: 100%;
      padding: 14px 20px;
      border: none;
      background: transparent;
      color: #6c3fc5;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { background: rgba(108,63,197,0.04); }
    }

    .info-form { padding: 4px 20px 20px; }

    /* ── Preferences ────────────────────────────────────────── */
    .pref-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(108,63,197,0.04), rgba(0,229,255,0.02));
      border: 1px solid rgba(108,63,197,0.1);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .pref-toggle-title { font-weight: 600; color: #1a1a2e; font-size: 14px; }
    .pref-toggle-sub { font-size: 12px; color: #888; margin-top: 2px; }

    /* ── Currently working checkbox ─────────────────────────── */
    .currently-working {
      justify-content: flex-end;
      padding-bottom: 12px;
    }
    .toggle-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px;
      color: #555;
      cursor: pointer;
      input[type=checkbox] { accent-color: #6c3fc5; width: 16px; height: 16px; }
    }
  `]
})
export class SeekerProfileComponent implements OnInit {
  private profileSvc = inject(ProfileService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  profile: ProfileResponse | null = null;
  loading = false;
  savingBasic = false;
  savingPrefs = false;
  avatarPreview: string | null = null;
  resumeFile: File | null = null;
  showExpForm = false;
  showEduForm = false;
  showSkillForm = false;
  activeTab = 'about';
  employmentTypes = Object.values(EmploymentType);

  get initials(): string {
    const name = this.profile?.fullName || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  get completionPct(): number {
    if (!this.profile) return 0;
    const checks = [
      !!this.profile.fullName,
      !!this.profile.headline,
      !!this.profile.bio || !!(this.profile as any).summary,
      !!this.profile.phone,
      !!this.profile.currentLocation,
      !!this.profile.linkedinUrl || !!this.profile.githubUrl,
      this.profile.educations.length > 0,
      this.profile.experiences.length > 0,
      this.profile.skills.length >= 3,
      !!this.profile.resumeUrl || !!this.resumeFile,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  get completionHint(): string {
    const pct = this.completionPct;
    if (pct < 40) return 'Add more details to get noticed by recruiters';
    if (pct < 75) return 'Great start! Add skills and experience to stand out';
    if (pct < 100) return 'Almost there! Upload your resume to complete';
    return 'Your profile is complete!';
  }

  get tabs() {
    return [
      { key: 'about',       label: 'About',       icon: 'person_outline' },
      { key: 'resume',      label: 'Resume',       icon: 'description' },
      { key: 'experience',  label: 'Experience',   icon: 'work_outline',   badge: this.profile?.experiences.length || null },
      { key: 'education',   label: 'Education',    icon: 'school',         badge: this.profile?.educations.length || null },
      { key: 'skills',      label: 'Skills',       icon: 'psychology',     badge: this.profile?.skills.length || null },
      { key: 'preferences', label: 'Preferences',  icon: 'tune' },
    ];
  }

  basicForm = this.fb.group({
    fullName: [''],
    headline: [''],
    bio: [''],
    phone: [''],
    currentLocation: [''],
    linkedinUrl: [''],
    githubUrl: [''],
    portfolioUrl: [''],
    visibility: ['public'],
    openToWork: [true],
  });

  eduForm = this.fb.group({
    institution: ['', Validators.required],
    degree: [''],
    fieldOfStudy: [''],
    startYear: [null as number | null],
    endYear: [null as number | null],
    description: [''],
  });

  expForm = this.fb.group({
    companyName: ['', Validators.required],
    title: ['', Validators.required],
    employmentType: [null as EmploymentType | null],
    location: [''],
    startDate: [''],
    endDate: [''],
    isCurrent: [false],
    description: [''],
  });

  skillForm = this.fb.group({
    name: ['', Validators.required],
    level: [''],
  });

  prefForm = this.fb.group({
    desiredRoles: [''],
    preferredLocations: [''],
    minSalary: [null as number | null],
    maxSalary: [null as number | null],
    currency: ['USD'],
    remoteOnly: [false],
  });

  ngOnInit(): void {
    this.loading = true;
    this.profileSvc.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.basicForm.patchValue({ ...p as any, bio: (p as any).summary ?? p.bio });
        if (p.preferences) {
          this.prefForm.patchValue({
            desiredRoles: p.preferences.desiredRoles?.join(', ') ?? '',
            preferredLocations: p.preferences.preferredLocations?.join(', ') ?? '',
            minSalary: p.preferences.minSalary,
            maxSalary: p.preferences.maxSalary,
            currency: p.preferences.currency ?? 'USD',
            remoteOnly: p.preferences.remoteOnly,
          });
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    const saved = localStorage.getItem('sb_avatar');
    if (saved) this.avatarPreview = saved;

    this.expForm.get('isCurrent')!.valueChanges.subscribe(isCurrent => {
      if (isCurrent) {
        this.expForm.get('endDate')!.disable();
        this.expForm.get('endDate')!.setValue('');
      } else {
        this.expForm.get('endDate')!.enable();
      }
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target!.result as string;
      localStorage.setItem('sb_avatar', this.avatarPreview);
      this.snack.open('Photo updated', 'Close', { duration: 2000 });
    };
    reader.readAsDataURL(file);
  }

  onResumeChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.resumeFile = file;
  }

  onResumeDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.resumeFile = file;
  }

  saveResume(): void {
    if (!this.resumeFile) return;
    // In production: upload to server and get URL back
    const fakeUrl = `uploads/resumes/${this.resumeFile.name}`;
    this.profileSvc.updateProfile({ resumeUrl: fakeUrl } as any).subscribe({
      next: (p) => {
        this.profile = p;
        this.snack.open('Resume saved', 'Close', { duration: 2000 });
      }
    });
  }

  removeResume(): void {
    this.resumeFile = null;
    this.profileSvc.updateProfile({ resumeUrl: '' } as any).subscribe({
      next: (p) => { this.profile = p; }
    });
  }

  toggleOpenToWork(value: boolean): void {
    this.profileSvc.updateProfile({ openToWork: value } as any).subscribe({
      next: (p) => {
        this.profile = p;
        this.snack.open(value ? 'Open to Work enabled' : 'Open to Work disabled', 'Close', { duration: 2000 });
      }
    });
  }

  saveBasic(): void {
    this.savingBasic = true;
    this.profileSvc.updateProfile(this.basicForm.value as any).subscribe({
      next: (p) => {
        this.profile = p;
        this.savingBasic = false;
        this.snack.open('Profile saved!', 'Close', { duration: 2000 });
      },
      error: () => { this.savingBasic = false; }
    });
  }

  savePreferences(): void {
    this.savingPrefs = true;
    const v = this.prefForm.value;
    const data: PreferencesUpsert = {
      desiredRoles: v.desiredRoles ? v.desiredRoles.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      preferredLocations: v.preferredLocations ? v.preferredLocations.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      minSalary: v.minSalary ?? undefined,
      maxSalary: v.maxSalary ?? undefined,
      currency: v.currency ?? 'USD',
      remoteOnly: v.remoteOnly ?? false,
    };
    this.profileSvc.upsertPreferences(data).subscribe({
      next: () => {
        this.savingPrefs = false;
        this.snack.open('Preferences saved!', 'Close', { duration: 2000 });
      },
      error: () => { this.savingPrefs = false; }
    });
  }

  addEducation(): void {
    if (this.eduForm.invalid || !this.profile) return;
    this.profileSvc.addEducation(this.eduForm.value as EducationCreate).subscribe({
      next: (edu) => {
        this.profile!.educations.push(edu);
        this.eduForm.reset();
        this.showEduForm = false;
        this.snack.open('Education added', 'Close', { duration: 2000 });
      }
    });
  }

  deleteEducation(id: string): void {
    this.profileSvc.deleteEducation(id).subscribe({
      next: () => { this.profile!.educations = this.profile!.educations.filter(e => e.id !== id); }
    });
  }

  addExperience(): void {
    if (this.expForm.invalid || !this.profile) return;
    this.profileSvc.addExperience(this.expForm.value as ExperienceCreate).subscribe({
      next: (exp) => {
        this.profile!.experiences.push(exp);
        this.expForm.reset();
        this.showExpForm = false;
        this.snack.open('Experience added', 'Close', { duration: 2000 });
      }
    });
  }

  deleteExperience(id: string): void {
    this.profileSvc.deleteExperience(id).subscribe({
      next: () => { this.profile!.experiences = this.profile!.experiences.filter(e => e.id !== id); }
    });
  }

  addSkill(): void {
    if (this.skillForm.invalid || !this.profile) return;
    this.profileSvc.addSkill(this.skillForm.value as SkillCreate).subscribe({
      next: (skill) => {
        this.profile!.skills.push(skill);
        this.skillForm.reset();
        this.snack.open('Skill added', 'Close', { duration: 2000 });
      }
    });
  }

  deleteSkill(id: string): void {
    this.profileSvc.deleteSkill(id).subscribe({
      next: () => { this.profile!.skills = this.profile!.skills.filter(s => s.id !== id); }
    });
  }
}
