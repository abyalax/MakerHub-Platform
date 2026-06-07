<script setup lang="ts">
const route = useRoute();
const orderNumber = computed(() => route.query.order as string | undefined);
</script>

<template>
  <main class="min-h-screen bg-background">
    <section class="mx-auto max-w-3xl px-6 py-20 text-center">
      <div class="inline-flex rounded-full bg-red-100 p-3 text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 class="mt-6 text-3xl font-semibold">Payment failed</h1>
      <p class="mt-4 text-sm text-muted-foreground">
        We could not complete your payment. Please retry your purchase or contact support if the issue persists.
      </p>
      <p v-if="orderNumber" class="mt-4 text-sm text-muted-foreground">Order number: <strong>{{ orderNumber }}</strong></p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <NuxtLink to="/projects" class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Browse projects again
        </NuxtLink>
        <NuxtLink to="/payments" class="inline-flex items-center justify-center rounded-lg border border-muted-foreground px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
          View payment history
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
