<script setup lang="ts">
import { computed } from 'vue';

type HeaderContext = {
  table: {
    getIsAllPageRowsSelected: () => boolean;
    getIsSomePageRowsSelected: () => boolean;
    toggleAllPageRowsSelected: (value: boolean) => void;
  };
};

const props = defineProps<{
  context: HeaderContext;
}>();

const modelValue = computed(() => {
  const isAll = props.context.table.getIsAllPageRowsSelected();
  const isSome = props.context.table.getIsSomePageRowsSelected();

  if (isAll) return true;
  if (isSome) return 'indeterminate';
  return false;
});

function handleChange(value: boolean | 'indeterminate') {
  const next = value === 'indeterminate' ? true : value;
  props.context.table.toggleAllPageRowsSelected(next);
}
</script>

<template>
  <Checkbox :model-value="modelValue" class="cursor-pointer m-0" @update:model-value="handleChange" @click.stop />
</template>
