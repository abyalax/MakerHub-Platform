import { defineStore } from 'pinia';
import type { UserMetrics, ContentMetrics, TrafficMetrics, FinancialMetrics } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetUserMetrics() for fetching user metrics
// - useGetContentMetrics() for fetching content metrics
// - useGetTrafficMetrics() for fetching traffic metrics
// - useGetFinancialMetrics() for fetching financial metrics
// TanStack Query handles caching, loading states, and error handling automatically.

export const useAnalyticsStore = defineStore('analytics', () => {
  const userMetrics = ref<UserMetrics | null>(null);
  const contentMetrics = ref<ContentMetrics | null>(null);
  const trafficMetrics = ref<TrafficMetrics | null>(null);
  const financialMetrics = ref<FinancialMetrics | null>(null);

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setUserMetrics(data: UserMetrics | null) {
    userMetrics.value = data;
  }

  function setContentMetrics(data: ContentMetrics | null) {
    contentMetrics.value = data;
  }

  function setTrafficMetrics(data: TrafficMetrics | null) {
    trafficMetrics.value = data;
  }

  function setFinancialMetrics(data: FinancialMetrics | null) {
    financialMetrics.value = data;
  }

  return {
    userMetrics,
    contentMetrics,
    trafficMetrics,
    financialMetrics,
    setUserMetrics,
    setContentMetrics,
    setTrafficMetrics,
    setFinancialMetrics,
  };
});
