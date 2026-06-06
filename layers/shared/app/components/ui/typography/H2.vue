<script setup lang="ts">
import { cn } from "../../../lib/utils";
const props = defineProps<{ class?: string }>();
</script>

<template>
  <h2
    :class="
      cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        props.class,
      )
    "
  >
    <slot />
  </h2>
</template>
