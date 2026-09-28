import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/common/auth/auth.service';
import { ToastService } from '../../../core/common/toast/toast.service';

export class PasswordMatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && (control.invalid || form?.hasError('passwordMismatch')) && (control.dirty || control.touched || isSubmitted));
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  matcher = new PasswordMatchErrorStateMatcher();

  changePasswordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;
  isSubmitting = false;

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    this.authService.changePassword({ currentPassword, newPassword, confirmPassword }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Password changed successfully.');
        this.changePasswordForm.reset();
        
        // Reset form state properly so validation doesn't show up immediately
        Object.keys(this.changePasswordForm.controls).forEach(key => {
          this.changePasswordForm.get(key)?.setErrors(null);
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        // The HTTP interceptor might already show a toast, or backend sends specific error
        const errorMessage = error.error?.message || 'Failed to change password. Please verify your current password.';
        this.toastService.error(errorMessage);
      }
    });
  }
}
