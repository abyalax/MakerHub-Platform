<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-vue-next';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Separator } from '../../../ui/separator';
import { useInfiniteQuery, type InfiniteQueryOptions } from '~/layers/shared/app/composable/useInfiniteQuery';
import { cn } from '~/layers/shared/app/lib/utils';

defineOptions({
  inheritAttrs: false,
});

// ─── Props ────────────────────────────────────────────────────────────────────

type LabelResolver<T> = string | ((item: T) => string);
type ValueResolver<T> = string | number | ((item: T) => string | number);

interface Props {
  /** Bound value — single: T | null, multiple: T[] */
  modelValue: T | T[] | null;

  /** Whether multiple selection is allowed */
  multiple?: boolean;

  /** Placeholder text when nothing is selected */
  placeholder?: string;

  /** Disabled state */
  disabled?: boolean;

  /** How to get display label from an item */
  labelKey: LabelResolver<T>;

  /** How to get unique identity key from an item (for dedup & equality) */
  valueKey: ValueResolver<T>;

  /** Options passed directly to useInfiniteSelectQuery (minus search, which is internal) */
  queryOptions: Omit<InfiniteQueryOptions<T>, 'search'>;

  /** Max badges to show before "+N more" (default: 3) */
  maxBadges?: number;

  /** Debounce delay in ms (default: 350) */
  debounceMs?: number;

  /** Custom class on the trigger button */
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: 'Select...',
  disabled: false,
  maxBadges: 3,
  debounceMs: 350,
  class: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: T | T[] | null];
}>();

// ─── Internal state ───────────────────────────────────────────────────────────

const open = ref(false);
const inputSearch = ref('');
const debouncedSearch = ref('');
const sentinelRef = ref<HTMLElement | null>(null);

const updateDebounced = useDebounceFn((val: string) => {
  debouncedSearch.value = val;
}, props.debounceMs);

watch(inputSearch, (val) => updateDebounced(val));

// Reset search when popover closes
watch(open, (isOpen) => {
  if (!isOpen) {
    inputSearch.value = '';
    debouncedSearch.value = '';
  }
});

// ─── Query ────────────────────────────────────────────────────────────────────

const { flatItems, hasMore, isFetchingNextPage, fetchNextPage, isLoading } = useInfiniteQuery<T>({
  ...props.queryOptions,
  search: debouncedSearch,
  enabled: open,
});

// ─── Infinite scroll sentinel ─────────────────────────────────────────────────

watch(sentinelRef, (el) => {
  if (!el) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value && !isFetchingNextPage.value) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(el);

  // Cleanup handled automatically when el unmounts (sentinelRef becomes null)
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLabel(item: T): string {
  if (typeof props.labelKey === 'function') return props.labelKey(item);
  return String((item as Record<string, unknown>)[props.labelKey as string] ?? '');
}

function getValueKey(item: T): string | number {
  if (typeof props.valueKey === 'function') return props.valueKey(item);
  return ((item as Record<string, unknown>)[props.valueKey as string] as string | number) ?? '';
}

function isSameItem(a: T, b: T): boolean {
  return getValueKey(a) === getValueKey(b);
}

// ─── Selection logic ──────────────────────────────────────────────────────────

const selectedArray = computed<T[]>(() => {
  if (props.multiple) return (props.modelValue as T[] | null) ?? [];
  return props.modelValue ? [props.modelValue as T] : [];
});

function isSelected(item: T): boolean {
  return selectedArray.value.some((s) => isSameItem(s, item));
}

function toggleItem(item: T): void {
  if (!props.multiple) {
    // Single mode: select and close
    const alreadySelected = isSelected(item);
    emit('update:modelValue', alreadySelected ? null : item);
    open.value = false;
    return;
  }

  // Multiple mode: toggle
  const current = [...selectedArray.value];
  const idx = current.findIndex((s) => isSameItem(s, item));
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(item);
  }
  emit('update:modelValue', current);
}

function removeItem(item: T, e: MouseEvent): void {
  e.stopPropagation();
  if (!props.multiple) {
    emit('update:modelValue', null);
    return;
  }
  const next = selectedArray.value.filter((s) => !isSameItem(s, item));
  emit('update:modelValue', next);
}

function clearAll(e: MouseEvent): void {
  e.stopPropagation();
  emit('update:modelValue', props.multiple ? [] : null);
}

// ─── Display ──────────────────────────────────────────────────────────────────

const visibleBadges = computed(() => selectedArray.value.slice(0, props.maxBadges));
const overflowCount = computed(() => Math.max(0, selectedArray.value.length - props.maxBadges));

const triggerLabel = computed(() => {
  if (!props.multiple && selectedArray.value[0]) {
    return getLabel(selectedArray.value[0]);
  }
  return null;
});
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="disabled"
        v-bind="$attrs"
        :class="cn('min-h-9 w-full justify-between px-3 font-normal', selectedArray.length > 0 ? 'h-auto' : 'h-9', props.class)"
      >
        <!-- Single mode display -->
        <template v-if="!multiple">
          <span :class="cn(!triggerLabel && 'text-muted-foreground')">
            {{ triggerLabel ?? placeholder }}
          </span>
        </template>

        <!-- Multiple mode display -->
        <template v-else>
          <div v-if="selectedArray.length > 0" class="flex flex-wrap gap-1 py-1">
            <Badge v-for="item in visibleBadges" :key="getValueKey(item)" variant="secondary" class="flex items-center gap-1 pr-1 text-xs">
              {{ getLabel(item) }}
              <button
                type="button"
                class="ml-0.5 rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                @click="removeItem(item, $event)"
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
            <Badge v-if="overflowCount > 0" variant="secondary" class="text-xs"> +{{ overflowCount }} more </Badge>
          </div>
          <span v-else class="text-muted-foreground">{{ placeholder }}</span>
        </template>

        <!-- Right icons -->
        <div class="ml-2 flex shrink-0 items-center gap-1">
          <button
            v-if="selectedArray.length > 0"
            type="button"
            class="rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            @click="clearAll($event)"
          >
            <X class="h-3.5 w-3.5" />
          </button>
          <Separator v-if="selectedArray.length > 0" orientation="vertical" class="h-4" />
          <ChevronsUpDown class="h-4 w-4 opacity-50" />
        </div>
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-(--reka-popover-trigger-width) min-w-(--reka-popover-trigger-width) p-0" align="start">
      <Command :filter-function="() => true" should-filter="false">
        <CommandInput v-model="inputSearch" :placeholder="`Search...`" class="h-9" />

        <CommandList class="max-h-60">
          <!-- Loading initial -->
          <div v-if="isLoading" class="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>

          <CommandEmpty v-else-if="flatItems.length === 0"> No results found. </CommandEmpty>

          <CommandGroup v-else>
            <CommandItem v-for="item in flatItems" :key="getValueKey(item)" :value="String(getValueKey(item))" @select="() => toggleItem(item)">
              <Check :class="cn('mr-2 h-4 w-4 shrink-0', isSelected(item) ? 'opacity-100' : 'opacity-0')" />
              <slot name="option" :item="item" :label="getLabel(item)">
                {{ getLabel(item) }}
              </slot>
            </CommandItem>

            <!-- Infinite scroll sentinel -->
            <div ref="sentinelRef" class="py-1">
              <div v-if="isFetchingNextPage" class="flex items-center justify-center py-2 text-xs text-muted-foreground">
                <Loader2 class="mr-1.5 h-3 w-3 animate-spin" />
                Loading more...
              </div>
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
