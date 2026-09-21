import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { NotificationService } from '../../../../core/common/notifications/notification.service';
import { NotificationRequest, NotificationResponse, DeliveryAttempt } from '../../../../core/common/notifications/notification.models';

// ---------------------------------------------------------------------------
// Template variable definitions — source of truth for playground variable UI.
// Extend this map when new backend templates are supported.
// ---------------------------------------------------------------------------
interface TemplateVariableDef {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

const TEMPLATE_VARIABLE_DEFS: Record<string, TemplateVariableDef[]> = {
  WELCOME: [
    { key: 'name', label: 'Name', placeholder: 'John Doe', required: true }
  ],
  OTP: [
    { key: 'otp', label: 'OTP Code', placeholder: '123456', required: true }
  ],
  RESET_PASSWORD: [
    { key: 'name', label: 'Name', placeholder: 'John Doe', required: true },
    { key: 'resetLink', label: 'Reset Link', placeholder: 'https://example.com/reset/...', required: true }
  ]
};

// Channels that the backend actually supports
const SUPPORTED_CHANNELS = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' }
];

// Notification statuses as defined in the backend NotificationStatus enum
type NotificationStatus = 'QUEUED' | 'PROCESSING' | 'RETRY_SCHEDULED' | 'SENT' | 'FAILED';

interface LifecycleStep {
  label: string;
  desc: string;
  stepStatus: 'completed' | 'retry' | 'failed' | 'pending';
}

interface AdvancedVariable {
  key: string;
  value: string;
}

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit, OnDestroy {

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------
  playgroundForm: FormGroup;

  /** Key-value map for template variable inputs (not in FormGroup to stay flexible). */
  templateVariableValues: Record<string, string> = {};

  /** Advanced key/value pairs added by the user. */
  advancedVariables: AdvancedVariable[] = [];

  // ---------------------------------------------------------------------------
  // Token state
  // ---------------------------------------------------------------------------
  // Token is now handled directly via playgroundForm.get('apiToken')

  // ---------------------------------------------------------------------------
  // Constants exposed to template
  // ---------------------------------------------------------------------------
  readonly supportedChannels = SUPPORTED_CHANNELS;
  readonly supportedTemplates = Object.keys(TEMPLATE_VARIABLE_DEFS);

  // ---------------------------------------------------------------------------
  // Request / send state
  // ---------------------------------------------------------------------------
  isSending = false;
  private requestStartTime = 0;

  // ---------------------------------------------------------------------------
  // Response state
  // ---------------------------------------------------------------------------
  hasResponse = false;
  lastResponse: NotificationResponse | null = null;
  lastResponseMs: number | null = null;
  lastHttpStatus: number | null = null;
  lastErrorMessage: string | null = null;

  // ---------------------------------------------------------------------------
  // Lifecycle / delivery attempts
  // ---------------------------------------------------------------------------
  deliveryAttempts: DeliveryAttempt[] = [];
  isRefreshingStatus = false;
  attemptsError: string | null = null;

  // ---------------------------------------------------------------------------
  // UI tab state
  // ---------------------------------------------------------------------------
  activeRequestTab = 'HTTP';
  activeResponseTab = 'JSON';

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.playgroundForm = this.fb.group({
      apiToken:       ['', Validators.required],
      channel:        ['EMAIL', Validators.required],
      recipient:      ['', Validators.required],
      template:       ['WELCOME', Validators.required],
      idempotencyKey: [this.generateKey(), Validators.required]
    });

    // Initialise template variable values for the default template
    this.syncTemplateVariableValues('WELCOME');
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  // ---------------------------------------------------------------------------
  // Channel handling
  // ---------------------------------------------------------------------------

  onChannelChange(): void {
    this.playgroundForm.get('recipient')!.setValue('');
  }

  get currentChannel(): string {
    return this.playgroundForm.get('channel')?.value ?? 'EMAIL';
  }

  get recipientPlaceholder(): string {
    return this.currentChannel === 'EMAIL' ? 'user@example.com' : '+919876543210';
  }

  get recipientHint(): string {
    return this.currentChannel === 'EMAIL'
      ? 'Enter a valid email address'
      : 'Enter phone number in E.164 format (e.g. +919876543210)';
  }

  // ---------------------------------------------------------------------------
  // Template handling
  // ---------------------------------------------------------------------------

  onTemplateChange(): void {
    this.syncTemplateVariableValues(this.currentTemplate);
  }

  get currentTemplate(): string {
    return this.playgroundForm.get('template')?.value ?? 'WELCOME';
  }

  get currentTemplateVarDefs(): TemplateVariableDef[] {
    return TEMPLATE_VARIABLE_DEFS[this.currentTemplate] ?? [];
  }

  private syncTemplateVariableValues(template: string): void {
    const newValues: Record<string, string> = {};
    (TEMPLATE_VARIABLE_DEFS[template] ?? []).forEach(v => {
      // Preserve existing value if key already exists
      newValues[v.key] = this.templateVariableValues[v.key] ?? '';
    });
    this.templateVariableValues = newValues;
  }

  // ---------------------------------------------------------------------------
  // Idempotency key
  // ---------------------------------------------------------------------------

  generateIdempotencyKey(): void {
    this.playgroundForm.get('idempotencyKey')!.setValue(this.generateKey());
  }

  private generateKey(): string {
    const now = new Date();
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    const ts = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds())
    ].join('');
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `playground-${ts}-${rand}`;
  }

  // ---------------------------------------------------------------------------
  // Advanced variables
  // ---------------------------------------------------------------------------

  addAdvancedVariable(): void {
    this.advancedVariables = [...this.advancedVariables, { key: '', value: '' }];
  }

  removeAdvancedVariable(index: number): void {
    this.advancedVariables = this.advancedVariables.filter((_, i) => i !== index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---------------------------------------------------------------------------
  // Token masking (never expose full token in UI)
  // ---------------------------------------------------------------------------

  getMaskedTokenForPreview(): string {
    const rawToken = this.playgroundForm.get('apiToken')?.value;
    if (!rawToken) return '(No token entered)';
    
    // Simple mask for manual token: keep first 4 and last 4 if long enough
    if (rawToken.length > 12) {
      const first4 = rawToken.slice(0, 4);
      const last4 = rawToken.slice(-4);
      return `${first4}••••••••••••${last4}`;
    }
    
    // Fallback mask for short inputs
    return `••••••••`;
  }

  // ---------------------------------------------------------------------------
  // Request body / preview building
  // ---------------------------------------------------------------------------

  private buildRequestBody(): NotificationRequest {
    const variables: Record<string, string> = { ...this.templateVariableValues };

    // Merge advanced variables — skip empty keys
    this.advancedVariables.forEach(av => {
      if (av.key.trim()) {
        variables[av.key.trim()] = av.value;
      }
    });

    return {
      channel: this.currentChannel as 'EMAIL' | 'SMS',
      recipient: this.playgroundForm.get('recipient')!.value?.trim() ?? '',
      template: this.currentTemplate,
      variables
    };
  }

  getRequestBodyJson(): string {
    return JSON.stringify(this.buildRequestBody(), null, 2);
  }

  get idempotencyKey(): string {
    return this.playgroundForm.get('idempotencyKey')?.value ?? '';
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  private validateForm(): string | null {
    const apiToken = this.playgroundForm.get('apiToken')?.value?.trim();
    if (!apiToken) {
      return 'Please enter an API token.';
    }
    const channel = this.currentChannel;
    const recipient = (this.playgroundForm.get('recipient')!.value ?? '').trim();
    if (!recipient) {
      return 'Please enter a recipient.';
    }
    if (channel === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return 'Please enter a valid email address.';
    }
    if (channel === 'SMS' && !/^\+[1-9]\d{6,14}$/.test(recipient)) {
      return 'Please enter a valid phone number in E.164 format (e.g. +919876543210).';
    }
    const template = this.currentTemplate;
    if (!template) {
      return 'Please select a template.';
    }
    const templateVars = TEMPLATE_VARIABLE_DEFS[template] ?? [];
    for (const v of templateVars) {
      if (v.required && !(this.templateVariableValues[v.key] ?? '').trim()) {
        return `"${v.label}" is required for the ${template} template.`;
      }
    }
    if (!this.idempotencyKey) {
      return 'Idempotency key is required.';
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Send notification
  // ---------------------------------------------------------------------------

  sendNotification(): void {
    const validationError = this.validateForm();
    if (validationError) {
      this.hasResponse = true;
      this.lastResponse = null;
      this.lastHttpStatus = 0;
      this.lastErrorMessage = validationError;
      this.lastResponseMs = null;
      return;
    }

    const requestBody = this.buildRequestBody();
    const idempotencyKey = this.idempotencyKey;
    const apiToken = this.playgroundForm.get('apiToken')!.value.trim();

    this.isSending = true;
    this.hasResponse = false;
    this.lastResponse = null;
    this.lastErrorMessage = null;
    this.lastHttpStatus = null;
    this.lastResponseMs = null;
    this.deliveryAttempts = [];
    this.attemptsError = null;
    this.requestStartTime = Date.now();

    this.notificationService.sendWithApiKey(requestBody, idempotencyKey, apiToken).subscribe({
      next: (response) => {
        this.lastResponseMs = Date.now() - this.requestStartTime;
        this.lastResponse = response;
        this.lastHttpStatus = 200;
        this.hasResponse = true;
        this.isSending = false;
        // Always generate a fresh idempotency key after a successful send
        // so the user never accidentally reuses the same key
        this.generateIdempotencyKey();
      },
      error: (err: HttpErrorResponse) => {
        this.lastResponseMs = Date.now() - this.requestStartTime;
        this.lastHttpStatus = err.status;
        this.lastErrorMessage = this.mapHttpError(err);
        this.lastResponse = null;
        this.hasResponse = true;
        this.isSending = false;
      }
    });
  }

  private mapHttpError(err: HttpErrorResponse): string {
    // Use safe backend message when available — never expose stack traces/credentials
    const body = err.error;
    const backendMsg: string | null =
      (typeof body?.message === 'string' ? body.message : null) ||
      (typeof body?.error === 'string' ? body.error : null);

    switch (err.status) {
      case 0:    return 'Could not connect to the API. Check that the backend is running.';
      case 400:  return backendMsg ?? 'Invalid notification request. Please check the request fields.';
      case 401:  return 'API token is invalid or expired. Please select a valid token.';
      case 403:  return 'You are not authorized to use this API token.';
      case 404:  return 'Notification resource not found.';
      case 409:  return 'Duplicate request. This Idempotency-Key has already been used. Click ↻ to regenerate it.';
      case 422:  return backendMsg ?? 'Please check the notification fields.';
      case 429:  return 'Too many requests. Please wait and try again.';
      case 500:  return 'Notification service encountered an unexpected error. Please try again.';
      default:   return backendMsg ?? `Unexpected error (HTTP ${err.status}).`;
    }
  }

  // ---------------------------------------------------------------------------
  // Status refresh / delivery attempts
  // ---------------------------------------------------------------------------

  refreshStatus(): void {
    if (!this.lastResponse?.id || this.isRefreshingStatus) return;

    this.isRefreshingStatus = true;
    this.attemptsError = null;

    this.notificationService.getDeliveryAttempts(this.lastResponse.id).subscribe({
      next: (attempts) => {
        this.deliveryAttempts = attempts;
        this.isRefreshingStatus = false;
      },
      error: () => {
        this.attemptsError = 'Could not load delivery attempts.';
        this.isRefreshingStatus = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Lifecycle visualization
  // ---------------------------------------------------------------------------

  get lifecycleStepsComputed(): LifecycleStep[] {
    const status = this.lastResponse?.status as NotificationStatus | undefined;

    const accepted: LifecycleStep = {
      label: 'Request Accepted',
      desc: 'Notification accepted and queued',
      stepStatus: status ? 'completed' : 'pending'
    };

    const processing: LifecycleStep = {
      label: status === 'RETRY_SCHEDULED' ? 'Retry Scheduled' : 'Processing',
      desc: status === 'RETRY_SCHEDULED'
        ? 'Temporary failure — retry scheduled'
        : 'Sending to notification provider',
      stepStatus:
        status === 'PROCESSING' || status === 'RETRY_SCHEDULED' || status === 'SENT' || status === 'FAILED'
          ? (status === 'RETRY_SCHEDULED' ? 'retry' : 'completed')
          : 'pending'
    };

    const delivery: LifecycleStep = {
      label: status === 'SENT' ? 'Delivered' : status === 'FAILED' ? 'Delivery Failed' : 'Delivery',
      desc: status === 'SENT'
        ? 'Successfully delivered to recipient'
        : status === 'FAILED'
          ? 'Notification could not be delivered'
          : 'Waiting for delivery confirmation',
      stepStatus: status === 'SENT' ? 'completed' : status === 'FAILED' ? 'failed' : 'pending'
    };

    return [accepted, processing, delivery];
  }

  getStepIconName(stepStatus: string): string {
    switch (stepStatus) {
      case 'completed': return 'check';
      case 'retry':     return 'warning';
      case 'failed':    return 'close';
      default:          return 'radio_button_unchecked';
    }
  }

  getStepIconClass(stepStatus: string): string {
    switch (stepStatus) {
      case 'completed': return 'bg-blue-600 text-white';
      case 'retry':     return 'bg-amber-500 text-white';
      case 'failed':    return 'bg-red-500 text-white';
      default:          return 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400';
    }
  }

  // ---------------------------------------------------------------------------
  // Status display helpers
  // ---------------------------------------------------------------------------

  getStatusDescription(status: string): string {
    switch (status) {
      case 'QUEUED':           return 'Notification accepted and waiting for processing.';
      case 'PROCESSING':       return 'Notification is currently being processed.';
      case 'RETRY_SCHEDULED':  return 'Temporary delivery failure. Another attempt is scheduled.';
      case 'SENT':             return 'Notification was successfully delivered.';
      case 'FAILED':           return 'Notification could not be delivered.';
      default:                 return status;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SENT':             return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'QUEUED':           return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PROCESSING':       return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'RETRY_SCHEDULED':  return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'FAILED':           return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:                 return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  /** Banner-style (block) version of status colour — no pill rounding/sizing. */
  getStatusDescriptionBannerClass(status: string): string {
    switch (status) {
      case 'SENT':             return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'QUEUED':           return 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'PROCESSING':       return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'RETRY_SCHEDULED':  return 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'FAILED':           return 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:                 return 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300';
    }
  }

  getHttpStatusDotClass(httpStatus: number): string {
    if (httpStatus >= 200 && httpStatus < 300) return 'bg-emerald-500';
    if (httpStatus >= 400) return 'bg-red-500';
    return 'bg-slate-500';
  }

  getHttpStatusLabel(httpStatus: number): string {
    const labels: Record<number, string> = {
      200: '200 OK',
      201: '201 Created',
      400: '400 Bad Request',
      401: '401 Unauthorized',
      403: '403 Forbidden',
      404: '404 Not Found',
      409: '409 Conflict',
      422: '422 Unprocessable',
      429: '429 Too Many Requests',
      500: '500 Internal Server Error'
    };
    return labels[httpStatus] ?? `${httpStatus}`;
  }

  get overallSuccess(): boolean {
    return !!this.lastResponse && !this.lastErrorMessage;
  }

  // ---------------------------------------------------------------------------
  // Clipboard helpers
  // ---------------------------------------------------------------------------

  copyRequestJson(): void {
    navigator.clipboard.writeText(this.getRequestBodyJson()).catch(() => {/* silently ignore */});
  }

  copyResponseJson(): void {
    if (this.lastResponse) {
      navigator.clipboard.writeText(JSON.stringify(this.lastResponse, null, 2)).catch(() => {/* silently ignore */});
    }
  }

  // ---------------------------------------------------------------------------
  // Date formatting
  // ---------------------------------------------------------------------------

  formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  formatTime(dateStr: string | undefined | null): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { timeStyle: 'medium' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  // ---------------------------------------------------------------------------
  // Raw JSON for response display
  // ---------------------------------------------------------------------------

  get lastResponseJson(): string {
    return this.lastResponse ? JSON.stringify(this.lastResponse, null, 2) : '';
  }
}