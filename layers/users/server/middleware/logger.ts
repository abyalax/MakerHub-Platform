/**
 * Server Middleware - Example Logger
 *
 * Server middleware runs on EVERY server request.
 * Unlike app/middleware which runs on page navigations.
 *
 * Use cases:
 * - Request logging
 * - API Authentication
 * - Rate limiting
 * - Custom CORS
 */
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/users')) {
    return;
  }

  const method = event.method;
  const path = event.path;
  const timestamp = new Date().toISOString();

  console.info(`[${timestamp}] ${method} ${path}`);

  event.context.requestedAt = timestamp;
});
