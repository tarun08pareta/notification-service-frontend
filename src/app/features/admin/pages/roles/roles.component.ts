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
import { toSignal } from '@angular/core/rxjs-interop';
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
import { LoaderFacade } from '../../../../core/common/store/loader/loader.facade';

import { AdminRoleService, ADMIN_ROLES_DEFAULT_PAGE_SIZE, ADMIN_ROLES_PAGE_SIZE_OPTIONS } from '../../../../core/admin/services/admin-role.service';
import { ToastService }          from '../../../../core/common/toast/toast.service';
import { AdminRole, AdminRoleStatus } from '../../../../core/admin/services/admin-role.models';
import { RoleModalComponent, RoleModalData, RoleModalResult } from './role-modal/role-modal.component';
import { DIALOG_CONFIG } from '../../../../shared/components/dialog-config';


const DISPLAYED_COLUMNS: string[] = [
  'name', 'status', 'createdAt', 'updatedAt', 'actions'
];

const STATUS_OPTIONS: Array<{ label: string; value: AdminRoleStatus | null }> = [
  { label: 'All',      value: null        },
  { label: 'Active',   value: 'ACTIVE'    },
  { label: 'Inactive', value: 'INACTIVE'  },
];

@Component({
  selector: 'app-roles',
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
    MatSlideToggleModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {

  private readonly roleService = inject(AdminRoleService);
  private readonly toastr      = inject(ToastService);
  private readonly dialog      = inject(MatDialog);
  private readonly destroy$    = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns  = DISPLAYED_COLUMNS;
  readonly statusOptions     = STATUS_OPTIONS;
  readonly pageSizeOptions   = ADMIN_ROLES_PAGE_SIZE_OPTIONS;

  roles         = signal<AdminRole[]>([]);
  totalElements = signal<number>(0);
  
  private readonly loaderFacade = inject(LoaderFacade);
  isLoading = toSignal(this.loaderFacade.isLoading$, { initialValue: false });

  pageIndex = 0;
  pageSize  = ADMIN_ROLES_DEFAULT_PAGE_SIZE;

  searchControl = new FormControl<string>('');
  statusFilter  = signal<AdminRoleStatus | null>(null);

  togglingIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.resetPaginator();
      this.loadRoles();
    });

    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {

    this.roleService
      .getRoles(
        this.pageIndex,
        this.pageSize,
        this.searchControl.value?.trim() || null,
        this.statusFilter(),
      )
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (page) => {
          this.roles.set(page.content);
          this.totalElements.set(page.totalElements);
        },
        error: () => {
          this.toastr.error('Failed to load roles.');
          this.roles.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadRoles();
  }

  private resetPaginator(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  onStatusFilterChange(value: AdminRoleStatus | null): void {
    this.statusFilter.set(value);
    this.resetPaginator();
    this.loadRoles();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchControl.value?.trim()) || !!this.statusFilter();
  }

  openCreateDialog(): void {
    const data: RoleModalData = { mode: 'create' };
    this.dialog
      .open(RoleModalComponent, {
        ...DIALOG_CONFIG['SMALL'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: RoleModalResult | undefined) => {
        if (result?.action === 'create') {
          this.resetPaginator();
          this.loadRoles();
        }
      });
  }

  openViewDialog(role: AdminRole): void {
    const data: RoleModalData = { mode: 'view', role };
    this.dialog.open(RoleModalComponent, {
      ...DIALOG_CONFIG['SMALL'],
      autoFocus: false,
      data,
    });
  }

  openEditDialog(role: AdminRole): void {
    const data: RoleModalData = { mode: 'edit', role };
    this.dialog
      .open(RoleModalComponent, {
        ...DIALOG_CONFIG['SMALL'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: RoleModalResult | undefined) => {
        if (result?.action === 'edit') {
          this.loadRoles();
        }
      });
  }

  openDeleteDialog(role: AdminRole): void {
    const data: RoleModalData = { mode: 'delete', role };
    this.dialog
      .open(RoleModalComponent, {
        ...DIALOG_CONFIG['DELETE'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: RoleModalResult | undefined) => {
        if (result?.action === 'delete') {
          if (this.roles().length === 1 && this.pageIndex > 0) {
            this.pageIndex--;
          }
          this.loadRoles();
        }
      });
  }

  toggleStatus(role: AdminRole): void {
    if (this.togglingIds().has(role.id)) return;

    const newStatus: AdminRoleStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const ids = new Set(this.togglingIds());
    ids.add(role.id);
    this.togglingIds.set(ids);

    this.roleService
      .updateRoleStatus(role.id, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          const updated = new Set(this.togglingIds());
          updated.delete(role.id);
          this.togglingIds.set(updated);
        }),
      )
      .subscribe({
        next: (updated) => {
          const msg = newStatus === 'ACTIVE'
            ? 'Role activated successfully.'
            : 'Role deactivated successfully.';
          this.toastr.success(msg);
          this.roles.set(
            this.roles().map(r => r.id === updated.id ? updated : r)
          );
        },
        error: (err: any) => {
          this.roles.set(
            this.roles().map(r => r.id === role.id ? { ...r, status: role.status } : r)
          );
          const msg = err?.error?.message ?? 'Failed to update role status.';
          this.toastr.error(msg);
        },
      });
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
