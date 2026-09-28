import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent as SharedChangePasswordComponent } from '../../../../../shared/components/change-password/change-password.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-change-password',
  standalone: true,
  imports: [CommonModule, SharedChangePasswordComponent, PageHeaderComponent, MatCardModule],
  template: `
    <div class="change-password-page p-6 max-w-[1400px] mx-auto">
      <app-page-header
        title="Change Password"
        description="Update your account password to stay secure.">
      </app-page-header>

      <mat-card class="mt-6">
        <mat-card-content class="p-6 sm:p-10">
          <app-change-password></app-change-password>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ChangePasswordComponent { }
