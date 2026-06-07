import { createError } from 'h3';
import { getCurrentUser, setAuthCookies } from '~/layers/auth/server/utils/auth';

const canRecoverSession = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message?: unknown }).message) : '';
  return message === 'Token Not Found' || message === 'Token Expired';
};

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event);

    return {
      message: 'Authenticated',
      data: user,
    };
  } catch (error) {
    if (!canRecoverSession(error)) {
      throw error;
    }

    try {
      const user = await getCurrentUser(event, 'refresh');
      await setAuthCookies(event, user);

      return {
        message: 'Authenticated',
        data: user,
      };
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Token Not Found',
      });
    }
  }
});
