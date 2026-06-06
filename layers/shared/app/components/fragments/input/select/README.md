<!-- ─────────────────────────────────────────────────────────────────────────
  USAGE EXAMPLE — PurchaseOrder multi-select
  ───────────────────────────────────────────────────────────────────────── -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import InfiniteSelect from '@/components/InfiniteSelect.vue';
import { useHttp } from '@/composables/useHttp';
import { ENDPOINT } from '@/constants/endpoint';
import { QUERY_KEY } from '@/constants/queryKey';
import type { TResponse, Paginated } from '@/types/api';

// ─── Type ─────────────────────────────────────────────────────────────────────

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  totalAmount: number;
}

// ─── HTTP fetcher (plug into queryOptions.fetcher) ────────────────────────────

const http = useHttp();

async function fetchPurchaseOrders(params: { page: number; limit: number; search: string }) {
  const response = await http<TResponse<Paginated<PurchaseOrder>>>(ENDPOINT.PURCHASE_ORDERS, {
    method: 'GET',
    query: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
    },
  });
  return response.data; // returns Paginated<PurchaseOrder>
}

// ─── State ────────────────────────────────────────────────────────────────────

// Multiple mode — model holds T[]
const selectedOrders = ref<PurchaseOrder[]>([]);

// Single mode — model holds T | null
const selectedOrder = ref<PurchaseOrder | null>(null);
</script>

<template>
  <!-- ── Multiple select ────────────────────────────────────────────────────── -->
  <InfiniteSelect
    v-model="selectedOrders"
    :multiple="true"
    placeholder="Select purchase orders..."
    label-key="poNumber"
    value-key="id"
    :query-options="{
      queryKey: [QUERY_KEY.PURCHASE_ORDERS_LIST],
      fetcher: fetchPurchaseOrders,
      limit: 20,
    }"
  />

  <!-- ── Single select ──────────────────────────────────────────────────────── -->
  <InfiniteSelect
    v-model="selectedOrder"
    placeholder="Select a purchase order..."
    label-key="poNumber"
    value-key="id"
    :query-options="{
      queryKey: [QUERY_KEY.PURCHASE_ORDERS_LIST],
      fetcher: fetchPurchaseOrders,
    }"
  />

  <!-- ── Custom label via function ─────────────────────────────────────────── -->
  <InfiniteSelect
    v-model="selectedOrder"
    placeholder="Select a purchase order..."
    :label-key="(po) => `${po.poNumber} — ${po.vendorName}`"
    value-key="id"
    :query-options="{
      queryKey: [QUERY_KEY.PURCHASE_ORDERS_LIST],
      fetcher: fetchPurchaseOrders,
    }"
  />

  <!-- ── Custom option slot (extra info per row) ────────────────────────────── -->
  <InfiniteSelect
    v-model="selectedOrders"
    :multiple="true"
    placeholder="Select purchase orders..."
    label-key="poNumber"
    value-key="id"
    :query-options="{
      queryKey: [QUERY_KEY.PURCHASE_ORDERS_LIST],
      fetcher: fetchPurchaseOrders,
    }"
  >
    <template #option="{ item }">
      <div class="flex w-full flex-col">
        <span class="font-medium">{{ item.poNumber }}</span>
        <span class="text-xs text-muted-foreground">{{ item.vendorName }}</span>
      </div>
    </template>
  </InfiniteSelect>
</template>