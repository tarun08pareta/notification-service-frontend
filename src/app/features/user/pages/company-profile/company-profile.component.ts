import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CompanyProfileService } from '../../../../core/common/company-profile/company-profile.service';
import { CompanyProfile, UpdateCompanyProfileRequest } from '../../../../core/common/company-profile/company-profile.model';
import { ToastService } from '../../../../core/common/toast/toast.service';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit, OnDestroy {

  private readonly profileService = inject(CompanyProfileService);
  private readonly toastr = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  profileForm!: FormGroup;

  // ── Loading / action states ────────────────────────────────────────────
  isLoadingProfile = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isUploadingLogo = signal<boolean>(false);
  isDeletingLogo = signal<boolean>(false);
  loadError = signal<boolean>(false);

  // ── Logo state ─────────────────────────────────────────────────────────
  backendLogoUrl = signal<string | null>(null);
  localPreviewUrl = signal<string | null>(null);

  get displayLogoUrl(): string | null {
    return this.localPreviewUrl() ?? this.backendLogoUrl();
  }

  get companyInitial(): string {
    const name = this.profileForm?.get('companyName')?.value;
    return name?.charAt(0)?.toUpperCase() || 'C';
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokeLocalPreview();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      companyName: ['', [Validators.required]],
      senderName: ['', [Validators.required]],
      senderEmail: ['', [Validators.required, Validators.email]],
      replyToEmail: ['', [Validators.email]],
      smsSenderId: ['', [Validators.required, Validators.maxLength(11)]],
      // Basic international phone format: + followed by 10-15 digits
      smsSenderNumber: ['', [Validators.pattern(/^\+[1-9]\d{9,14}$/)]] 
    });
  }

  // ── Profile loading ────────────────────────────────────────────────────

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.loadError.set(false);

    this.profileService.getProfile()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingProfile.set(false))
      )
      .subscribe({
        next: (profile) => this.applyProfile(profile),
        error: () => {
          this.loadError.set(true);
          this.toastr.error('Failed to load company profile.');
        }
      });
  }

  private applyProfile(profile: CompanyProfile): void {
    this.profileForm.patchValue({
      companyName: profile.companyName ?? '',
      senderName: profile.senderName ?? '',
      senderEmail: profile.senderEmail ?? '',
      replyToEmail: profile.replyToEmail ?? '',
      smsSenderId: profile.smsSenderId ?? '',
      smsSenderNumber: profile.smsSenderNumber ?? ''
    });
    this.backendLogoUrl.set(profile.logoUrl);
    this.revokeLocalPreview();
  }

  // ── Save profile ──────────────────────────────────────────────────────

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (this.isSaving()) return;

    const formValue = this.profileForm.value;
    const request: UpdateCompanyProfileRequest = {
      companyName: formValue.companyName,
      senderName: formValue.senderName,
      senderEmail: formValue.senderEmail,
      replyToEmail: formValue.replyToEmail,
      smsSenderId: formValue.smsSenderId,
      // API expects string, avoid formatting it into numbers
      smsSenderNumber: formValue.smsSenderNumber?.trim() || ''
    };

    this.isSaving.set(true);

    this.profileService.updateProfile(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (profile) => {
          this.applyProfile(profile);
          this.toastr.success('Company profile updated successfully.');
        },
        error: () => {
          this.toastr.error('Failed to update company profile.');
        }
      });
  }

  cancel(): void {
    this.loadProfile();
  }

  // ── Logo validation & upload ─────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate type
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      this.toastr.error('Please upload a PNG, JPG, or WEBP image.');
      input.value = '';
      return;
    }

    // Validate size
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      this.toastr.error('Logo image must be 2 MB or smaller.');
      input.value = '';
      return;
    }

    // Preview
    this.revokeLocalPreview();
    this.localPreviewUrl.set(URL.createObjectURL(file));

    // Upload
    this.uploadLogo(file);
    input.value = '';
  }

  private uploadLogo(file: File): void {
    if (this.isUploadingLogo()) return;
    this.isUploadingLogo.set(true);

    this.profileService.uploadLogo(file)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isUploadingLogo.set(false))
      )
      .subscribe({
        next: (profile) => {
          this.backendLogoUrl.set(profile.logoUrl);
          this.revokeLocalPreview();
          this.toastr.success('Company logo uploaded successfully.');
        },
        error: () => {
          this.toastr.error('Failed to upload company logo.');
          // Do not revoke the preview so the user knows what they tried to upload,
          // but the current valid persisted logo is not technically deleted
        }
      });
  }

  removeLogo(): void {
    if (this.isDeletingLogo()) return;
    this.isDeletingLogo.set(true);

    this.profileService.deleteLogo()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDeletingLogo.set(false))
      )
      .subscribe({
        next: (profile) => {
          this.backendLogoUrl.set(profile.logoUrl);
          this.revokeLocalPreview();
          this.toastr.success('Company logo removed successfully.');
        },
        error: () => {
          this.toastr.error('Failed to remove company logo.');
        }
      });
  }

  private revokeLocalPreview(): void {
    const url = this.localPreviewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.localPreviewUrl.set(null);
    }
  }
}