<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Card } from '~/layers/shared/app/components/ui/card';
import { Tabs, TabsContent } from '~/layers/shared/app/components/ui/tabs';
import { ContentAccessType } from '~/layers/shared/app/common/enum';
import { useAuthStore } from '~/layers/auth/app/composables/useAuthStore';
import { useGetProjectPublicDetail } from '../../../../composable/useGetProjectPublicDetail';
import PublicDocsArticleSection from '~/layers/public/app/components/docs/PublicDocsArticleSection.vue';
import PublicDocsHero from '~/layers/public/app/components/docs/PublicDocsHero.vue';
import PublicDocsRelated from '~/layers/public/app/components/docs/PublicDocsRelated.vue';
import PublicDocsToc from '~/layers/public/app/components/docs/PublicDocsToc.vue';

import type { ProjectPublicContentNode } from '../../../../../types/index.js';

type DocsBreadcrumb = {
  label: string;
  to?: string;
};

type DocsTab = {
  label: string;
  value: string;
};

type DocsTocGroup = {
  title: string;
  items: {
    label: string;
    href: string;
    tabValue?: string;
    active?: boolean;
  }[];
};

type RelatedLink = {
  label: string;
  to?: string;
  href?: string;
};

type MetaItem = {
  label: string;
  value: string;
  description?: string;
};

type ProjectTocItem = {
  id: string;
  title: string;
  level: number;
};

type RenderedContentBlock = {
  key: string;
  type: 'heading' | 'paragraph' | 'bulletList' | 'orderedList' | 'blockquote' | 'codeBlock' | 'horizontalRule' | 'image';
  text?: string;
  id?: string;
  level?: number;
  items?: string[];
  src?: string;
  alt?: string;
};

const route = useRoute();
const authStore = useAuthStore();

const slug = computed(() => {
  const value = route.params.slug;
  return Array.isArray(value) ? (value[0] ?? '') : String(value ?? '');
});

const { data: project, isPending, error } = useGetProjectPublicDetail(slug);

const isPremium = computed(() => project.value?.accessType === ContentAccessType.PREMIUM);
const isFree = computed(() => project.value?.accessType === ContentAccessType.FREE);
const activeTab = ref('overview');

watch(
  () => [project.value?.accessType, authStore.isAuthenticated] as const,
  async ([accessType, isAuthenticated]) => {
    if (!accessType) return;
    if (accessType !== ContentAccessType.PREMIUM || isAuthenticated) return;

    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    });
  },
  { immediate: true }
);

useHead({
  title: computed(() => (project.value?.title ? `${project.value.title} | MakerHub` : 'Project Detail | MakerHub')),
});

const accessLabel = computed(() => (isPremium.value ? 'Premium' : 'Free'));

const priceLabel = computed(() => {
  if (!project.value) return '-';
  if (isFree.value) return 'Free';

  const price = Number(project.value.price ?? 0);
  const currency = project.value.currency || 'IDR';

  if (!Number.isFinite(price)) return '-';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
});

const objectives = computed<string[]>(() => {
  const value = project.value?.objectives;

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  return [];
});

const mentorName = computed(() => project.value?.mentor?.name ?? 'Unknown mentor');
const mentorHeadline = computed(() => project.value?.mentor?.headline ?? 'Project mentor');

const ctaLabel = computed(() => {
  if (isFree.value) return 'Start learning';
  return authStore.isAuthenticated ? 'Continue to premium content' : 'Login to access premium';
});

const description = computed(() => project.value?.description || project.value?.summary || 'No description provided yet.');
const categoryLabel = computed(() => project.value?.category?.name ?? 'Uncategorized');
const heroDescription = computed(() => project.value?.summary || 'A practical project-based learning material curated by mentor.');

const getNodeText = (node: ProjectPublicContentNode): string => {
  if (typeof node.text === 'string') return node.text;
  return node.content?.map(getNodeText).join('') ?? '';
};

const toTocId = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

const createHeadingId = (title: string, usedIds: Map<string, number>) => {
  const baseId = toTocId(title);
  const nextCount = (usedIds.get(baseId) ?? 0) + 1;
  usedIds.set(baseId, nextCount);
  return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
};

const tocItems = computed<ProjectTocItem[]>(() =>
  (project.value?.tocJson ?? []).filter(
    (item): item is ProjectTocItem =>
      typeof item?.id === 'string' && item.id.length > 0 && typeof item.title === 'string' && item.title.length > 0 && typeof item.level === 'number'
  )
);

const contentBlocks = computed<RenderedContentBlock[]>(() => {
  const nodes = project.value?.contentJson?.content ?? [];
  const usedIds = new Map<string, number>();

  return nodes
    .map((node, index): RenderedContentBlock | null => {
      const key = `${node.type ?? 'node'}-${index}`;
      const text = getNodeText(node).trim();

      if (node.type === 'heading' && text) {
        return {
          key,
          type: 'heading',
          id: createHeadingId(text, usedIds),
          level: typeof node.attrs?.level === 'number' ? node.attrs.level : 1,
          text,
        };
      }

      if (node.type === 'paragraph' && text) return { key, type: 'paragraph', text };
      if (node.type === 'blockquote' && text) return { key, type: 'blockquote', text };
      if (node.type === 'codeBlock' && text) return { key, type: 'codeBlock', text };
      if (node.type === 'horizontalRule') return { key, type: 'horizontalRule' };

      if ((node.type === 'bulletList' || node.type === 'orderedList') && node.content?.length) {
        return {
          key,
          type: node.type,
          items: node.content
            .map(getNodeText)
            .map((item) => item.trim())
            .filter(Boolean),
        };
      }

      if (node.type === 'image' && typeof node.attrs?.src === 'string') {
        return {
          key,
          type: 'image',
          src: node.attrs.src,
          alt: typeof node.attrs.alt === 'string' ? node.attrs.alt : project.value?.title,
        };
      }

      return null;
    })
    .filter((block): block is RenderedContentBlock => Boolean(block));
});

const breadcrumbs = computed<DocsBreadcrumb[]>(() => [
  { label: 'Projects', to: '/public/projects' },
  { label: categoryLabel.value },
  { label: project.value?.title ?? 'Project detail' },
]);

const tabs: DocsTab[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Objectives', value: 'objectives' },
  { label: 'Access', value: 'access' },
];

const tocGroups = computed<DocsTocGroup[]>(() => {
  const projectGuideItems =
    tocItems.value.length > 0
      ? tocItems.value.map((item) => ({
          label: item.title,
          href: `#${item.id}`,
          tabValue: 'overview',
          active: activeTab.value === 'overview',
        }))
      : [{ label: 'Introduction', href: '#introduction', tabValue: 'overview', active: activeTab.value === 'overview' }];

  return [
    {
      title: 'Project guide',
      items: projectGuideItems,
    },
    {
      title: 'Browse',
      items: [
        { label: 'All public projects', href: '/public/projects' },
        { label: categoryLabel.value, href: '/public/projects' },
      ],
    },
  ];
});

const relatedLinks = computed<RelatedLink[]>(() => [
  { label: 'All public projects', to: '/public/projects' },
  { label: `${categoryLabel.value} projects`, to: '/public/projects' },
  { label: 'Mentor profile', to: '/public/mentors' },
  { label: isPremium.value ? 'Premium access requirements' : 'Free learning content', to: '/public/projects' },
]);

const metaItems = computed<MetaItem[]>(() => [
  { label: 'Price', value: priceLabel.value },
  { label: 'Access', value: accessLabel.value },
  { label: 'Category', value: categoryLabel.value },
  { label: 'Mentor', value: mentorName.value, description: mentorHeadline.value },
]);

const heroBadges = computed(() => [accessLabel.value, categoryLabel.value]);

async function handleTocSelect(item: DocsTocGroup['items'][number]) {
  if (item.tabValue) activeTab.value = item.tabValue;

  await nextTick();
  document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<template>
  <section>
    <div v-if="isPending" class="mx-auto max-w-6xl space-y-6">
      <div class="h-5 w-32 animate-pulse rounded bg-muted" />
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_360px]">
        <div class="space-y-5">
          <div class="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div class="h-5 w-full animate-pulse rounded bg-muted" />
          <div class="aspect-video animate-pulse rounded-xl bg-muted" />
          <div class="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
        <div class="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>

    <div v-else-if="error || !project" class="mx-auto max-w-xl py-20 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">Project not found</h1>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">The project you requested is unavailable, unpublished, or has been removed.</p>

      <Button as-child class="mt-6">
        <NuxtLink to="/public/projects">Back to projects</NuxtLink>
      </Button>
    </div>

    <div v-else>
      <PublicDocsHero
        v-model="activeTab"
        :breadcrumbs="breadcrumbs"
        :title="project.title"
        :description="heroDescription"
        :tabs="tabs"
        :badges="heroBadges"
      />

      <div class="container grid gap-8 py-8 xl:grid-cols-[240px_minmax(0,820px)_280px]">
        <PublicDocsToc title="Project docs" version-label="Public catalog: latest" :groups="tocGroups" @select="handleTocSelect" />

        <main class="min-w-0">
          <Tabs v-model="activeTab">
            <TabsContent value="overview" class="space-y-8">
              <PublicDocsArticleSection v-if="!contentBlocks.length" id="introduction" title="Introduction">
                <p class="whitespace-pre-line">{{ description }}</p>
              </PublicDocsArticleSection>

              <PublicDocsArticleSection v-else id="project-scope" title="Project scope">
                <div class="space-y-5">
                  <template v-for="block in contentBlocks" :key="block.key">
                    <component
                      :is="block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4'"
                      v-if="block.type === 'heading'"
                      :id="block.id"
                      class="scroll-mt-24 font-semibold tracking-tight text-foreground"
                      :class="block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg'"
                    >
                      {{ block.text }}
                    </component>

                    <p v-else-if="block.type === 'paragraph'" class="whitespace-pre-line">{{ block.text }}</p>

                    <blockquote v-else-if="block.type === 'blockquote'" class="border-l-2 pl-4 italic">
                      {{ block.text }}
                    </blockquote>

                    <pre
                      v-else-if="block.type === 'codeBlock'"
                      class="overflow-x-auto rounded-md bg-muted p-4 text-xs text-foreground"
                    ><code>{{ block.text }}</code></pre>

                    <hr v-else-if="block.type === 'horizontalRule'" class="border-border" />

                    <ul v-else-if="block.type === 'bulletList'" class="list-disc space-y-2 pl-5">
                      <li v-for="item in block.items" :key="item">{{ item }}</li>
                    </ul>

                    <ol v-else-if="block.type === 'orderedList'" class="list-decimal space-y-2 pl-5">
                      <li v-for="item in block.items" :key="item">{{ item }}</li>
                    </ol>

                    <img v-else-if="block.type === 'image' && block.src" :src="block.src" :alt="block.alt" class="rounded-lg border" />
                  </template>
                </div>
              </PublicDocsArticleSection>

              <PublicDocsArticleSection id="preview" title="Project preview">
                <Card class="mt-1 overflow-hidden py-0">
                  <div class="aspect-video bg-muted">
                    <img v-if="project.coverUrl" :src="project.coverUrl" :alt="project.title" class="h-full w-full object-cover" />
                    <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No cover image</div>
                  </div>
                </Card>
              </PublicDocsArticleSection>
            </TabsContent>

            <TabsContent value="objectives" class="space-y-8">
              <PublicDocsArticleSection id="learning-objectives" title="Learning objectives">
                <ul v-if="objectives.length" class="space-y-3">
                  <li v-for="(objective, index) in objectives" :key="objective" class="flex gap-3">
                    <span
                      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium text-foreground"
                    >
                      {{ index + 1 }}
                    </span>
                    <span>{{ objective }}</span>
                  </li>
                </ul>

                <p v-else>No learning objectives have been published for this project yet.</p>
              </PublicDocsArticleSection>
            </TabsContent>

            <TabsContent value="access" class="space-y-8">
              <PublicDocsArticleSection id="access-and-mentor" title="Access and mentor">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div v-for="item in metaItems" :key="item.label" class="rounded-lg border bg-card p-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ item.label }}</p>
                    <p class="mt-2 font-semibold text-foreground">{{ item.value }}</p>
                    <p v-if="item.description" class="mt-1 text-sm text-muted-foreground">{{ item.description }}</p>
                  </div>
                </div>
              </PublicDocsArticleSection>
            </TabsContent>
          </Tabs>
        </main>

        <PublicDocsRelated :links="relatedLinks" :meta-items="metaItems" :cta-label="ctaLabel" back-to="/public/projects" />
      </div>
    </div>
  </section>
</template>
