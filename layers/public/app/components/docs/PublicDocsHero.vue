<script setup lang="ts">
import { Badge } from '~/layers/shared/app/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/layers/shared/app/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '~/layers/shared/app/components/ui/tabs';

type PublicDocsBreadcrumb = {
  label: string;
  to?: string;
};

type PublicDocsTab = {
  label: string;
  value: string;
};

defineProps<{
  breadcrumbs: PublicDocsBreadcrumb[];
  title: string;
  description: string;
  tabs: PublicDocsTab[];
  badges?: string[];
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <header class="border-b bg-background">
    <div class="container py-6 md:py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <template v-for="(breadcrumb, index) in breadcrumbs" :key="`${breadcrumb.label}-${index}`">
            <BreadcrumbItem>
              <BreadcrumbLink v-if="breadcrumb.to" as-child>
                <NuxtLink :to="breadcrumb.to">{{ breadcrumb.label }}</NuxtLink>
              </BreadcrumbLink>

              <BreadcrumbPage v-else>{{ breadcrumb.label }}</BreadcrumbPage>
            </BreadcrumbItem>

            <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>

      <div class="mt-5 max-w-4xl space-y-4">
        <div v-if="badges?.length" class="flex flex-wrap gap-2">
          <Badge v-for="badge in badges" :key="badge" variant="secondary">{{ badge }}</Badge>
        </div>

        <div class="space-y-3">
          <h1 class="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            {{ title }}
          </h1>

          <p class="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            {{ description }}
          </p>
        </div>

        <Tabs v-model="model" class="pt-2">
          <TabsList class="h-auto gap-5 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="relative rounded-none border-0 bg-transparent px-0 py-3 text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-transparent data-[state=active]:after:bg-primary"
            >
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  </header>
</template>
