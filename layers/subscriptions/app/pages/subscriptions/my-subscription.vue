<script setup lang="ts">
const subscriptionsStore = useSubscriptionsStore();
const { currentSubscription, loading, error } = storeToRefs(subscriptionsStore);

onMounted(() => {
  subscriptionsStore.fetchMySubscription();
});

const formatDate = (date: string | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'CANCELED':
      return 'bg-red-100 text-red-800';
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-800';
    case 'PAST_DUE':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const handleCancel = async () => {
  if (!currentSubscription.value) return;

  if (confirm('Are you sure you want to cancel your subscription? Your access will remain active until the end of the current billing period.')) {
    try {
      await subscriptionsStore.cancelSubscription(currentSubscription.value.id);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    }
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Subscription</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <div v-else-if="error" class="text-red-600 mb-4">
      {{ error }}
    </div>

    <div v-else-if="currentSubscription" class="bg-white border rounded-lg p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-semibold mb-2">
            {{ currentSubscription.plan?.name }}
          </h2>
          <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusColor(currentSubscription.status)]">
            {{ currentSubscription.status }}
          </span>
        </div>
        <div class="text-right">
          <p class="text-3xl font-bold">{{ currentSubscription.plan?.currency }} {{ currentSubscription.plan?.price }}</p>
          <p class="text-gray-500">
            {{ currentSubscription.plan?.billingInterval === 'MONTHLY' ? '/month' : '/year' }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-500 mb-1">Subscription Start</p>
          <p class="font-semibold">{{ formatDate(currentSubscription.currentPeriodStart) }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-500 mb-1">Next Billing Date</p>
          <p class="font-semibold">{{ formatDate(currentSubscription.currentPeriodEnd) }}</p>
        </div>
      </div>

      <div v-if="currentSubscription.canceledAt" class="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <p class="text-sm text-yellow-800">
          <strong>Subscription Canceled</strong><br />
          Your subscription has been canceled. You will continue to have access until {{ formatDate(currentSubscription.currentPeriodEnd) }}.
        </p>
      </div>

      <div v-if="currentSubscription.status === 'ACTIVE' && !currentSubscription.canceledAt">
        <button @click="handleCancel" class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors">Cancel Subscription</button>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 mb-4">You don't have an active subscription.</p>
      <NuxtLink to="/subscriptions" class="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors inline-block">
        View Plans
      </NuxtLink>
    </div>
  </div>
</template>
