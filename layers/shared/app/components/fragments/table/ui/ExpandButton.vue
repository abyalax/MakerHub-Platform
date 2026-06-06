<script setup lang="ts">
import { ChevronDown, ChevronRight } from 'lucide-vue-next';

const expanded = defineModel<boolean>('expanded', { default: false });

interface Props {
  size?: number;
  className?: string;
}

withDefaults(defineProps<Props>(), {
  size: 16,
  className: '',
});

const handleClick = (e: MouseEvent) => {
  e.stopPropagation();
  expanded.value = !expanded.value;
};
</script>

<template>
  <button
    type="button"
    :class="['inline-flex items-center justify-center p-1 hover:bg-muted rounded transition-colors focus:outline-none', className]"
    :aria-expanded="expanded"
    @click="handleClick"
  >
    <slot name="icon" :is-expanded="expanded">
      <component :is="expanded ? ChevronDown : ChevronRight" :size="size" class="shrink-0" />
    </slot>
  </button>
</template>
