<script setup lang="ts">
import Page from '~/layers/shared/app/components/layouts/Page.vue';

definePageMeta({
  requiresAuth: true,
});
</script>

<template>
  <Page title="Dashboard" :breadcrumbs="[{ title: 'Dashboard', url: '/dashboard', active: true }]">
    <template #children>
      <div class="rounded-lg border bg-card p-6">
        <h2 class="text-xl font-semibold">Dashboard</h2>
        <p class="mt-2 text-sm text-muted-foreground">Use the sidebar to manage users, roles, project authoring, and moderation.</p>
      </div>
    </template>
  </Page>
</template>
