<script setup lang="ts">
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { useGetAdminProjects } from '~/layers/projects/app/composables/useGetAdminProjects';
import { useModerateProject } from '~/layers/projects/app/composables/useModerateProject';
import { useTableFilter } from '~/layers/shared/app/composable/table/filters/useTableFilter';
import Page from '~/layers/shared/app/components/layouts/Page.vue';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.PROJECT.MODERATE],
});

const { filterRefs, queryParams, search } = useTableFilter({
  storeKey: 'TableFilterProjects',
  filterFields: ['status'],
  syncUrl: true,
});

const { data, isPending } = useGetAdminProjects(queryParams);
const projects = computed(() => data.value?.data ?? []);

const { mutate: moderate } = useModerateProject();
</script>

<template>
  <Page title="Project Moderation" :breadcrumbs="[{ title: 'Project Moderation', url: '/admin/projects', active: true }]">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input v-model="search" placeholder="Search projects..." class="sm:max-w-sm" />
      <select v-model="filterRefs.status" class="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>
    <div class="rounded-lg border">
      <div v-if="isPending" class="p-4 text-sm text-muted-foreground">Loading projects...</div>
      <div v-else-if="projects.length === 0" class="p-8 text-center text-sm text-muted-foreground">No projects found.</div>
      <div v-else class="divide-y">
        <article v-for="project in projects" :key="project.id" class="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-medium">{{ project.title }}</h2>
              <Badge>{{ project.status }}</Badge>
              <Badge variant="outline">{{ project.accessType }}</Badge>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">By {{ project.mentor.name }} in {{ project.category?.name || 'Uncategorized' }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button size="sm" @click="moderate({ projectId: project.id, status: 'PUBLISHED' })">Restore</Button>
            <Button variant="outline" size="sm" @click="moderate({ projectId: project.id, status: 'ARCHIVED' })">Hide</Button>
            <Button variant="destructive" size="sm" @click="moderate({ projectId: project.id, status: 'REJECTED' })">Reject</Button>
          </div>
        </article>
      </div>
    </div>
  </Page>
</template>
