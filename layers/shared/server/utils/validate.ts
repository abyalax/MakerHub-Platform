import { createError } from 'h3';
import type z from 'zod';

export function validate<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: result.error.issues.map((e) => ({
        path: e.path,
        message: e.message,
      })),
    });
  }

  return result.data;
}
