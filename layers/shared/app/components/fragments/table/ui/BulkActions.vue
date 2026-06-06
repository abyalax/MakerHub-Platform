<script setup lang="ts" generic="T">
import type { Row, Table } from '@tanstack/vue-table';
import { ChevronDown } from 'lucide-vue-next';
import { computed } from 'vue';
import { Button } from '~~/layers/shared/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~~/layers/shared/app/components/ui/dropdown-menu';
import type { BulkAction } from '../index';

interface Props<T> {
  table: Table<T>;
  bulkActions: BulkAction<T>[];
}

const props = defineProps<Props<T>>();

const selectedRows = computed(() => {
  return props.table.getSelectedRowModel().rows.map((row: Row<T>) => row.original);
});
</script>

<template>
  <div class="flex items-center gap-2">
    <div v-if="selectedRows.length > 0" class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground"> {{ selectedRows.length }} selected </span>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm">
            Actions
            <ChevronDown class="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="action in bulkActions"
            :key="action.label"
            :disabled="action.disabled?.(selectedRows)"
            @click="!action.disabled?.(selectedRows) && action.onClick(selectedRows)"
          >
            <component :is="action.icon" class="w-4 h-4 mr-2" />
            {{ action.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
