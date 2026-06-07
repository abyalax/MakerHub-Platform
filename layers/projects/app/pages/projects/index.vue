<script setup lang="ts">
import type { ProjectDTO, CategoryDTO } from '~/layers/projects/types';
import type { Paginated } from '~/layers/shared/app/types/meta';

const search = ref('');
const category = ref('');
const page = ref(1);

const query = computed(() => ({
  page: page.value,
  limit: 12,
  search: search.value || undefined,
  category: category.value || undefined,
}));

const {
  data: projectsResponse,
  pending,
  refresh,
} = await useFetch<{ data: Paginated<ProjectDTO> }>('/api/projects', {
  query,
});
const { data: categoriesResponse } = await useFetch<{ data: CategoryDTO[] }>('/api/categories');
const { data: featuredResponse } = await useFetch<{ data: ProjectDTO[] }>('/api/projects/featured');

watch([search, category], () => {
  page.value = 1;
  refresh();
});

const projects = computed(() => projectsResponse.value?.data.data ?? []);
const meta = computed(() => projectsResponse.value?.data.meta);
const categories = computed(() => categoriesResponse.value?.data ?? []);
const featured = computed(() => featuredResponse.value?.data ?? []);
</script>

<template>
  <main class="min-h-screen bg-background">
    <section class="border-b">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-semibold tracking-tight">Projects</h1>
          <p class="max-w-2xl text-sm text-muted-foreground">Browse project-based lessons from active mentors.</p>
        </div>

        <div class="grid gap-3 md:grid-cols-[1fr_240px]">
          <Input v-model="search" placeholder="Search projects..." />
          <select v-model="category" class="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="">All categories</option>
            <option v-for="item in categories" :key="item.id" :value="item.slug">{{ item.name }}</option>
          </select>
        </div>
      </div>
    </section>

    <section v-if="featured.length" class="border-b">
      <div class="mx-auto max-w-6xl px-6 py-6">
        <h2 class="mb-4 text-lg font-semibold">Featured</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <NuxtLink
            v-for="project in featured"
            :key="project.id"
            :to="`/projects/${project.slug}`"
            class="rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-medium">{{ project.title }}</h3>
              <Badge :variant="project.accessType === 'FREE' ? 'secondary' : 'outline'">{{ project.accessType }}</Badge>
            </div>
            <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ project.summary }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-8">
      <div v-if="pending" class="text-sm text-muted-foreground">Loading projects...</div>
      <div v-else-if="projects.length === 0" class="rounded-lg border border-dashed p-10 text-center">
        <h2 class="font-medium">No projects found</h2>
        <p class="mt-1 text-sm text-muted-foreground">Try a different keyword or clear the category filter.</p>
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="project in projects"
          :key="project.id"
          :to="`/projects/${project.slug}`"
          class="rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold">{{ project.title }}</h2>
              <p class="mt-1 text-xs text-muted-foreground">{{ project.category?.name }} by {{ project.mentor.name }}</p>
            </div>
            <Badge :variant="project.accessType === 'FREE' ? 'secondary' : 'outline'">{{ project.accessType }}</Badge>
          </div>
          <p class="mt-3 line-clamp-3 text-sm text-muted-foreground">{{ project.summary || project.description }}</p>
        </NuxtLink>
      </div>

      <div v-if="meta && meta.totalPages > 1" class="mt-6 flex items-center justify-between">
        <Button variant="outline" :disabled="page <= 1" @click="page--">Previous</Button>
        <span class="text-sm text-muted-foreground">Page {{ meta.currentPage }} of {{ meta.totalPages }}</span>
        <Button variant="outline" :disabled="page >= meta.totalPages" @click="page++">Next</Button>
      </div>
    </section>
  </main>
</template>
