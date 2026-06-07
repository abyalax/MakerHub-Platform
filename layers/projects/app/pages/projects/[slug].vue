<script setup lang="ts">
import { useGetProjectDetail } from '~/layers/projects/app/composables/useGetProjectDetail';
import CheckoutButton from '~/layers/payments/app/components/CheckoutButton.vue';

const { data, isPending, isError } = useGetProjectDetail();

const project = computed(() => data.value);
const price = computed(() => Number(project.value?.price ?? 0));
const hasPremiumAccess = computed(() => project.value?.accessType === 'FREE' || !project.value?.accessLocked);
</script>

<template>
  <main class="min-h-screen bg-background">
    <section v-if="isPending" class="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">Loading project...</section>
    <section v-else-if="isError || !project" class="mx-auto max-w-5xl px-6 py-10">
      <h1 class="text-2xl font-semibold">Project not found</h1>
      <NuxtLink to="/projects" class="mt-4 inline-flex text-sm underline">Back to projects</NuxtLink>
    </section>
    <template v-else>
      <section class="border-b">
        <div class="mx-auto grid max-w-5xl gap-6 px-6 py-8">
          <div class="flex flex-wrap items-center gap-2">
            <Badge>{{ project.category?.name || 'Project' }}</Badge>
            <Badge :variant="project.accessType === 'FREE' ? 'secondary' : 'outline'">{{ project.accessType }}</Badge>
          </div>
          <div>
            <h1 class="text-3xl font-semibold tracking-tight">{{ project.title }}</h1>
            <p class="mt-3 max-w-3xl text-muted-foreground">{{ project.summary || project.description }}</p>
          </div>
          <NuxtLink :to="`/mentors/${project.mentor.id}`" class="text-sm underline underline-offset-4">By {{ project.mentor.name }}</NuxtLink>
        </div>
      </section>

      <section class="mx-auto grid max-w-5xl gap-8 px-6 py-8 lg:grid-cols-[1fr_280px]">
        <div class="space-y-8">
          <div>
            <h2 class="text-lg font-semibold">Overview</h2>
            <p class="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{{ project.description }}</p>
          </div>

          <div v-if="project.objectives.length">
            <h2 class="text-lg font-semibold">Objectives</h2>
            <ul class="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li v-for="objective in project.objectives" :key="objective" class="rounded-md border px-3 py-2">{{ objective }}</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-semibold">Lessons</h2>
            <div v-if="project.accessLocked" class="mt-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Premium learning materials are locked. Preview lessons remain available.
            </div>
            <div class="mt-4 space-y-4">
              <section v-for="section in project.sections" :key="section.id" class="rounded-lg border p-4">
                <h3 class="font-medium">{{ section.title }}</h3>
                <div class="mt-3 divide-y">
                  <article v-for="lesson in section.lessons" :key="lesson.id" class="py-3">
                    <div class="flex items-center justify-between gap-3">
                      <h4 class="text-sm font-medium">{{ lesson.title }}</h4>
                      <Badge v-if="lesson.isPreview" variant="outline">Preview</Badge>
                    </div>
                    <p v-if="lesson.content" class="mt-2 text-sm leading-6 text-muted-foreground">{{ lesson.content }}</p>
                  </article>
                </div>
              </section>
            </div>
          </div>
        </div>

        <aside class="h-fit rounded-lg border p-4">
          <div class="text-sm text-muted-foreground">Access</div>
          <div class="mt-1 text-2xl font-semibold">{{ project.accessType === 'FREE' ? 'Free' : `${project.price} ${project.currency}` }}</div>
          <p class="mt-3 text-sm text-muted-foreground">
            {{
              project.accessType === 'FREE'
                ? 'Full learning content is available to guests.'
                : hasPremiumAccess
                ? 'You already have access to this premium project.'
                : 'Purchase this project to unlock premium lessons and resources.'
            }}
          </p>

          <div v-if="project.accessType === 'PREMIUM' && project.accessLocked" class="mt-6">
            <CheckoutButton :project-id="project.id" :price="price" :currency="project.currency" />
          </div>
          <div v-else-if="project.accessType === 'PREMIUM' && !project.accessLocked" class="mt-6">
            <NuxtLink to="/learning" class="inline-flex items-center justify-center w-full rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700">
              Continue learning
            </NuxtLink>
          </div>
        </aside>
      </section>
    </template>
  </main>
</template>
