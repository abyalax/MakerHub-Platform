export const PAGES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  ORDERS: '/orders',
} as const;

export const PUBLIC_PAGES = {
  HOME: '/',
  PROJECTS: '/public/projects',
  PROJECTS_DETAIL: '/public/projects/',
  MENTORS: '/public/mentors',
  MENTORS_DETAIL: '/public/mentors/',
} as const;

export const LIST_PUBLIC_PAGES = [...Object.values(PUBLIC_PAGES), PAGES.LOGIN, PAGES.REGISTER] as const;

export const PUBLIC_PAGE_PREFIXES = ['/public/'] as const;

export const isPublicPage = (path: string) => {
  const normalizedPath = path.replace(/\/+$/, '') || '/';

  return LIST_PUBLIC_PAGES.some((page) => {
    const normalizedPage = page.replace(/\/+$/, '') || '/';
    return normalizedPath === normalizedPage;
  }) || PUBLIC_PAGE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix));
};

export const AUTH_ENDPOINTS = new Set([
  PAGES.LOGIN,
  PAGES.REGISTER,
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify',
  '/projects/public',
  '/projects/public/',
  'refresh',
]);

export type Pages = (typeof PAGES)[keyof typeof PAGES];
export type PublicPages = (typeof PUBLIC_PAGES)[keyof typeof PUBLIC_PAGES];
