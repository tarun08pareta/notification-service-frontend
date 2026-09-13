import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, interval } from 'rxjs';
import { NotificationService } from '../../../../core/common/notifications/notification.service';
import {
  NotificationRequest,
  NotificationResponse,
  DeliveryAttempt,
} from '../../../../core/common/notifications/notification.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;

  // State
  isSending = signal<boolean>(false);
  apiResponse = signal<NotificationResponse | null>(null);
  apiError = signal<{ status: number; message: string } | null>(null);
  deliveryAttempts = signal<DeliveryAttempt[]>([]);

  // Preview
  requestPreview = signal<any>({});

  // Subscriptions
  private formSub!: Subscription;

  ngOnInit() {
    this.initForm();
    this.generateIdempotencyKey();

    // Listen for channel changes to update validators
    this.form.get('channel')?.valueChanges.subscribe((channel) => {
      this.updateRecipientValidators(channel);
    });

    // Listen for template changes to update variables
    this.form.get('template')?.valueChanges.subscribe((template) => {
      this.updateTemplateVariables(template);
    });

    // Keep preview in sync
    this.formSub = this.form.valueChanges.subscribe(() => {
      this.updatePreview();
    });

    // Initial setups
    this.updateRecipientValidators(this.form.get('channel')?.value);
    this.updateTemplateVariables(this.form.get('template')?.value);
    this.updatePreview();
  }

  ngOnDestroy() {
    if (this.formSub) this.formSub.unsubscribe();
  }

  private initForm() {
    this.form = this.fb.group({
      channel: ['EMAIL', Validators.required],
      recipient: ['', Validators.required],
      template: ['WELCOME', Validators.required],
      variables: this.fb.group({}),
      advancedVariables: this.fb.array([]),
      idempotencyKey: ['', Validators.required],
    });
  }

  private updateRecipientValidators(channel: string) {
    const recipientControl = this.form.get('recipient');
    if (!recipientControl) return;

    recipientControl.clearValidators();
    if (channel === 'EMAIL') {
      recipientControl.setValidators([Validators.required, Validators.email]);
    } else if (channel === 'SMS') {
      // Basic E.164 validation regex: + followed by 10-15 digits
      recipientControl.setValidators([
        Validators.required,
        Validators.pattern(/^\+[1-9]\d{10,14}$/),
      ]);
    }
    recipientControl.updateValueAndValidity();
  }

  private updateTemplateVariables(template: string) {
    const variablesGroup = this.form.get('variables') as FormGroup;
    // Clear existing
    Object.keys(variablesGroup.controls).forEach((key) =>
      variablesGroup.removeControl(key),
    );

    if (template === 'WELCOME') {
      variablesGroup.addControl(
        'name',
        new FormControl('', Validators.required),
      );
    } else if (template === 'OTP') {
      variablesGroup.addControl(
        'otp',
        new FormControl('', Validators.required),
      );
    }
  }

  get advancedVariables() {
    return this.form.get('advancedVariables') as FormArray;
  }

  addAdvancedVariable() {
    this.advancedVariables.push(
      this.fb.group({
        key: ['', Validators.required],
        value: ['', Validators.required],
      }),
    );
  }

  removeAdvancedVariable(index: number) {
    this.advancedVariables.removeAt(index);
  }

  generateIdempotencyKey() {
    const randomKey =
      'playground-' +
      new Date().toISOString().replace(/\D/g, '').substring(0, 14) +
      '-' +
      Math.floor(Math.random() * 1000);
    this.form.get('idempotencyKey')?.setValue(randomKey);
  }

  private updatePreview() {
    const rawValue = this.form.value;

    // Combine standard and advanced variables
    const finalVariables = { ...rawValue.variables };
    if (rawValue.advancedVariables) {
      rawValue.advancedVariables.forEach((adv: any) => {
        if (adv.key) finalVariables[adv.key] = adv.value;
      });
    }

    this.requestPreview.set({
      channel: rawValue.channel,
      recipient: rawValue.recipient,
      template: rawValue.template,
      variables: finalVariables,
    });
  }

  copyPreview() {
    navigator.clipboard.writeText(
      JSON.stringify(this.requestPreview(), null, 2),
    );
    this.snackBar.open('Copied to clipboard!', 'Close', { duration: 2000 });
  }

  sendNotification() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.apiResponse.set(null);
    this.apiError.set(null);
    this.deliveryAttempts.set([]);

    const payload = this.requestPreview() as NotificationRequest;
    const idempotencyKey = this.form.get('idempotencyKey')?.value;

    this.notificationService
      .sendNotification(payload, idempotencyKey)
      .subscribe({
        next: (res: NotificationResponse) => {
          this.apiResponse.set(res);
          this.isSending.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.isSending.set(false);
          this.handleError(err);
        },
      });
  }

  refreshAttempts() {
    const response = this.apiResponse();
    if (!response) return;

    this.notificationService.getDeliveryAttempts(response.id).subscribe({
      next: (attempts: DeliveryAttempt[]) => {
        this.deliveryAttempts.set(attempts || []);
      },
      error: (err: any) => {
        console.error('Failed to load attempts', err);
      },
    });
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An unknown error occurred.';
    if (error.status === 400) {
      message = error.error?.message || 'Invalid notification request.';
    } else if (error.status === 401) {
      message = 'Authentication required.';
    } else if (error.status === 409) {
      message =
        'Idempotency conflict. This Idempotency-Key was already used with different request data.';
    } else if (error.status >= 500) {
      message = 'Notification service error.';
    }

    this.apiError.set({
      status: error.status,
      message,
    });
  }
}
