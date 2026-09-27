import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, finalize } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogHeaderComponent } from '../../../../../shared/components/dialog-header/dialog-header.component';
import { DialogFooterComponent } from '../../../../../shared/components/dialog-footer/dialog-footer.component';

import { AdminUserService } from '../../../../../core/admin/services/admin-user.service';
import { ToastService } from '../../../../../core/common/toast/toast.service';
import { AdminUser } from '../../../../../core/admin/services/admin-user.models';
import { AdminRole } from '../../../../../core/admin/services/admin-role.models';

export type UserModalMode = 'create' | 'edit' | 'delete' | 'view';

export interface UserModalData {
  mode: UserModalMode;
  user?: AdminUser;
  roles: AdminRole[];
}

export interface UserModalResult {
  action: UserModalMode;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    DialogHeaderComponent,
    DialogFooterComponent,
  ],
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss'],
})
export class UserModalComponent implements OnInit, OnDestroy {
  private readonly service = inject(AdminUserService);
  private readonly toastr = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserModalComponent>);
  readonly data: UserModalData = inject(MAT_DIALOG_DATA);

  private readonly destroy$ = new Subject<void>();

  form!: FormGroup;
  isSaving = signal<boolean>(false);

  get mode(): UserModalMode {
    return this.data.mode;
  }

  get actionTitle(): string {
    if (this.mode === 'create') return 'Add';
    if (this.mode === 'edit') return 'Edit';
    if (this.mode === 'delete') return 'Delete';
    return 'View';
  }

  get buttonTitle(): string {
    if (this.mode === 'edit') return 'Update';
    return this.actionTitle;
  }

  get user(): AdminUser | undefined {
    return this.data.user;
  }
  
  get roles(): AdminRole[] {
    return this.data.roles;
  }

  ngOnInit(): void {
    if (this.mode === 'create' || this.mode === 'edit') {
      this.initForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    const u = this.user;
    
    // Find role IDs for editing
    const userRoleIds = u?.roles
      ? this.roles.filter(r => u.roles.includes(r.name)).map(r => r.id)
      : [];

    this.form = this.fb.group({
      name: [u?.name ?? '', [Validators.required]],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      roleIds: [userRoleIds, [Validators.required, Validators.minLength(1)]],
    });

    if (this.mode === 'create') {
      this.form.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(8)]));
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();

    if (this.isSaving()) return;
    this.isSaving.set(true);

    if (this.mode === 'create') {
      this.service
        .createUser({
          name: v.name.trim(),
          email: v.email.trim(),
          password: v.password,
          roleIds: v.roleIds,
        })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastr.success('User created successfully.');
            this.dialogRef.close({ action: 'create' } as UserModalResult);
          },
          error: (err: any) => {
            const msg = err?.error?.message ?? 'Failed to create user.';
            this.toastr.error(msg);
          },
        });
    } else {
      // edit
      this.service
        .updateUser(this.user!.id, {
          name: v.name.trim(),
          email: v.email.trim(),
          roleIds: v.roleIds,
        })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastr.success('User updated successfully.');
            this.dialogRef.close({ action: 'edit' } as UserModalResult);
          },
          error: (err: any) => {
            const msg = err?.error?.message ?? 'Failed to update user.';
            this.toastr.error(msg);
          },
        });
    }
  }

  confirmDelete(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.service
      .deleteUser(this.user!.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.toastr.success('User deleted successfully.');
          this.dialogRef.close({ action: 'delete' } as UserModalResult);
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? 'Failed to delete user.';
          this.toastr.error(msg);
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
