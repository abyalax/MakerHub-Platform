import { defineStore } from 'pinia';
import type { RevenueOverview, SalesAnalytics, Transaction } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetRevenueOverview() for fetching revenue overview
// - useGetSalesAnalytics() for fetching sales analytics
// - useGetTransactions() for fetching transactions
// TanStack Query handles caching, loading states, and error handling automatically.

export const useRevenueStore = defineStore('revenue', () => {
  const overview = ref<RevenueOverview | null>(null);
  const analytics = ref<SalesAnalytics[]>([]);
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setOverview(data: RevenueOverview | null) {
    overview.value = data;
  }

  function setAnalytics(data: SalesAnalytics[]) {
    analytics.value = data;
  }

  function setTransactions(data: Transaction[]) {
    transactions.value = data;
  }

  async function fetchOverview() {
    // TODO: Implement using useGetRevenueOverview() composable
    console.warn('fetchOverview is deprecated, use useGetRevenueOverview() composable instead');
  }

  async function fetchAnalytics() {
    // TODO: Implement using useGetSalesAnalytics() composable
    console.warn('fetchAnalytics is deprecated, use useGetSalesAnalytics() composable instead');
  }

  async function fetchTransactions(_params: { page: number; limit: number }) {
    // TODO: Implement using useGetTransactions() composable
    console.warn('fetchTransactions is deprecated, use useGetTransactions() composable instead');
  }

  return {
    overview,
    analytics,
    transactions,
    loading,
    error,
    setOverview,
    setAnalytics,
    setTransactions,
    fetchOverview,
    fetchAnalytics,
    fetchTransactions,
  };
});
