import type { TResponse } from '~/layers/shared/app/types/response';
import type { User } from '~/layers/users/app/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginResponse = TResponse<User>;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
