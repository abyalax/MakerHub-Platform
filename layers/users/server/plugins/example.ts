/**
 * Server Plugin - Runs on server initialization
 *
 * Use for:
 * - Initializing database connections
 * - Configuring external service clients
 * - Registering server hooks
 */
export default defineNitroPlugin((nitroApp) => {
  // Hook: when the server starts
  nitroApp.hooks.hook('request', (_event) => {
    // Executed on every request
    // Useful for global metrics
  });

  // Hook: before sending response
  nitroApp.hooks.hook('beforeResponse', (_event, _response) => {
    // Modify response before sending
    // Useful for adding global headers
  });

  // Hook: when an error occurs
  nitroApp.hooks.hook('error', (error, { event: _event }) => {
    // Centralized error logging
    console.error('[Server Error]', error.message);
  });

  // Example: initialize database client
  // const db = new PrismaClient()
  // nitroApp.hooks.hook('close', async () => {
  //   await db.$disconnect()
  // })

  console.info('[Example Plugin] Server initialized');
});
