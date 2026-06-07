<script setup lang="ts">
const subscriptionsStore = useSubscriptionsStore();
const { plans, loading, error } = storeToRefs(subscriptionsStore);

const showCreateDialog = ref(false);
const editingPlan = ref<number | null>(null);

onMounted(() => {
  subscriptionsStore.fetchPlansAdmin();
});

const handleEdit = (planId: number) => {
  editingPlan.value = planId;
};

const handleDelete = async (planId: number) => {
  if (confirm('Are you sure you want to delete this plan?')) {
    try {
      await subscriptionsStore.deletePlan(planId);
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  }
};

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
  }).format(price);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Subscription Plans</h1>
      <button
        @click="showCreateDialog = true"
        class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Create Plan
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <div v-else-if="error" class="text-red-600 mb-4">
      {{ error }}
    </div>

    <div v-else class="bg-white border rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Billing Interval
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="plan in plans" :key="plan.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ plan.name }}</div>
              <div class="text-sm text-gray-500">{{ plan.slug }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ formatPrice(plan.price, plan.currency) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ plan.billingInterval }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ plan.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="handleEdit(plan.id)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Edit
              </button>
              <button
                @click="handleDelete(plan.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && plans.length === 0" class="text-center py-8 text-gray-500">
      No subscription plans found. Create your first plan to get started.
    </div>
  </div>
</template>
