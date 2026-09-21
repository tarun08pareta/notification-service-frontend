import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

import { AdminProviderService } from '../../../../core/admin/services/admin-provider.service';
import { AdminProvider } from '../../../../core/admin/models/admin-provider.model';
import { ToastService } from '../../../../core/common/toast/toast.service';

const DISPLAYED_COLUMNS = [
  'name',
  'enabled',
  'priority',
  'channels',
  'lastAttempt',
  'lastSuccess',
  'lastFailure',
  'actions'
];

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatTableModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss'
})
export class ProvidersComponent implements OnInit, OnDestroy {
  private readonly providerService = inject(AdminProviderService);
  private readonly toastr = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('editPriorityDialog') editPriorityDialog!: TemplateRef<unknown>;

  readonly displayedColumns = DISPLAYED_COLUMNS;

  providers = signal<AdminProvider[]>([]);
  isLoading = signal<boolean>(false);
  
  // Set to track loading state of individual providers (by name)
  loadingProviders = signal<Set<string>>(new Set());

  // Priority edit modal state
  selectedProviderForPriority = signal<AdminProvider | null>(null);
  editPriorityValue = signal<number>(0);
  isSavingPriority = signal<boolean>(false);
  private dialogRef: MatDialogRef<unknown> | null = null;

  ngOnInit(): void {
    this.loadProviders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProviders(): void {
    this.isLoading.set(true);
    this.providerService.getProviders()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => this.providers.set(data),
        error: () => this.toastr.error('Failed to load providers.')
      });
  }

  toggleProviderEnabled(provider: AdminProvider, newEnabledState: boolean): void {
    const currentLoading = new Set(this.loadingProviders());
    currentLoading.add(provider.name);
    this.loadingProviders.set(currentLoading);

    this.providerService.updateProviderEnabledState(provider.name, newEnabledState)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          const newLoading = new Set(this.loadingProviders());
          newLoading.delete(provider.name);
          this.loadingProviders.set(newLoading);
        })
      )
      .subscribe({
        next: (updatedProvider) => {
          this.updateProviderInList(updatedProvider);
          this.toastr.success(`Provider ${newEnabledState ? 'enabled' : 'disabled'} successfully.`);
        },
        error: () => {
          // Revert the toggle by reloading the provider from the current list visually 
          // (Angular change detection on the bound model would usually need a manual trigger or list replacement if we mutate, 
          // so we replace the list with the exact same items to force change detection)
          this.providers.set([...this.providers()]); 
          this.toastr.error('Failed to update provider status.');
        }
      });
  }

  openEditPriority(provider: AdminProvider): void {
    this.selectedProviderForPriority.set(provider);
    this.editPriorityValue.set(provider.priority);
    
    this.dialogRef = this.dialog.open(this.editPriorityDialog, {
      width: '400px',
      autoFocus: false,
      panelClass: 'admin-provider-dialog'
    });
  }

  closeEditPriority(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
    this.selectedProviderForPriority.set(null);
  }

  savePriority(): void {
    const provider = this.selectedProviderForPriority();
    const priority = this.editPriorityValue();

    if (!provider || priority === null || priority === undefined) return;

    this.isSavingPriority.set(true);
    this.providerService.updateProviderPriority(provider.name, priority)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSavingPriority.set(false))
      )
      .subscribe({
        next: (updatedProvider) => {
          this.updateProviderInList(updatedProvider);
          this.toastr.success('Provider priority updated successfully.');
          this.closeEditPriority();
        },
        error: () => {
          this.toastr.error('Failed to update provider priority.');
        }
      });
  }

  private updateProviderInList(updatedProvider: AdminProvider): void {
    const currentList = this.providers();
    const index = currentList.findIndex(p => p.name === updatedProvider.name);
    if (index !== -1) {
      const newList = [...currentList];
      newList[index] = updatedProvider;
      this.providers.set(newList);
    }
  }

  isProviderLoading(providerName: string): boolean {
    return this.loadingProviders().has(providerName);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  formatProviderName(name: string): string {
    return name.replace(/_/g, ' ');
  }
}
