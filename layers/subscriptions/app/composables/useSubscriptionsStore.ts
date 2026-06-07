import { defineStore } from 'pinia';
import type { SubscriptionPlan, Subscription } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetPlans() for fetching plans
// - useGetPlansAdmin() for fetching admin plans
// - useCreatePlan() for creating plans
// - useUpdatePlan() for updating plans
// - useDeletePlan() for deleting plans
// - useGetMySubscription() for fetching user subscription
// - useGetAllSubscriptions() for fetching all subscriptions
// - useSubscribe() for subscribing to plans
// - useCancelSubscription() for canceling subscriptions
// TanStack Query handles caching, loading states, and error handling automatically.

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const plans = ref<SubscriptionPlan[]>([]);
  const currentSubscription = ref<Subscription | null>(null);
  const subscriptions = ref<Subscription[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setPlans(data: SubscriptionPlan[]) {
    plans.value = data;
  }

  function setCurrentSubscription(data: Subscription | null) {
    currentSubscription.value = data;
  }

  function setSubscriptions(data: Subscription[]) {
    subscriptions.value = data;
  }

  async function fetchPlans() {
    // TODO: Implement using useGetPlans() composable
    console.warn('fetchPlans is deprecated, use useGetPlans() composable instead');
  }

  async function fetchMySubscription() {
    // TODO: Implement using useGetMySubscription() composable
    console.warn('fetchMySubscription is deprecated, use useGetMySubscription() composable instead');
  }

  async function subscribe(_planId: number) {
    // TODO: Implement using useSubscribe() composable
    console.warn('subscribe is deprecated, use useSubscribe() composable instead');
  }

  async function cancelSubscription(_subscriptionId: number) {
    // TODO: Implement using useCancelSubscription() composable
    console.warn('cancelSubscription is deprecated, use useCancelSubscription() composable instead');
  }

  async function deletePlan(_planId: number) {
    // TODO: Implement using useDeletePlan() composable
    console.warn('deletePlan is deprecated, use useDeletePlan() composable instead');
  }

  async function fetchPlansAdmin() {
    // TODO: Implement using useGetPlansAdmin() composable
    console.warn('fetchPlansAdmin is deprecated, use useGetPlansAdmin() composable instead');
  }

  return {
    plans,
    currentSubscription,
    subscriptions,
    loading,
    error,
    setPlans,
    setCurrentSubscription,
    setSubscriptions,
    fetchPlans,
    fetchPlansAdmin,
    fetchMySubscription,
    subscribe,
    cancelSubscription,
    deletePlan,
  };
});
