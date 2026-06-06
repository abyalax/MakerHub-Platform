export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  key: string;
  name: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleIds?: number[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roleIds?: number[];
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
}

export interface CreateRolePayload {
  name: string;
  permissionIds?: number[];
}

export interface UpdateRolePayload {
  name?: string;
  permissionIds?: number[];
}

export interface CreatePermissionPayload {
  key: string;
  name: string;
}

export interface UpdatePermissionPayload {
  key?: string;
  name?: string;
}
