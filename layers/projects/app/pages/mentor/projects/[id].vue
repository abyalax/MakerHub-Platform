<script setup lang="ts">
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import type { ProjectDTO, CategoryDTO } from '~/layers/projects/types';
import Page from '~/layers/shared/app/components/layouts/Page.vue';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.PROJECT.UPDATE_OWN],
});

const route = useRoute();
const projectId = Number(route.params.id);
const { data, refresh } = await useFetch<{ data: ProjectDTO }>(`/api/mentor/projects/${projectId}`);
const { data: categoriesResponse } = await useFetch<{ data: CategoryDTO[] }>('/api/categories');

const project = computed(() => data.value?.data);
const categories = computed(() => categoriesResponse.value?.data ?? []);

const projectForm = reactive({
  title: '',
  summary: '',
  description: '',
  categoryId: '',
  accessType: 'FREE',
  price: 0,
});

watch(
  project,
  (value) => {
    if (!value) return;
    projectForm.title = value.title;
    projectForm.summary = value.summary ?? '';
    projectForm.description = value.description;
    projectForm.categoryId = value.category?.id ? String(value.category.id) : '';
    projectForm.accessType = value.accessType;
    projectForm.price = Number(value.price);
  },
  { immediate: true }
);

const sectionForm = reactive({ title: '', sortOrder: 0 });
const lessonForms = reactive<Record<number, { title: string; content: string; isPreview: boolean; sortOrder: number }>>({});

const http = useHttp();

const saveProject = async () => {
  await http(ENDPOINT.MENTOR_PROJECT_DETAIL(projectId), {
    method: 'PUT',
    body: {
      title: projectForm.title,
      summary: projectForm.summary || null,
      description: projectForm.description,
      categoryId: projectForm.categoryId ? Number(projectForm.categoryId) : null,
      accessType: projectForm.accessType,
      price: Number(projectForm.price) || 0,
    },
  });
  await refresh();
};

const createSection = async () => {
  await http(ENDPOINT.MENTOR_PROJECT_SECTIONS(projectId), {
    method: 'POST',
    body: { title: sectionForm.title, sortOrder: Number(sectionForm.sortOrder) || 0 },
  });
  sectionForm.title = '';
  sectionForm.sortOrder = 0;
  await refresh();
};

const createLesson = async (sectionId: number) => {
  const form = ensureLessonForm(sectionId);
  await http(ENDPOINT.MENTOR_PROJECT_SECTION_LESSONS(projectId, sectionId), {
    method: 'POST',
    body: {
      title: form.title,
      content: form.content,
      isPreview: form.isPreview,
      sortOrder: Number(form.sortOrder) || 0,
    },
  });
  lessonForms[sectionId] = { title: '', content: '', isPreview: false, sortOrder: 0 };
  await refresh();
};

const ensureLessonForm = (sectionId: number) => {
  lessonForms[sectionId] ??= { title: '', content: '', isPreview: false, sortOrder: 0 };
  return lessonForms[sectionId];
};

const deleteSection = async (sectionId: number) => {
  await http(ENDPOINT.MENTOR_PROJECT_SECTION_DETAIL(projectId, sectionId), { method: 'DELETE' });
  await refresh();
};

const deleteLesson = async (sectionId: number, lessonId: number) => {
  await http(ENDPOINT.MENTOR_PROJECT_SECTION_LESSON_DETAIL(projectId, sectionId, lessonId), { method: 'DELETE' });
  await refresh();
};

const swapSectionOrder = async (first: { id: number; title: string; sortOrder: number }, second: { id: number; title: string; sortOrder: number }) => {
  await Promise.all([
    http(ENDPOINT.MENTOR_PROJECT_SECTION_DETAIL(projectId, first.id), {
      method: 'PUT',
      body: { title: first.title, sortOrder: second.sortOrder },
    }),
    http(ENDPOINT.MENTOR_PROJECT_SECTION_DETAIL(projectId, second.id), {
      method: 'PUT',
      body: { title: second.title, sortOrder: first.sortOrder },
    }),
  ]);
  await refresh();
};

const moveSectionUp = async (section: { id: number; title: string; sortOrder: number }) => {
  const sections = project.value?.sections ?? [];
  const index = sections.findIndex((item) => item.id === section.id);
  if (index > 0) {
    await swapSectionOrder(section, sections[index - 1]);
  }
};

const moveSectionDown = async (section: { id: number; title: string; sortOrder: number }) => {
  const sections = project.value?.sections ?? [];
  const index = sections.findIndex((item) => item.id === section.id);
  if (index >= 0 && index < sections.length - 1) {
    await swapSectionOrder(section, sections[index + 1]);
  }
};

const swapLessonOrder = async (
  sectionId: number,
  first: { id: number; title: string; content?: string | null; isPreview: boolean; sortOrder: number; videoAsset?: { id: number } | null },
  second: { id: number; title: string; content?: string | null; isPreview: boolean; sortOrder: number; videoAsset?: { id: number } | null }
) => {
  const updateLesson = async (lesson: typeof first, newSortOrder: number) => {
    await http(ENDPOINT.MENTOR_PROJECT_SECTION_LESSON_DETAIL(projectId, sectionId, lesson.id), {
      method: 'PUT',
      body: {
        title: lesson.title,
        content: lesson.content,
        isPreview: lesson.isPreview,
        sortOrder: newSortOrder,
        videoAssetId: lesson.videoAsset?.id ?? null,
      },
    });
  };

  await Promise.all([updateLesson(first, second.sortOrder), updateLesson(second, first.sortOrder)]);
  await refresh();
};

const moveLessonUp = async (
  sectionId: number,
  lesson: { id: number; title: string; content?: string | null; isPreview: boolean; sortOrder: number; videoAsset?: { id: number } | null }
) => {
  const section = project.value?.sections?.find((item) => item.id === sectionId);
  if (!section) return;
  const index = section.lessons.findIndex((item) => item.id === lesson.id);
  if (index > 0) {
    await swapLessonOrder(sectionId, lesson, section.lessons[index - 1]);
  }
};

const moveLessonDown = async (
  sectionId: number,
  lesson: { id: number; title: string; content?: string | null; isPreview: boolean; sortOrder: number; videoAsset?: { id: number } | null }
) => {
  const section = project.value?.sections?.find((item) => item.id === sectionId);
  if (!section) return;
  const index = section.lessons.findIndex((item) => item.id === lesson.id);
  if (index >= 0 && index < section.lessons.length - 1) {
    await swapLessonOrder(sectionId, lesson, section.lessons[index + 1]);
  }
};
</script>

<template>
  <Page
    v-if="project"
    :title="project.title"
    :breadcrumbs="[
      { title: 'Mentor Projects', url: '/mentor/projects', active: false },
      { title: project.title, url: `/mentor/projects/${project.id}`, active: true },
    ]"
  >
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form class="h-fit rounded-lg border p-4" @submit.prevent="saveProject">
        <h2 class="font-semibold">Project details</h2>
        <div class="mt-4 space-y-3">
          <Input v-model="projectForm.title" required />
          <Input v-model="projectForm.summary" />
          <textarea v-model="projectForm.description" required class="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          <select v-model="projectForm.categoryId" class="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="">No category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
          <div class="grid grid-cols-2 gap-3">
            <select v-model="projectForm.accessType" class="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
            </select>
            <Input v-model.number="projectForm.price" type="number" min="0" />
          </div>
          <Button type="submit" class="w-full">Save project</Button>
        </div>
      </form>

      <div class="space-y-6">
        <form class="rounded-lg border p-4" @submit.prevent="createSection">
          <h2 class="font-semibold">Sections</h2>
          <div class="mt-4 grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <Input v-model="sectionForm.title" required placeholder="Section title" />
            <Input v-model.number="sectionForm.sortOrder" type="number" min="0" />
            <Button type="submit">Add section</Button>
          </div>
        </form>

        <section v-for="(section, sectionIndex) in project.sections" :key="section.id" class="rounded-lg border">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">{{ section.title }}</h3>
              <span class="rounded-full border px-2 py-1 text-xs text-muted-foreground">Order: {{ section.sortOrder }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" :disabled="sectionIndex === 0" @click="moveSectionUp(section)">Up</Button>
              <Button variant="ghost" size="sm" :disabled="sectionIndex === project.sections.length - 1" @click="moveSectionDown(section)">Down</Button>
              <Button variant="outline" size="sm" @click="deleteSection(section.id)">Delete</Button>
            </div>
          </div>
          <div class="divide-y">
            <article v-for="(lesson, lessonIndex) in section.lessons" :key="lesson.id" class="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="text-sm font-medium">{{ lesson.title }}</h4>
                  <span class="rounded-full border px-2 py-1 text-xs text-muted-foreground">Order: {{ lesson.sortOrder }}</span>
                  <Badge v-if="lesson.isPreview" variant="outline">Preview</Badge>
                </div>
                <p class="mt-2 text-sm text-muted-foreground">{{ lesson.content }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="lessonIndex === 0" @click="moveLessonUp(section.id, lesson)">Up</Button>
                <Button variant="ghost" size="sm" :disabled="lessonIndex === section.lessons.length - 1" @click="moveLessonDown(section.id, lesson)">Down</Button>
                <Button variant="outline" size="sm" @click="deleteLesson(section.id, lesson.id)">Delete</Button>
              </div>
            </article>
          </div>
          <form class="grid gap-3 border-t p-4 md:grid-cols-[1fr_140px_auto]" @submit.prevent="createLesson(section.id)">
            <Input v-model="ensureLessonForm(section.id).title" required placeholder="Lesson title" />
            <label class="flex items-center gap-2 text-sm">
              <input v-model="ensureLessonForm(section.id).isPreview" type="checkbox" />
              Preview
            </label>
            <Button type="submit">Add lesson</Button>
            <textarea
              v-model="ensureLessonForm(section.id).content"
              class="min-h-20 rounded-md border bg-background px-3 py-2 text-sm md:col-span-3"
              placeholder="Lesson content"
            />
          </form>
        </section>
      </div>
    </div>
  </Page>
</template>
