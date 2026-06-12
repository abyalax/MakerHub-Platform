<script setup lang="ts">
import { computed, ref } from 'vue';
import { CalendarDate } from '@internationalized/date';
import { Calendar as CalendarIcon, X } from 'lucide-vue-next';
import { Calendar } from '~/layers/shared/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/layers/shared/app/components/ui/popover';
import { Button } from '~/layers/shared/app/components/ui/button';
import { cn } from '~/layers/shared/app/lib/utils';
import { formatDate } from '~/layers/shared/app/utils/formatter';
import type { DateValue } from 'reka-ui';

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select date',
  class: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const isOpen = ref(false);

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder;
  return formatDate(props.modelValue);
});

const calendarValue = computed(() => {
  if (!props.modelValue) return undefined;

  const date = new Date(props.modelValue);
  if (Number.isNaN(date.getTime())) return undefined;

  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) as unknown as DateValue;
});

const handleDateSelect = (date?: DateValue) => {
  if (!date) return;

  const isoString = `${date.toString()}T00:00`;

  emit('update:modelValue', isoString);
  emit('change', isoString);
  isOpen.value = false;
};

const handleClear = (e: MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  emit('update:modelValue', '');
  emit('change', '');
  isOpen.value = false;
};
</script>

<template>
  <div class="relative" @click.stop @focusin.stop>
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="cn('w-full justify-start text-left font-normal h-8 pr-8', !modelValue && 'text-muted-foreground', props.class)"
          :disabled="disabled"
        >
          <CalendarIcon class="h-4 w-4" />
          <span class="truncate mr-4">{{ displayValue }}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-auto p-0 z-100" align="start" :side-offset="8">
        <Calendar initial-focus :model-value="calendarValue" @update:model-value="handleDateSelect" />
      </PopoverContent>
    </Popover>

    <Button
      v-if="modelValue"
      type="button"
      variant="ghost"
      size="icon"
      class="absolute right-1 top-1 h-6 w-6"
      :disabled="disabled"
      aria-label="Clear date"
      @click="handleClear"
    >
      <X class="h-3.5 w-3.5" />
    </Button>
  </div>
</template>
