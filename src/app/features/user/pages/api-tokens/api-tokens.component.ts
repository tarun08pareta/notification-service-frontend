import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiTokenService, ApiTokenListResponse, ApiTokenCreateResponse } from '../../../../core/common/auth/api-token.service';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-api-tokens',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './api-tokens.component.html',
  styleUrls: ['./api-tokens.component.scss']
})
export class ApiTokensComponent implements OnInit {
  private apiTokenService = inject(ApiTokenService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  @ViewChild('createTokenDialog') createTokenDialog!: TemplateRef<any>;
  @ViewChild('viewTokenDialog') viewTokenDialog!: TemplateRef<any>;
  private dialogRef: MatDialogRef<any> | null = null;

  // State
  isLoading = signal<boolean>(true);
  tokens = signal<ApiTokenListResponse[]>([]);
  filterStatus = signal<'All' | 'Active' | 'Revoked'>('All');

  // Computed state
  totalCount = computed(() => this.tokens().length);
  activeCount = computed(() => this.tokens().filter(t => !t.revokedAt).length);
  revokedCount = computed(() => this.tokens().filter(t => !!t.revokedAt).length);
  
  latestToken = computed(() => {
    const all = this.tokens();
    if (all.length === 0) return null;
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  });

  filteredTokens = computed(() => {
    const status = this.filterStatus();
    const all = this.tokens();
    if (status === 'Active') return all.filter(t => !t.revokedAt);
    if (status === 'Revoked') return all.filter(t => !!t.revokedAt);
    return all;
  });
  
  isCreating = signal<boolean>(false);
  isRevoking = signal<boolean>(false);

  // View Token state
  viewSelectedToken: ApiTokenListResponse | null = null;
  newTokenResponse = signal<ApiTokenCreateResponse | null>(null);
  createForm!: FormGroup;

  // Selected Token for Revocation
  selectedToken: ApiTokenListResponse | null = null;
  isRevokeModalOpen = false;

  ngOnInit(): void {
    this.initForm();
    this.loadTokens();
  }

  private initForm(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  loadTokens(): void {
    this.isLoading.set(true);
    this.apiTokenService.getApiTokens().subscribe({
      next: (data) => {
        this.tokens.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('Failed to load API tokens.', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  setFilter(status: 'All' | 'Active' | 'Revoked'): void {
    this.filterStatus.set(status);
  }

  // Dialog Control Methods
  openCreateDialog(): void {
    this.createForm.reset();
    this.newTokenResponse.set(null);
    this.dialogRef = this.dialog.open(this.createTokenDialog, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'token-dialog-panel',
      backdropClass: 'blur-backdrop',
      disableClose: true
    });
  }

  closeCreateDialog(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
  }

  submitCreateToken(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    const { name } = this.createForm.value;

    this.apiTokenService.createApiToken(name).subscribe({
      next: (response) => {
        this.isCreating.set(false);
        this.newTokenResponse.set(response);
        this.loadTokens(); // Refresh list to show new token
      },
      error: (err) => {
        this.isCreating.set(false);
        let msg = 'Failed to create API Token.';
        if (err.error?.message) {
          msg = err.error.message;
        }
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  copyToken(token: string): void {
    navigator.clipboard.writeText(token).then(() => {
      this.snackBar.open('Token copied to clipboard', 'Close', { duration: 2000 });
    });
  }

  openViewDialog(token: ApiTokenListResponse): void {
    this.viewSelectedToken = token;
    this.dialog.open(this.viewTokenDialog, {
      width: '450px',
      maxWidth: '90vw',
      panelClass: 'token-dialog-panel',
      backdropClass: 'blur-backdrop'
    });
  }

  openRevokeModal(token: ApiTokenListResponse): void {
    this.selectedToken = token;
    this.isRevokeModalOpen = true;
  }

  closeRevokeModal(): void {
    this.isRevokeModalOpen = false;
    this.selectedToken = null;
  }

  confirmRevoke(): void {
    if (!this.selectedToken) return;
    
    this.isRevoking.set(true);
    this.apiTokenService.revokeApiToken(this.selectedToken.id).subscribe({
      next: () => {
        this.isRevoking.set(false);
        this.snackBar.open('API Token revoked successfully.', 'Close', { duration: 3000 });
        this.loadTokens();
        this.closeRevokeModal();
      },
      error: (err) => {
        this.isRevoking.set(false);
        this.snackBar.open('Failed to revoke API token.', 'Close', { duration: 5000 });
      }
    });
  }
}