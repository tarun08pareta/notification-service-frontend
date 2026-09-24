import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';

import { MatTableModule }           from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule }            from '@angular/material/icon';
import { MatButtonModule }          from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { PageHeaderComponent }  from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent }  from '../../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent, StatusVariant } from '../../../../shared/ui/status-chip/status-chip.component';


import { EmailTemplateService, USER_TEMPLATES_DEFAULT_PAGE_SIZE, USER_TEMPLATES_PAGE_SIZE_OPTIONS } from '../../../../core/common/email-template/email-template.service';
import { ToastService }         from '../../../../core/common/toast/toast.service';
import { EmailTemplate, EmailTemplateStatus } from '../../../../core/admin/services/admin-email-template.models';

const DISPLAYED_COLUMNS: string[] = ['template', 'subject', 'status', 'version', 'updatedAt', 'actions'];

@Component({
  selector: 'app-user-templates',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusChipComponent,
  ],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class UserTemplatesComponent implements OnInit, OnDestroy {
  private readonly templateService = inject(EmailTemplateService);
  private readonly toastr          = inject(ToastService);
  private readonly dialog          = inject(MatDialog);
  private readonly destroy$        = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('viewDialog') viewDialog!: TemplateRef<unknown>;

  readonly displayedColumns = DISPLAYED_COLUMNS;
  readonly pageSizeOptions  = USER_TEMPLATES_PAGE_SIZE_OPTIONS;

  templates     = signal<EmailTemplate[]>([]);
  totalElements = signal<number>(0);
  isLoading     = signal<boolean>(false);

  pageIndex = 0;
  pageSize  = USER_TEMPLATES_DEFAULT_PAGE_SIZE;

  selectedTemplate = signal<EmailTemplate | null>(null);
  private dialogRef: MatDialogRef<unknown> | null = null;

  ngOnInit(): void {
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplates(): void {
    this.isLoading.set(true);

    this.templateService
      .getTemplates(this.pageIndex, this.pageSize)
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

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadTemplates();
  }

  openView(template: EmailTemplate): void {
    this.selectedTemplate.set(template);
    this.dialogRef = this.dialog.open(this.viewDialog, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'template-dialog-panel',
      autoFocus: false,
    });
  }

  closeView(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }
  statusVariant(status: EmailTemplateStatus): StatusVariant {
    return status === 'ACTIVE' ? 'success' : 'info';
  }

  statusLabel(status: EmailTemplateStatus): string {
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  }
}
