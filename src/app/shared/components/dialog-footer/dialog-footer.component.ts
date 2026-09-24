import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cb-dialog-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-footer.component.html',
  styleUrl: './dialog-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFooterComponent implements AfterViewInit, OnDestroy {
  @Input() action!: string;
  @Input() local_data: any;
  @Input() form!: NgForm | FormGroup | boolean;
  @Input() disableButton: boolean = true;
  @Input() isSaving: boolean = false; // Added to support our existing saving state
  
  @Output() submitClicked = new EventEmitter<void>();

  isFormValid: boolean = false;
  private statusSub!: Subscription;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (this.isNgForm(this.form)) {
      this.statusSub =
        this.form.statusChanges?.subscribe((status: any) => {
          this.isFormValid = status === 'VALID';
          this.cdr.markForCheck();
        }) ?? new Subscription();
    } else if (this.isFormGroup(this.form)) {
      this.isFormValid = this.form.valid;
      this.cdr.markForCheck();
      this.statusSub =
        this.form.statusChanges?.subscribe((status: any) => {
          this.isFormValid = status === 'VALID';
          this.cdr.markForCheck();
        }) ?? new Subscription();
    } else if (typeof this.form === 'boolean') {
      this.isFormValid = !!this.form;
    }
  }

  ngOnDestroy(): void {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  isNgForm(form: any): form is NgForm {
    return form instanceof NgForm;
  }

  isFormGroup(form: any): form is FormGroup {
    return form instanceof FormGroup;
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.submitClicked.emit();
  }
}
