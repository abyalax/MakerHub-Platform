<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePaymentsStore } from '~/layers/payments/app/composables/usePaymentsStore';

const paymentsStore = usePaymentsStore();

const page = ref(1);
const limit = ref(20);

onMounted(() => {
  paymentsStore.fetchHistory({ page: page.value, limit: limit.value });
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Payment History</h1>

    <div v-if="paymentsStore.loading" class="text-center py-8">
      <p>Loading...</p>
    </div>

    <div v-else-if="paymentsStore.error" class="text-red-500 py-8">
      <p>{{ paymentsStore.error }}</p>
    </div>

    <div v-else>
      <div v-if="paymentsStore.payments.length === 0" class="text-center py-8">
        <p class="text-gray-500">No payments found</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="payment in paymentsStore.payments" :key="payment.id" class="bg-white rounded-lg shadow p-4 border">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">
                {{ payment.order?.project?.title || payment.order?.class?.title || 'Unknown' }}
              </h3>
              <p class="text-sm text-gray-500">{{ payment.currency }} {{ payment.amount }}</p>
              <p class="text-xs text-gray-400">
                {{ new Date(payment.createdAt).toLocaleDateString() }}
              </p>
            </div>
            <div>
              <span
                :class="{
                  'bg-green-100 text-green-800': payment.status === 'SUCCEEDED',
                  'bg-yellow-100 text-yellow-800': payment.status === 'PENDING',
                  'bg-red-100 text-red-800': payment.status === 'FAILED',
                  'bg-gray-100 text-gray-800': payment.status === 'EXPIRED',
                }"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ payment.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
