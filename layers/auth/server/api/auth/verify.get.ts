import { getCurrentUser } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event);

  return {
    message: 'Authenticated',
    data: user,
  };
});
