export const PAGES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  ORDERS: '/orders',
} as const;

export const PUBLIC_PAGES = {
  EVENTS: '/public-events',
  EVENTS_DETAIL: '/public-events/',
} as const;

export const LIST_PUBLIC_PAGES = [...Object.values(PUBLIC_PAGES), PAGES.LOGIN, PAGES.REGISTER] as const;

export const AUTH_ENDPOINTS = new Set([
  PAGES.LOGIN,
  PAGES.REGISTER,
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify',
  'refresh',
  ...Object.values(PUBLIC_PAGES),
]);

export type Pages = (typeof PAGES)[keyof typeof PAGES];
export type PublicPages = (typeof PUBLIC_PAGES)[keyof typeof PUBLIC_PAGES];
