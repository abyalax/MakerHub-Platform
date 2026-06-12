import authorizationMiddleware from './authorization';

export default defineNuxtRouteMiddleware((to, from) => {
  return authorizationMiddleware(to, from);
});
