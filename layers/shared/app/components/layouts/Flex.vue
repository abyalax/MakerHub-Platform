<script lang="ts" setup>
import type { CSSProperties } from "vue";

interface FlexProps {
  justify?: CSSProperties["justifyContent"];
  align?: CSSProperties["alignItems"];
  wrap?: CSSProperties["flexWrap"];
  direction?: CSSProperties["flexDirection"];
  gap?: CSSProperties["gap"];
}

const props = defineProps<FlexProps>();

const style = computed(() => ({
  display: "flex",
  gap: props.gap,
  justifyContent: props.justify,
  flexDirection: props.direction,
  flexWrap: props.wrap,
}));
</script>
<template>
  <div :style="style">
    <slot />
  </div>
</template>
