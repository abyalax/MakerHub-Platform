<script setup lang="ts">
import { computed } from 'vue';

type RowContext = {
  row: {
    getIsSelected: () => boolean;
    toggleSelected: (value: boolean) => void;
    original: unknown;
  };
};

const props = defineProps<{
  context: RowContext;
}>();

const modelValue = computed(() => {
  return props.context.row.getIsSelected();
});

function handleChange(value: boolean | 'indeterminate') {
  const next = value === 'indeterminate' ? true : value;
  props.context.row.toggleSelected(next);
}
</script>

<template>
  <Checkbox :model-value="modelValue" class="cursor-pointer m-0" @update:model-value="handleChange" @click.stop />
</template>
