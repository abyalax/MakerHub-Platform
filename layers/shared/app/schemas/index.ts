import { z } from 'zod';

export const requiredString = (message: string) => z.string({ required_error: message }).trim().min(1, message);
