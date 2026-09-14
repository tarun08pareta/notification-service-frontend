import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/common/auth/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.user?.roles?.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (response.user?.roles?.includes('USER')) {
          this.router.navigate(['/user/dashboard']);
        } else {
          this.authService.logout();
          this.errorMessage =
            'Unauthorized: Your account does not have a valid role.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Invalid email or password. Please try again.';
        // For development fallback if backend is not running
        if (err.status === 0 || err.status === 404) {
          this.errorMessage = 'Backend API is currently unreachable.';
        }
      },
    });
  }
}
