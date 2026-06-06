<script setup lang="ts">
import { cn } from "../../../lib/utils";
const props = defineProps<{ class?: string }>();
</script>

<template>
  <small :class="cn('text-sm leading-none font-medium', props.class)">
    <slot />
  </small>
</template>
