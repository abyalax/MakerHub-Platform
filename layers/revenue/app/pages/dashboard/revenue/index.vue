<script setup lang="ts">
import { onMounted } from 'vue';
import { useRevenueStore } from '~/layers/revenue/app/composables/useRevenueStore';

const revenueStore = useRevenueStore();

onMounted(() => {
  revenueStore.fetchOverview();
  revenueStore.fetchAnalytics();
  revenueStore.fetchTransactions({ page: 1, limit: 20 });
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Revenue Dashboard</h1>

    <div v-if="revenueStore.loading" class="text-center py-8">
      <p>Loading...</p>
    </div>

    <div v-else-if="revenueStore.error" class="text-red-500 py-8">
      <p>{{ revenueStore.error }}</p>
    </div>

    <div v-else>
      <!-- Revenue Overview -->
      <div v-if="revenueStore.overview" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6 border">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Total Sales</h3>
          <p class="text-3xl font-bold">{{ revenueStore.overview.totalSales }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
          <p class="text-3xl font-bold">
            IDR {{ revenueStore.overview.totalRevenue.toLocaleString() }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Today's Revenue</h3>
          <p class="text-3xl font-bold">
            IDR {{ revenueStore.overview.todayRevenue.toLocaleString() }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Monthly Revenue</h3>
          <p class="text-3xl font-bold">
            IDR {{ revenueStore.overview.monthlyRevenue.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Sales Analytics -->
      <div class="bg-white rounded-lg shadow p-6 border mb-8">
        <h2 class="text-xl font-semibold mb-4">Sales Analytics</h2>
        <div v-if="revenueStore.analytics.length === 0" class="text-gray-500">
          No analytics data available
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="item in revenueStore.analytics"
            :key="item.projectId"
            class="flex justify-between items-center p-4 bg-gray-50 rounded"
          >
            <div>
              <h3 class="font-semibold">{{ item.projectTitle }}</h3>
              <p class="text-sm text-gray-500">{{ item.enrollmentCount }} enrollments</p>
            </div>
            <p class="font-semibold text-lg">
              IDR {{ item.revenue.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="bg-white rounded-lg shadow p-6 border">
        <h2 class="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div v-if="revenueStore.transactions.length === 0" class="text-gray-500">
          No transactions found
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Project</th>
                <th class="text-left py-3 px-4">Learner</th>
                <th class="text-left py-3 px-4">Amount</th>
                <th class="text-left py-3 px-4">Status</th>
                <th class="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transaction in revenueStore.transactions"
                :key="transaction.id"
                class="border-b"
              >
                <td class="py-3 px-4">{{ transaction.projectTitle }}</td>
                <td class="py-3 px-4">{{ transaction.learnerName }}</td>
                <td class="py-3 px-4">
                  {{ transaction.currency }} {{ transaction.amount.toLocaleString() }}
                </td>
                <td class="py-3 px-4">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': transaction.status === 'PAID',
                      'bg-yellow-100 text-yellow-800': transaction.status === 'PENDING',
                      'bg-red-100 text-red-800': transaction.status === 'FAILED',
                    }"
                    class="px-2 py-1 rounded text-xs font-medium"
                  >
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  {{ new Date(transaction.purchaseDate).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
