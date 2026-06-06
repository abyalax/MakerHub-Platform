<script setup lang="ts" generic="T">
import type { Column } from '@tanstack/vue-table';
import { Check, CrossIcon, PlusCircle } from 'lucide-vue-next';
import { ref } from 'vue';
import { Button } from '~~/layers/shared/app/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '~~/layers/shared/app/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '~~/layers/shared/app/components/ui/popover';
import type { FacetedFilterOption } from '../index';

interface Props<T> {
  column?: Column<T, unknown>;
  title: string;
  options: FacetedFilterOption[];
}

const props = defineProps<Props<T>>();

const selectedValues = ref<string[]>([]);

const isSelected = (value: string): boolean => {
  return selectedValues.value.includes(value);
};

const toggleOption = (value: string) => {
  if (isSelected(value)) {
    selectedValues.value = selectedValues.value.filter((v) => v !== value);
  } else {
    selectedValues.value.push(value);
  }
  updateColumnFilter();
};

const clearFilter = () => {
  selectedValues.value = [];
  updateColumnFilter();
};

const updateColumnFilter = () => {
  props.column?.setFilterValue(selectedValues.value.length ? selectedValues.value : undefined);
};
</script>

<template>
  <div class="flex items-center space-x-2">
    <span class="text-sm font-medium">{{ title }}</span>
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm" class="h-8 border-dashed">
          <PlusCircle class="w-4 h-4 mr-2" />
          {{ title }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-50 p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem v-for="option in options" :key="option.value" :value="option.value" @select="() => toggleOption(option.value)">
                <div
                  class="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                  :class="isSelected(option.value) ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'"
                >
                  <Check class="w-4 h-4" />
                </div>
                <component :is="option.icon" v-if="option.icon" class="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{{ option.label }}</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="clear" @select="clearFilter">
                <div class="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border opacity-50 [&_svg]:invisible" />
                <CrossIcon class="mr-2 h-4 w-4" />
                Clear filter
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
