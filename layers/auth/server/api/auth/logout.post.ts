import { clearAuthCookies } from '~/layers/auth/server/utils/auth';

export default defineEventHandler((event) => {
  clearAuthCookies(event);

  return {
    message: 'Logout successfully',
    data: null,
  };
});
