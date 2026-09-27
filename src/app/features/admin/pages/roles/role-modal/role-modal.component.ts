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
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogHeaderComponent } from '../../../../../shared/components/dialog-header/dialog-header.component';
import { DialogFooterComponent } from '../../../../../shared/components/dialog-footer/dialog-footer.component';

import { AdminRoleService } from '../../../../../core/admin/services/admin-role.service';
import { ToastService } from '../../../../../core/common/toast/toast.service';
import { AdminRole } from '../../../../../core/admin/services/admin-role.models';

export type RoleModalMode = 'create' | 'edit' | 'delete' | 'view';

export interface RoleModalData {
  mode: RoleModalMode;
  role?: AdminRole;
}

export interface RoleModalResult {
  action: RoleModalMode;
}

@Component({
  selector: 'app-role-modal',
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
    MatTooltipModule,
    DialogHeaderComponent,
    DialogFooterComponent,
  ],
  templateUrl: './role-modal.component.html',
  styleUrls: ['./role-modal.component.scss'],
})
export class RoleModalComponent implements OnInit, OnDestroy {
  private readonly service = inject(AdminRoleService);
  private readonly toastr = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RoleModalComponent>);
  readonly data: RoleModalData = inject(MAT_DIALOG_DATA);

  private readonly destroy$ = new Subject<void>();

  form!: FormGroup;
  isSaving = signal<boolean>(false);

  get mode(): RoleModalMode {
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

  get role(): AdminRole | undefined {
    return this.data.role;
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
    const r = this.role;
    
    this.form = this.fb.group({
      name: [r?.name ?? '', [Validators.required, Validators.maxLength(50)]],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();
    if (!v.name?.trim()) {
      this.toastr.error('Role name cannot be empty');
      return;
    }

    if (this.isSaving()) return;
    this.isSaving.set(true);

    if (this.mode === 'create') {
      this.service
        .createRole({
          name: v.name.trim(),
        })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastr.success('Role created successfully.');
            this.dialogRef.close({ action: 'create' } as RoleModalResult);
          },
          error: (err: any) => {
            const msg = err?.error?.message ?? 'Failed to create role.';
            this.toastr.error(msg);
          },
        });
    } else {
      // edit
      this.service
        .updateRole(this.role!.id, {
          name: v.name.trim(),
        })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastr.success('Role updated successfully.');
            this.dialogRef.close({ action: 'edit' } as RoleModalResult);
          },
          error: (err: any) => {
            const msg = err?.error?.message ?? 'Failed to update role.';
            this.toastr.error(msg);
          },
        });
    }
  }

  confirmDelete(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.service
      .deleteRole(this.role!.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Role deleted successfully.');
          this.dialogRef.close({ action: 'delete' } as RoleModalResult);
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? 'Failed to delete role.';
          this.toastr.error(msg);
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
