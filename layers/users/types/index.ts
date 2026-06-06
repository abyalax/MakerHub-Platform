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

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  roles: Role[];
  permissions: Permission[];
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
