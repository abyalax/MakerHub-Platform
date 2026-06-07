import { defineStore } from 'pinia';
import type { Payment } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetPayments() for fetching payment history
// - useGetPaymentById() for fetching single payment
// - useCreateCheckout() for creating checkout
// TanStack Query handles caching, loading states, and error handling automatically.

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>([]);
  const currentPayment = ref<Payment | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setPayments(data: Payment[]) {
    payments.value = data;
  }

  function setCurrentPayment(data: Payment | null) {
    currentPayment.value = data;
  }

  async function fetchHistory(_params: { page: number; limit: number }) {
    // TODO: Implement using useGetPayments() composable
    console.warn('fetchHistory is deprecated, use useGetPayments() composable instead');
  }

  async function createCheckout(_data: { projectId: number }): Promise<{ checkoutUrl: string }> {
    // TODO: Implement using useCreateCheckout() composable
    console.warn('createCheckout is deprecated, use useCreateCheckout() composable instead');
    return { checkoutUrl: '' };
  }

  return {
    payments,
    currentPayment,
    loading,
    error,
    setPayments,
    setCurrentPayment,
    fetchHistory,
    createCheckout,
  };
});
