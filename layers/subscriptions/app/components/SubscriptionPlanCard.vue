<script setup lang="ts">
import type { SubscriptionPlan } from '../composables/types';

interface Props {
  plan: SubscriptionPlan;
  onSubscribe?: (planId: number) => void;
}

const props = defineProps<Props>();

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

const getIntervalLabel = (interval: string) => {
  return interval === 'MONTHLY' ? '/month' : '/year';
};
</script>

<template>
  <div class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold">{{ plan.name }}</h3>
      <span v-if="!plan.isActive" class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded"> Inactive </span>
    </div>

    <p v-if="plan.description" class="text-gray-600 mb-4">
      {{ plan.description }}
    </p>

    <div class="mb-4">
      <span class="text-3xl font-bold">
        {{ formatPrice(plan.price, plan.currency) }}
      </span>
      <span class="text-gray-500">
        {{ getIntervalLabel(plan.billingInterval) }}
      </span>
    </div>

    <ul class="space-y-2 mb-6">
      <li class="flex items-center text-sm">
        <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        Access to all premium projects
      </li>
      <li class="flex items-center text-sm">
        <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        Unlimited learning progress
      </li>
      <li class="flex items-center text-sm">
        <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        Priority support
      </li>
    </ul>

    <button
      v-if="plan.isActive"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      @click="onSubscribe?.(plan.id)"
    >
      Subscribe Now
    </button>
    <button v-else disabled class="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded cursor-not-allowed">Not Available</button>
  </div>
</template>
