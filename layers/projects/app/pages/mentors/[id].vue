<script setup lang="ts">
import { useGetMentorDetail } from '~/layers/projects/app/composables/useGetMentorDetail';

const { data, isPending } = useGetMentorDetail();
const mentor = computed(() => data.value ?? null);
</script>

<template>
  <main class="min-h-screen bg-background">
    <section v-if="isPending" class="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">Loading mentor...</section>
    <template v-else-if="mentor">
      <section class="border-b">
        <div class="mx-auto max-w-5xl px-6 py-8">
          <h1 class="text-3xl font-semibold tracking-tight">{{ mentor.name }}</h1>
          <p class="mt-2 text-muted-foreground">{{ mentor.headline }}</p>
          <p class="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{{ mentor.bio }}</p>
          <p v-if="mentor.expertise" class="mt-3 text-sm">{{ mentor.expertise }}</p>
        </div>
      </section>
      <section class="mx-auto max-w-5xl px-6 py-8">
        <h2 class="text-lg font-semibold">Published projects</h2>
        <div v-if="mentor.projects.length === 0" class="mt-4 rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
          No published projects.
        </div>
        <div v-else class="mt-4 grid gap-4 md:grid-cols-2">
          <NuxtLink
            v-for="project in mentor.projects"
            :key="project.id"
            :to="`/projects/${project.slug}`"
            class="rounded-lg border p-4 hover:bg-accent"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-medium">{{ project.title }}</h3>
              <Badge>{{ project.accessType }}</Badge>
            </div>
            <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ project.summary }}</p>
          </NuxtLink>
        </div>
      </section>
    </template>
  </main>
</template>
