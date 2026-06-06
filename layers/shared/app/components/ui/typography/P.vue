<script setup lang="ts">
import { cn } from "../../../lib/utils";
const props = defineProps<{ class?: string }>();
</script>

<template>
  <p :class="cn('leading-7 not-first:mt-6', props.class)">
    <slot />
  </p>
</template>
