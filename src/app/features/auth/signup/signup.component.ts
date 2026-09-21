import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/common/auth/auth.service';
import { GoogleLoginComponent } from '../../../shared/components/google-login/google-login.component';
import { ToastService } from '../../../core/common/toast/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    GoogleLoginComponent

  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastService);

  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.signupForm.value;
    // Map to expected backend request (removing confirmPassword)
    const request = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password
    };

    this.authService.signup(request).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigate to login on success (ideally showing a success message/toast)
        this.toastr.success('Account created successfully! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create account. Please try again.';
        if (err.status === 0 || err.status === 404) {
             this.errorMessage = 'Backend API is currently unreachable.';
        }
        this.toastr.error('Registration failed. Please try again.');
      }
    });
  }
}
