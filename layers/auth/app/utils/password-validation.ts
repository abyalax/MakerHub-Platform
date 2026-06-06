import * as z from 'zod';

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a symbol');
