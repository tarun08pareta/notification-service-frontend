export type AdminRoleStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminRole {
  id: string;
  name: string;
  status: AdminRoleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRolePageResponse {
  content: AdminRole[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateAdminRoleRequest {
  name: string;
}

export interface UpdateAdminRoleRequest {
  name: string;
}

export interface UpdateAdminRoleStatusRequest {
  status: AdminRoleStatus;
}
