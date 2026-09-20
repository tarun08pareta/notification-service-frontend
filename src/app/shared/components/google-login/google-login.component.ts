import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../../../core/common/auth/google-auth.service';

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.scss'
})
export class GoogleLoginComponent implements OnInit, OnDestroy {
  private googleAuthService = inject(GoogleAuthService);
  private subs = new Subscription();

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.subs.add(
      this.googleAuthService.loading$.subscribe(loading => {
        this.isLoading = loading;
        if (loading) {
          // Clear previous error when a new attempt starts.
          this.errorMessage = '';
        }
      })
    );

    this.subs.add(
      this.googleAuthService.error$.subscribe(msg => {
        this.errorMessage = msg;
        this.isLoading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loginWithGoogle(): void {
    this.googleAuthService.loginWithGoogle();
  }
}