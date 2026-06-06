<script lang="ts" setup>
import { cn } from '~/layers/shared/app/lib/utils';

interface MainProps {
  fixed?: boolean;
  fluid?: boolean;
  scrollable?: boolean;
  class?: string;
}

const props = defineProps<MainProps>();

const mainClasses = computed(() =>
  cn(
    'px-4',
    // If layout is fixed, make the main container flex and grow
    props.fixed && 'flex grow flex-col',
    // If layout is not fluid, set the max-width
    !props.fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
    props.class
  )
);
</script>

<template>
  <main :data-layout="fixed ? 'fixed' : 'auto'" :class="mainClasses">
    <div v-if="scrollable" class="max-h-[80vh] overflow-y-scroll">
      <slot />
    </div>

    <slot v-else />
  </main>
</template>
