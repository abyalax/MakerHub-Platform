export const ENDPOINT = Object.freeze({
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',

  USERS: '/users',
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
  EVENTS: '/events',
  EVENTS_PUBLISH: '/events/publish',
  EVENTS_PUBLIC: '/events/public',
  EVENTS_PUBLIC_DETAIL: '/events/public',

  ORDERS: '/orders',
  BUY_TICKET: '/orders/buy-ticket',
  USER_ORDERS: '/orders/user/my-orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_STATUS: (id: string) => `/orders/${id}/status`,
  ORDER_TICKETS: (id: string) => `/orders/${id}/tickets`,
  ORDER_PAYMENT_QRIS: (id: string) => `/orders/${id}/payment-qris`,

  CHECK_IN: '/check-in',
  CHECK_IN_PDF: '/check-in/pdf-upload',

  ATTACHMENTS: '/attachments',
  ATTACHMENT_PRESIGN_UPLOAD: '/attachments/presign-upload',
  ATTACHMENT_CONFIRM: '/attachments/confirm',
  ATTACHMENT_DOWNLOAD: (id: number) => `/attachments/${id}/download`,
  ATTACHMENT_DELETE: (id: number) => `/attachments/${id}`,

  DASHBOARD: {
    TOTAL_SALES: '/dashboard/total-sales',
    TOP_EVENTS: '/dashboard/top-events',
    TOP_CATEGORIES: '/dashboard/top-categories',
  },
});
