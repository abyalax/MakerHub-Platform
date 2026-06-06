import { getCurrentUser, setAuthCookies } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event, 'refresh');
  await setAuthCookies(event, user);

  return {
    message: 'Refresh token successfully',
    data: user,
  };
});
