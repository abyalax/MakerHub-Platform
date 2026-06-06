<script setup lang="ts" generic="T">
import type { Column, Table } from '@tanstack/vue-table';
import { Eye } from 'lucide-vue-next';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Checkbox } from '~/layers/shared/app/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/layers/shared/app/components/ui/dropdown-menu';

interface Props<T> {
  table: Table<T>;
  columnIds: string[];
}

const props = defineProps<Props<T>>();

const isColumnVisible = (columnId: string): boolean => {
  const column = props.table.getColumn(columnId) as Column<T, unknown>;
  return column.getIsVisible();
};

const toggleColumnVisibility = (columnId: string) => {
  const column = props.table.getColumn(columnId) as Column<T, unknown>;
  column.toggleVisibility();
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm">
        <Eye class="w-4 h-4 mr-2" />
        Columns
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-37.5">
      <DropdownMenuItem v-for="columnId in columnIds" :key="columnId" @click="toggleColumnVisibility(columnId)">
        <div class="flex items-center space-x-2">
          <Checkbox :checked="isColumnVisible(columnId)" />
          <span class="capitalize">{{ columnId }}</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
