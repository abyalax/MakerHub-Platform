<script setup lang="ts">
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import type { ProjectDTO, CategoryDTO } from '~/layers/projects/types';
import type { Paginated } from '~/layers/shared/app/types/meta';
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.PROJECT.READ_OWN],
});

const form = reactive({
  title: '',
  summary: '',
  description: '',
  categoryId: '',
  accessType: 'FREE',
  price: 0,
});

const { data: projectsResponse, pending, refresh } = await useFetch<{ data: Paginated<ProjectDTO> }>('/api/mentor/projects');
const { data: categoriesResponse } = await useFetch<{ data: CategoryDTO[] }>('/api/categories');

const projects = computed(() => projectsResponse.value?.data.data ?? []);
const categories = computed(() => categoriesResponse.value?.data ?? []);
const isSaving = ref(false);

const http = useHttp();

const createProject = async () => {
  isSaving.value = true;
  try {
    await http(ENDPOINT.MENTOR_PROJECTS, {
      method: 'POST',
      body: {
        title: form.title,
        summary: form.summary || undefined,
        description: form.description,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        accessType: form.accessType,
        price: Number(form.price) || 0,
      },
    });
    form.title = '';
    form.summary = '';
    form.description = '';
    form.categoryId = '';
    form.accessType = 'FREE';
    form.price = 0;
    await refresh();
  } finally {
    isSaving.value = false;
  }
};

const publishProject = async (project: ProjectDTO) => {
  await http(ENDPOINT.MENTOR_PROJECT_PUBLISH(project.id), { method: 'POST' });
  await refresh();
};

const archiveProject = async (project: ProjectDTO) => {
  await http(ENDPOINT.MENTOR_PROJECT_ARCHIVE(project.id), { method: 'POST' });
  await refresh();
};
</script>

<template>
  <Page title="Mentor Projects" :breadcrumbs="[{ title: 'Mentor Projects', url: '/mentor/projects', active: true }]">
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form class="h-fit rounded-lg border p-4" @submit.prevent="createProject">
        <h2 class="font-semibold">Create project</h2>
        <div class="mt-4 space-y-3">
          <Input v-model="form.title" required placeholder="Title" />
          <Input v-model="form.summary" placeholder="Summary" />
          <textarea
            v-model="form.description"
            required
            class="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Description"
          />
          <select v-model="form.categoryId" class="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="">No category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
          <div class="grid grid-cols-2 gap-3">
            <select v-model="form.accessType" class="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
            </select>
            <Input v-model.number="form.price" type="number" min="0" placeholder="Price" />
          </div>
          <Button type="submit" class="w-full" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Create draft' }}</Button>
        </div>
      </form>

      <div class="rounded-lg border">
        <div class="border-b px-4 py-3">
          <h2 class="font-semibold">Your projects</h2>
        </div>
        <div v-if="pending" class="p-4 text-sm text-muted-foreground">Loading projects...</div>
        <div v-else-if="projects.length === 0" class="p-8 text-center text-sm text-muted-foreground">No projects yet.</div>
        <div v-else class="divide-y">
          <article v-for="project in projects" :key="project.id" class="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-medium">{{ project.title }}</h3>
                <Badge>{{ project.status }}</Badge>
                <Badge variant="outline">{{ project.accessType }}</Badge>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">{{ project.summary }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <NuxtLink :to="`/mentor/projects/${project.id}`"><Button variant="outline" size="sm">Edit</Button></NuxtLink>
              <Button v-if="project.status !== 'PUBLISHED'" size="sm" @click="publishProject(project)">Publish</Button>
              <Button v-if="project.status === 'PUBLISHED'" variant="outline" size="sm" @click="archiveProject(project)">Archive</Button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </Page>
</template>
