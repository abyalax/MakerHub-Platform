<script setup lang="ts">
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import type { MentorSummaryDTO } from '~/layers/projects/types';
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { useTableFilterMentors } from '~/layers/projects/app/composables/useTableFilterMentors';
import { useGetAdminMentors } from '~/layers/projects/app/composables/useGetAdminMentors';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.MENTOR.READ],
});

const { queryParams } = useTableFilterMentors();

const { data, isPending, refetch } = useGetAdminMentors(queryParams);

const mentors = computed(() => data?.value?.data ?? []);

const http = useHttp();

const setStatus = async (mentor: MentorSummaryDTO, isActive: boolean) => {
  await http(ENDPOINT.ADMIN_MENTOR_STATUS(mentor.id), {
    method: 'PUT',
    body: { isActive },
  });
  await refetch();
};
</script>

<template>
  <Page title="Mentor Management" :breadcrumbs="[{ title: 'Mentor Management', url: '/admin/mentors', active: true }]">
    <div class="rounded-lg border">
      <div v-if="isPending" class="p-4 text-sm text-muted-foreground">Loading mentors...</div>
      <div v-else-if="mentors.length === 0" class="p-8 text-center text-sm text-muted-foreground">No mentors found.</div>
      <div v-else class="divide-y">
        <article v-for="mentor in mentors" :key="mentor.id" class="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-medium">{{ mentor.name }}</h2>
              <Badge :variant="mentor.isActive ? 'secondary' : 'destructive'">{{ mentor.isActive ? 'Active' : 'Suspended' }}</Badge>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">{{ mentor.headline }} · {{ mentor.projectCount }} projects</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <NuxtLink :to="`/mentors/${mentor.id}`"><Button variant="outline" size="sm">View</Button></NuxtLink>
            <Button v-if="mentor.isActive" variant="destructive" size="sm" @click="setStatus(mentor, false)">Suspend</Button>
            <Button v-else size="sm" @click="setStatus(mentor, true)">Restore</Button>
          </div>
        </article>
      </div>
    </div>
  </Page>
</template>
