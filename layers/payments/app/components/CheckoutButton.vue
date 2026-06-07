<script setup lang="ts">
import { ref } from 'vue';
import { useCreateCheckout } from '~/layers/payments/app/composables/useCreateCheckout';

interface Props {
  projectId: number;
  price: number;
  currency: string;
}

const props = defineProps<Props>();

const checkoutMutation = useCreateCheckout();
const loading = ref(false);

async function handleCheckout() {
  loading.value = true;
  try {
    const response = await checkoutMutation.mutateAsync({ projectId: props.projectId });
    if (response.data?.checkoutUrl) {
      window.location.href = response.data.checkoutUrl;
    }
  } catch (error) {
    console.error('Checkout failed:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <button
    class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="loading"
    @click="handleCheckout"
  >
    <span v-if="loading">Processing...</span>
    <span v-else>Purchase for {{ currency }} {{ price }}</span>
  </button>
</template>
