<script setup lang="ts">
import { cn } from "../../../lib/utils";
const props = defineProps<{ class?: string }>();
</script>

<template>
  <div :class="cn('text-lg font-semibold', props.class)">
    <slot />
  </div>
</template>
