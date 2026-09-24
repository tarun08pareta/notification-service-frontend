import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule }          from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule }         from '@angular/material/select';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatIconModule }           from '@angular/material/icon';
import { MatButtonModule }         from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }        from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { PageHeaderComponent }   from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent }   from '../../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent, StatusVariant } from '../../../../shared/ui/status-chip/status-chip.component';

import { AdminEmailTemplateService, ADMIN_TEMPLATES_DEFAULT_PAGE_SIZE, ADMIN_TEMPLATES_PAGE_SIZE_OPTIONS } from '../../../../core/admin/services/admin-email-template.service';
import { ToastService }          from '../../../../core/common/toast/toast.service';
import { EmailTemplate, EmailTemplateStatus } from '../../../../core/admin/services/admin-email-template.models';
import { TemplateModalComponent, TemplateModalData, TemplateModalResult } from './template-modal/template-modal.component';
import { DIALOG_CONFIG } from '../../../../shared/components/dialog-config';


const DISPLAYED_COLUMNS: string[] = [
  'template', 'subject', 'variables', 'status', 'version', 'updatedAt', 'actions'
];

const STATUS_OPTIONS: Array<{ label: string; value: EmailTemplateStatus | null }> = [
  { label: 'All',      value: null        },
  { label: 'Active',   value: 'ACTIVE'    },
  { label: 'Inactive', value: 'INACTIVE'  },
];

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusChipComponent,
    MatSlideToggleModule
  ],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent implements OnInit, OnDestroy {

  private readonly templateService = inject(AdminEmailTemplateService);
  private readonly toastr          = inject(ToastService);
  private readonly dialog          = inject(MatDialog);
  private readonly destroy$        = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns  = DISPLAYED_COLUMNS;
  readonly statusOptions     = STATUS_OPTIONS;
  readonly pageSizeOptions   = ADMIN_TEMPLATES_PAGE_SIZE_OPTIONS;

  // ── Table state ────────────────────────────────────────────────────────
  templates    = signal<EmailTemplate[]>([]);
  totalElements = signal<number>(0);
  isLoading    = signal<boolean>(false);

  pageIndex = 0;
  pageSize  = ADMIN_TEMPLATES_DEFAULT_PAGE_SIZE;

  // ── Filter state ───────────────────────────────────────────────────────
  searchControl = new FormControl<string>('');
  statusFilter  = signal<EmailTemplateStatus | null>(null);

  // ── Action loading per-row ─────────────────────────────────────────────
  togglingIds = signal<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  formatVariableName(key: string): string {
    if (!key) return '';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  getDisplayVariables(variables?: any[]): any[] {
    if (!variables) return [];
    return variables.filter(v => v.key !== 'advancedVariables');
  }

  getVariableTooltip(v: any): string {
    return `Key: ${v.key}\nSource: ${v.source}\nRequired: ${v.required ? 'Yes' : 'No'}`;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  ngOnInit(): void {
    // Debounce search to avoid excessive API calls
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.resetPaginator();
      this.loadTemplates();
    });

    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  loadTemplates(): void {
    this.isLoading.set(true);

    this.templateService
      .getTemplates(
        this.pageIndex,
        this.pageSize,
        this.searchControl.value?.trim() || null,
        this.statusFilter(),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (page) => {
          this.templates.set(page.content);
          this.totalElements.set(page.totalElements);
        },
        error: () => {
          this.toastr.error('Failed to load email templates.');
          this.templates.set([]);
          this.totalElements.set(0);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadTemplates();
  }

  private resetPaginator(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  onStatusFilterChange(value: EmailTemplateStatus | null): void {
    this.statusFilter.set(value);
    this.resetPaginator();
    this.loadTemplates();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchControl.value?.trim()) || !!this.statusFilter();
  }

  // ---------------------------------------------------------------------------
  // CRUD Dialogs
  // ---------------------------------------------------------------------------

  openCreateDialog(): void {
    const data: TemplateModalData = { mode: 'create' };
    this.dialog
      .open(TemplateModalComponent, {
        ...DIALOG_CONFIG['LARGE_DIALOG'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: TemplateModalResult | undefined) => {
        if (result?.action === 'create') {
          this.resetPaginator();
          this.loadTemplates();
        }
      });
  }

  openViewDialog(template: EmailTemplate): void {
    const data: TemplateModalData = { mode: 'view', template };
    this.dialog.open(TemplateModalComponent, {
      ...DIALOG_CONFIG['LARGE_DIALOG'],
      autoFocus: false,
      data,
    });
  }

  openEditDialog(template: EmailTemplate): void {
    const data: TemplateModalData = { mode: 'edit', template };
    this.dialog
      .open(TemplateModalComponent, {
        ...DIALOG_CONFIG['LARGE_DIALOG'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: TemplateModalResult | undefined) => {
        if (result?.action === 'edit') {
          this.loadTemplates();
        }
      });
  }

  openDeleteDialog(template: EmailTemplate): void {
    const data: TemplateModalData = { mode: 'delete', template };
    this.dialog
      .open(TemplateModalComponent, {
        ...DIALOG_CONFIG['DELETE'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: TemplateModalResult | undefined) => {
        if (result?.action === 'delete') {
          // If we deleted the last item on this page, go back one page
          if (this.templates().length === 1 && this.pageIndex > 0) {
            this.pageIndex--;
          }
          this.loadTemplates();
        }
      });
  }

  // ---------------------------------------------------------------------------
  // Status toggle
  // ---------------------------------------------------------------------------

  /**
   * Called by mat-slide-toggle (change) event.
   * Derives the new status from the current template.status (opposite).
   * On API failure the in-place update is reverted so the toggle snaps back.
   */
  toggleStatus(template: EmailTemplate): void {
    if (this.togglingIds().has(template.id)) return;

    const newStatus: EmailTemplateStatus = template.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const ids = new Set(this.togglingIds());
    ids.add(template.id);
    this.togglingIds.set(ids);

    this.templateService
      .updateTemplateStatus(template.id, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          const updated = new Set(this.togglingIds());
          updated.delete(template.id);
          this.togglingIds.set(updated);
        }),
      )
      .subscribe({
        next: (updated) => {
          const msg = newStatus === 'ACTIVE'
            ? 'Email template activated successfully.'
            : 'Email template deactivated successfully.';
          this.toastr.success(msg);
          // Update in-place without a full reload
          this.templates.set(
            this.templates().map(t => t.id === updated.id ? updated : t)
          );
        },
        error: (err) => {
          // Revert the optimistic toggle by re-mapping to the original status
          this.templates.set(
            this.templates().map(t => t.id === template.id ? { ...t, status: template.status } : t)
          );
          const msg = err?.error?.message ?? 'Failed to update template status.';
          this.toastr.error(msg);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Display helpers
  // ---------------------------------------------------------------------------

  statusVariant(status: EmailTemplateStatus): StatusVariant {
    return status === 'ACTIVE' ? 'success' : 'info';
  }

  statusLabel(status: EmailTemplateStatus): string {
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  }

  isToggling(id: string): boolean {
    return this.togglingIds().has(id);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }
}
