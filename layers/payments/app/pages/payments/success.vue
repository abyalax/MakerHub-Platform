<script setup lang="ts">
const route = useRoute();
const orderNumber = computed(() => route.query.order as string | undefined);
</script>

<template>
  <main class="min-h-screen bg-background">
    <section class="mx-auto max-w-3xl px-6 py-20 text-center">
      <div class="inline-flex rounded-full bg-green-100 p-3 text-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="mt-6 text-3xl font-semibold">Payment received</h1>
      <p class="mt-4 text-sm text-muted-foreground">
        Your purchase is complete and premium access has been granted. You can now open the project or review your payment history.
      </p>
      <p v-if="orderNumber" class="mt-4 text-sm text-muted-foreground">Order number: <strong>{{ orderNumber }}</strong></p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <NuxtLink to="/learning" class="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">
          Go to learning library
        </NuxtLink>
        <NuxtLink to="/payments" class="inline-flex items-center justify-center rounded-lg border border-muted-foreground px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
          View payment history
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
