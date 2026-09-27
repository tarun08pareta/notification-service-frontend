import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
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

import { AdminUserService, ADMIN_USERS_DEFAULT_PAGE_SIZE, ADMIN_USERS_PAGE_SIZE_OPTIONS } from '../../../../core/admin/services/admin-user.service';
import { AdminRoleService } from '../../../../core/admin/services/admin-role.service';
import { ToastService }          from '../../../../core/common/toast/toast.service';
import { AdminUser, AdminUserStatus } from '../../../../core/admin/services/admin-user.models';
import { AdminRole } from '../../../../core/admin/services/admin-role.models';
import { UserModalComponent, UserModalData, UserModalResult } from './user-modal/user-modal.component';
import { DIALOG_CONFIG } from '../../../../shared/components/dialog-config';

const DISPLAYED_COLUMNS: string[] = [
  'name', 'email', 'authProvider', 'roles', 'status', 'createdAt', 'actions'
];

const STATUS_OPTIONS: Array<{ label: string; value: AdminUserStatus | null }> = [
  { label: 'All',      value: null        },
  { label: 'Active',   value: 'ACTIVE'    },
  { label: 'Inactive', value: 'INACTIVE'  },
];

@Component({
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {

  private readonly userService = inject(AdminUserService);
  private readonly roleService = inject(AdminRoleService);
  private readonly toastr      = inject(ToastService);
  private readonly dialog      = inject(MatDialog);
  private readonly destroy$    = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns  = DISPLAYED_COLUMNS;
  readonly statusOptions     = STATUS_OPTIONS;
  readonly pageSizeOptions   = ADMIN_USERS_PAGE_SIZE_OPTIONS;

  users         = signal<AdminUser[]>([]);
  totalElements = signal<number>(0);
  
  private readonly loaderFacade = inject(LoaderFacade);
  isLoading = toSignal(this.loaderFacade.isLoading$, { initialValue: false });
  
  // Available roles for filter and forms
  activeRoles   = signal<AdminRole[]>([]);

  pageIndex = 0;
  pageSize  = ADMIN_USERS_DEFAULT_PAGE_SIZE;

  searchControl = new FormControl<string>('');
  statusFilter  = signal<AdminUserStatus | null>(null);
  roleFilter    = signal<string | null>(null);

  togglingIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.resetPaginator();
      this.loadUsers();
    });

    this.loadRoles();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    // Load all active roles for the filter dropdown and creation form
    // Note: Assuming a large page size to fetch all active roles.
    this.roleService.getRoles(0, 100, null, 'ACTIVE')
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of({ content: [] }))
      )
      .subscribe((res: any) => {
        this.activeRoles.set(res.content);
      });
  }

  loadUsers(): void {

    this.userService
      .getUsers(
        this.pageIndex,
        this.pageSize,
        this.searchControl.value?.trim() || null,
        this.statusFilter(),
        this.roleFilter(),
      )
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (page) => {
          this.users.set(page.content);
          this.totalElements.set(page.totalElements);
        },
        error: () => {
          this.toastr.error('Failed to load users.');
          this.users.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadUsers();
  }

  private resetPaginator(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  onStatusFilterChange(value: AdminUserStatus | null): void {
    this.statusFilter.set(value);
    this.resetPaginator();
    this.loadUsers();
  }

  onRoleFilterChange(value: string | null): void {
    this.roleFilter.set(value);
    this.resetPaginator();
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchControl.value?.trim()) || !!this.statusFilter() || !!this.roleFilter();
  }

  openCreateDialog(): void {
    const data: UserModalData = { mode: 'create', roles: this.activeRoles() };
    this.dialog
      .open(UserModalComponent, {
        ...DIALOG_CONFIG['LARGE_DIALOG'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: UserModalResult | undefined) => {
        if (result?.action === 'create') {
          this.resetPaginator();
          this.loadUsers();
        }
      });
  }

  openViewDialog(user: AdminUser): void {
    const data: UserModalData = { mode: 'view', user, roles: [] };
    this.dialog.open(UserModalComponent, {
      ...DIALOG_CONFIG['LARGE_DIALOG'],
      autoFocus: false,
      data,
    });
  }

  openEditDialog(user: AdminUser): void {
    const data: UserModalData = { mode: 'edit', user, roles: this.activeRoles() };
    this.dialog
      .open(UserModalComponent, {
        ...DIALOG_CONFIG['LARGE_DIALOG'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: UserModalResult | undefined) => {
        if (result?.action === 'edit') {
          this.loadUsers();
        }
      });
  }

  openDeleteDialog(user: AdminUser): void {
    const data: UserModalData = { mode: 'delete', user, roles: [] };
    this.dialog
      .open(UserModalComponent, {
        ...DIALOG_CONFIG['DELETE'],
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result: UserModalResult | undefined) => {
        if (result?.action === 'delete') {
          if (this.users().length === 1 && this.pageIndex > 0) {
            this.pageIndex--;
          }
          this.loadUsers();
        }
      });
  }

  toggleStatus(user: AdminUser): void {
    if (this.togglingIds().has(user.id)) return;

    const newStatus: AdminUserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const ids = new Set(this.togglingIds());
    ids.add(user.id);
    this.togglingIds.set(ids);

    this.userService
      .updateUserStatus(user.id, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          const updated = new Set(this.togglingIds());
          updated.delete(user.id);
          this.togglingIds.set(updated);
        }),
      )
      .subscribe({
        next: (updated) => {
          const msg = newStatus === 'ACTIVE'
            ? 'User activated successfully.'
            : 'User deactivated successfully.';
          this.toastr.success(msg);
          this.users.set(
            this.users().map(u => u.id === updated.id ? updated : u)
          );
        },
        error: (err: any) => {
          this.users.set(
            this.users().map(u => u.id === user.id ? { ...u, status: user.status } : u)
          );
          const msg = err?.error?.message ?? 'Failed to update user status.';
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
