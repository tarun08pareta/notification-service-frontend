import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, finalize } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogHeaderComponent } from '../../../../../shared/components/dialog-header/dialog-header.component';
import { DialogFooterComponent } from '../../../../../shared/components/dialog-footer/dialog-footer.component';

import { AdminEmailTemplateService } from '../../../../../core/admin/services/admin-email-template.service';
import { ToastService } from '../../../../../core/common/toast/toast.service';
import { EmailTemplate } from '../../../../../core/admin/services/admin-email-template.models';

export type TemplateModalMode = 'create' | 'edit' | 'delete' | 'view';

export interface TemplateModalData {
  mode: TemplateModalMode;
  template?: EmailTemplate;
}

export interface TemplateModalResult {
  action: TemplateModalMode;
}

@Component({
  selector: 'app-template-modal',
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
    MatSlideToggleModule,
    MatTooltipModule,
    DialogHeaderComponent,
    DialogFooterComponent,
  ],
  templateUrl: './template-modal.component.html',
  styleUrls: ['./template-modal.component.scss'],
})
export class TemplateModalComponent implements OnInit, OnDestroy {
  private readonly service = inject(AdminEmailTemplateService);
  private readonly toastr = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TemplateModalComponent>);
  readonly data: TemplateModalData = inject(MAT_DIALOG_DATA);

  private readonly destroy$ = new Subject<void>();

  form!: FormGroup;
  isSaving = signal<boolean>(false);

  get mode(): TemplateModalMode {
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

  get template(): EmailTemplate | undefined {
    return this.data.template;
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

  get variablesArray(): FormArray {
    return this.form.get('variables') as FormArray;
  }

  // UPDATED: Custom validator for the variables array
  private variablesValidator = (array: AbstractControl) => {
    const arr = array as FormArray;
    const values = arr.getRawValue ? arr.getRawValue() : array.value as any[];
    const keys = new Set<string>();
    
    for (let i = 0; i < values.length; i++) {
      const key = values[i].key?.trim();
      if (!key) continue;
      if (key === 'advancedVariables') {
        return { advancedVariablesReserved: true };
      }
      if (keys.has(key)) {
        return { duplicateKey: true, duplicateValue: key };
      }
      keys.add(key);
    }
    return null;
  }

  private initForm(): void {
    const t = this.template;
    
    // UPDATED: Build variables FormArray
    const varsArray = new FormArray<FormGroup>([]);
    varsArray.setValidators(this.variablesValidator);
    
    // Protected system variables
    const systemVars = [
      { key: 'companyName', source: 'COMPANY_PROFILE', required: true, isSystem: true },
      { key: 'logoUrl', source: 'COMPANY_PROFILE', required: false, isSystem: true }
    ];
    
    const addVarToForm = (v: any) => {
      varsArray.push(this.fb.group({
        key: [{ value: v.key, disabled: v.isSystem }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
        source: [v.source, [Validators.required]],
        required: [v.required],
        isSystem: [v.isSystem || false]
      }));
    };
    
    systemVars.forEach(v => addVarToForm(v));
    
    if (t?.variables) {
      t.variables.forEach(v => {
        if (v.key !== 'companyName' && v.key !== 'logoUrl' && v.key !== 'advancedVariables') {
          addVarToForm({ ...v, isSystem: false });
        }
      });
    }

    this.form = this.fb.group({
      code: [
        { value: t?.code ?? '', disabled: this.mode === 'edit' },
        [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)],
      ],
      name: [t?.name ?? '', [Validators.required]],
      subject:      [t?.subject ?? '',       [Validators.required]],
      htmlBody:     [t?.htmlBody ?? '',       [Validators.required]],
      textBody:     [t?.textBody ?? '',  []],
      variables:    varsArray
    });

    // UPDATED: Auto-suggest Template Code based on Template Name
    if (this.mode === 'create') {
      this.form.get('name')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
        const codeControl = this.form.get('code');
        if (codeControl && !codeControl.dirty) {
          const suggested = (val || '')
            .toUpperCase()
            .replace(/[^A-Z0-9\s_]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          codeControl.setValue(suggested);
        }
      });
    }
  }

  // UPDATED: Methods for manual variable management
  addVariable(): void {
    this.variablesArray.push(this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      source: ['USER', [Validators.required]],
      required: [true],
      isSystem: [false]
    }));
  }

  removeVariable(index: number): void {
    if (this.variablesArray.at(index).get('isSystem')?.value) return;
    this.variablesArray.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isSaving()) return;

    this.isSaving.set(true);
    const v = this.form.getRawValue(); // getRawValue includes disabled controls
    
    // UPDATED: Clean the variables payload to match exactly what backend expects
    const variablesPayload = (v.variables || []).map((vItem: any) => ({
      key: vItem.key,
      source: vItem.source,
      required: vItem.required,
    }));

    if (this.mode === 'create') {
      this.service
        .createTemplate({
          code: v.code,
          name: v.name,
          subject: v.subject,
          htmlBody: v.htmlBody,
          textBody: v.textBody || undefined,
          variables: variablesPayload,
        })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastr.success('Email template created successfully.');
            this.dialogRef.close({ action: 'create' } as TemplateModalResult);
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'Failed to create email template.';
            this.toastr.error(msg);
          },
        });
    } else {
      // edit
      this.service
        .updateTemplate(this.template!.id, {
          name: v.name,
          subject: v.subject,
          htmlBody: v.htmlBody,
          textBody: v.textBody || undefined,
          variables: variablesPayload,
        })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toastr.success('Email template updated successfully.');
            this.dialogRef.close({ action: 'edit' } as TemplateModalResult);
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'Failed to update email template.';
            this.toastr.error(msg);
          },
        });
    }
  }

  confirmDelete(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.service
      .deleteTemplate(this.template!.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Email template deleted successfully.');
          this.dialogRef.close({ action: 'delete' } as TemplateModalResult);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to delete email template.';
          this.toastr.error(msg);
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  // UPDATED: Added helper methods for displaying template variables.

  formatVariableName(key: string): string {
    if (!key) return '';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  getDisplayVariables(): any[] {
    if (!this.template?.variables) return [];
    // Filter out advancedVariables
    return this.template.variables.filter(v => v.key !== 'advancedVariables');
  }

}
