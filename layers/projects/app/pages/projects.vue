<script setup lang="ts">
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import Page from '~~/layers/shared/app/components/layouts/Page.vue';
import TableProjects from '../components/TableProjects.vue';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.PROJECT.READ],
});

const breadcrumbs = [
  {
    title: 'Projects',
    url: '/projects',
    active: false,
  },
];
</script>

<template>
  <Page title="Projects" :breadcrumbs="breadcrumbs">
    <template #children>
      <TableProjects />
    </template>
  </Page>
</template>
