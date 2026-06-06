export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Restore auth from localStorage on app init
  if (import.meta.client) {
    authStore.hydrateFromStorage();
  }
});
