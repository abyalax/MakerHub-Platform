import type { User } from '~/layers/users/app/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user?: User;
  isAuthenticated: boolean;
  error?: string;
}

export interface Response<T> {
  message: string;
  data: T;
}
