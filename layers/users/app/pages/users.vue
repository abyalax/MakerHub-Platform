<script setup lang="ts">
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import Page from '~~/layers/shared/app/components/layouts/Page.vue';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.USER.READ],
});

const breadcrumbs = [
  {
    title: 'Home',
    url: '/users',
    active: false,
  },
];
</script>

<template>
  <Page title="Users" :breadcrumbs="breadcrumbs">
    <template #children>
      <TableUsers />
    </template>
  </Page>
</template>
