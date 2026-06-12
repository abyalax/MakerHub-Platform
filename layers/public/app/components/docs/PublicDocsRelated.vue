<script setup lang="ts">
import { Button } from '~/layers/shared/app/components/ui/button';
import { Card, CardContent } from '~/layers/shared/app/components/ui/card';
import { Separator } from '~/layers/shared/app/components/ui/separator';

type PublicDocsRelatedLink = {
  label: string;
  to?: string;
  href?: string;
};

type PublicDocsMetaItem = {
  label: string;
  value: string;
  description?: string;
};

defineProps<{
  title?: string;
  links: PublicDocsRelatedLink[];
  metaItems: PublicDocsMetaItem[];
  ctaLabel: string;
  backTo?: string;
}>();
</script>

<template>
  <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start">
    <Card class="py-5">
      <CardContent class="space-y-5 px-5">
        <div>
          <p class="text-sm font-semibold tracking-tight">{{ title ?? 'Related content' }}</p>
          <div class="mt-3 space-y-2 text-sm">
            <template v-for="link in links" :key="link.label">
              <NuxtLink v-if="link.to" :to="link.to" class="block text-muted-foreground transition-colors hover:text-foreground">
                {{ link.label }}
              </NuxtLink>

              <a v-else :href="link.href" class="block text-muted-foreground transition-colors hover:text-foreground">
                {{ link.label }}
              </a>
            </template>
          </div>
        </div>

        <Separator />

        <div class="space-y-4 text-sm">
          <div v-for="item in metaItems" :key="item.label">
            <p class="text-muted-foreground">{{ item.label }}</p>
            <p class="mt-1 font-medium text-foreground">{{ item.value }}</p>
            <p v-if="item.description" class="mt-0.5 text-muted-foreground">{{ item.description }}</p>
          </div>
        </div>

        <Separator />

        <div class="space-y-2">
          <Button class="w-full">{{ ctaLabel }}</Button>

          <Button v-if="backTo" as-child variant="outline" class="w-full">
            <NuxtLink :to="backTo">Back to projects</NuxtLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  </aside>
</template>
