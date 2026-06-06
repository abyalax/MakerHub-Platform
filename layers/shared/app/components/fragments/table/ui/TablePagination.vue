<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { computed } from 'vue';
import { Button } from '~~/layers/shared/app/components/ui/button';

interface Props {
  totalPages: number;
  currentPage: number;
}

const props = defineProps<Props>();

defineEmits<{
  pageChange: [page: number];
  nextPage: [];
  previousPage: [];
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;

  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(props.totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});
</script>

<template>
  <div class="flex items-center space-x-2">
    <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="$emit('previousPage')">
      <ChevronLeft class="w-4 h-4" />
    </Button>

    <div class="flex items-center space-x-1">
      <Button
        v-for="page in visiblePages"
        :key="page"
        :variant="page === currentPage ? 'default' : 'outline'"
        size="sm"
        @click="$emit('pageChange', page)"
      >
        {{ page }}
      </Button>
    </div>

    <Button variant="outline" size="sm" :disabled="currentPage >= totalPages" @click="$emit('nextPage')">
      <ChevronRight class="w-4 h-4" />
    </Button>
  </div>
</template>
