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

  ADMIN_LIST_PROJECTS: '/admin/projects',
  ADMIN_LIST_MENTORS: '/admin/mentors',
  ADMIN_MODERATE_PROJECT: (id: number) => `/admin/projects/${id}/moderate`,
  ADMIN_MENTOR_STATUS: (id: number) => `/admin/mentors/${id}/status`,

  MENTOR_PROJECTS: '/mentor/projects',
  MENTOR_PROJECT_DETAIL: (id: number) => `/mentor/projects/${id}`,
  MENTOR_PROJECT_PUBLISH: (id: number) => `/mentor/projects/${id}/publish`,
  MENTOR_PROJECT_ARCHIVE: (id: number) => `/mentor/projects/${id}/archive`,
  MENTOR_PROJECT_SECTIONS: (id: number) => `/mentor/projects/${id}/sections`,
  MENTOR_PROJECT_SECTION_DETAIL: (id: number, sectionId: number) => `/mentor/projects/${id}/sections/${sectionId}`,
  MENTOR_PROJECT_SECTION_LESSONS: (id: number, sectionId: number) => `/mentor/projects/${id}/sections/${sectionId}/lessons`,
  MENTOR_PROJECT_SECTION_LESSON_DETAIL: (id: number, sectionId: number, lessonId: number) =>
    `/mentor/projects/${id}/sections/${sectionId}/lessons/${lessonId}`,

  CATEGORIES: '/categories',
  PROJECTS: '/projects',
  PROJECTS_FEATURED: '/projects/featured',
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}`,
  MENTOR_DETAIL: (id: string) => `/mentors/${id}`,

  MEDIA: '/media',
  MEDIA_PRESIGN_UPLOAD: '/media/presign-upload',
  MEDIA_CONFIRM: '/media/confirm',
  MEDIA_DOWNLOAD: (id: number) => `/media/${id}/download`,
  MEDIA_DELETE: (id: number) => `/media/${id}`,

  PAYMENTS: '/payments',
  PAYMENTS_CHECKOUT: '/payments/checkout',
  PAYMENT_DETAIL: (id: number) => `/payments/${id}`,

  ENROLLMENTS: '/enrollments',
  LEARNING: '/learning',
  LEARNING_CONTINUE: '/learning/continue',

  LESSON_PROGRESS: (lessonId: number) => `/lessons/${lessonId}/progress`,
  PROJECT_PROGRESS: (projectId: number) => `/progress/project/${projectId}`,

  BOOKMARKS: '/bookmarks',
  BOOKMARK_DETAIL: (id: number) => `/bookmarks/${id}`,
  BOOKMARK_FAVORITE: (id: number) => `/bookmarks/${id}/favorite`,

  SUBSCRIPTION_PLANS: '/subscription-plans',
  SUBSCRIPTION_PLANS_ADMIN: '/subscription-plans/admin',
  SUBSCRIPTION_PLAN_DETAIL: (id: number) => `/subscription-plans/${id}`,
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTIONS_ADMIN: '/subscriptions/admin',
  SUBSCRIPTION_CHECKOUT: '/subscriptions/checkout',
  SUBSCRIPTION_CANCEL: (id: number) => `/subscriptions/${id}/cancel`,

  REVENUE: '/revenue',
  REVENUE_OVERVIEW: '/revenue/overview',
  REVENUE_ANALYTICS: '/revenue/analytics',
  REVENUE_TRANSACTIONS: '/revenue/transactions',

  ANALYTICS: '/analytics',
  ANALYTICS_USERS: '/analytics/users',
  ANALYTICS_CONTENT: '/analytics/content',
  ANALYTICS_TRAFFIC: '/analytics/traffic',
  ANALYTICS_FINANCIAL: '/analytics/financial',

  DASHBOARD: {
    TOTAL_SALES: '/dashboard/total-sales',
    TOP_EVENTS: '/dashboard/top-events',
    TOP_CATEGORIES: '/dashboard/top-categories',
  },
});
