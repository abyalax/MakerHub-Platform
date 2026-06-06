<script setup lang="ts">
import { computed } from 'vue';

/**
 * Define the named model for the status value.
 */
const status = defineModel<string>('status', { default: '' });

interface Props {
  /**
   * Optional custom mapping to override or add new status styles.
   * This makes the component truly reusable across different modules.
   */
  customStyles?: Record<string, string>;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  customStyles: () => ({}),
  className: '',
});

const defaultStyles: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  completed: 'bg-sky-100 text-sky-800 border-sky-200',
  pending: 'bg-purple-100 text-purple-800 border-purple-200',
};

const badgeClass = computed(() => {
  const key = status.value?.toLowerCase() ?? '';
  // Merge default styles with custom styles from props
  const styles = { ...defaultStyles, ...props.customStyles };
  return styles[key] ?? 'bg-slate-100 text-slate-800 border-slate-200';
});
</script>

<template>
  <span :class="['inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize transition-colors', badgeClass, className]">
    <!-- Slot allows for icons or custom text formatting -->
    <slot>
      {{ status }}
    </slot>
  </span>
</template>
