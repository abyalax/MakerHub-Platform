<script setup lang="ts">
const subscriptionsStore = useSubscriptionsStore();
const { plans, loading, error } = storeToRefs(subscriptionsStore);

onMounted(() => {
  subscriptionsStore.fetchPlans();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Subscription Plans</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <div v-else-if="error" class="text-red-600 mb-4">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SubscriptionPlanCard v-for="plan in plans" :key="plan.id" :plan="plan" @subscribe="subscriptionsStore.subscribe" />
    </div>

    <div v-if="!loading && plans.length === 0" class="text-center py-8 text-gray-500">No subscription plans available at the moment.</div>
  </div>
</template>
