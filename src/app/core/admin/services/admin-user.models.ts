export type AdminUserStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  status: AdminUserStatus;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPageResponse {
  content: AdminUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password?: string;
  roleIds: string[];
}

export interface UpdateAdminUserRequest {
  name: string;
  email: string;
  roleIds: string[];
}

export interface UpdateAdminUserStatusRequest {
  status: AdminUserStatus;
}
