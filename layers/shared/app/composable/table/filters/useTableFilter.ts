import { computed, ref, watch, nextTick } from 'vue';
import type { WritableComputedRef } from 'vue';
import type { LocationQueryValue, LocationQueryRaw } from 'vue-router';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useDebounceFn } from '../../useDebounceFn';
import { useTableFilterStore } from './useTableFilterStore';
import type {
  FilterFieldConfig,
  FilterFieldInput,
  FilterFieldType,
  FilterRefs,
  NormalizedFilterFieldConfig,
  QueryParamsFor,
  TableStateFor,
  UseTableFilterOptions,
  UseTableFilterReturn,
} from './index';
import type { SortOrder } from '../../../types/meta';

/**
 * Generic table filter + pagination hook with automatic URL sync
 * Handles: search, pagination, sorting, custom filters (number/boolean/string/array)
 * State is stored in a global Pinia store, so it persists across page navigation
 * within the same module. When leaving a different domain/module, state is reset
 * by default unless resetOnLeaveDomain is disabled.
 * Auto-detects field types from naming patterns. Type-safe coercion. Zero watcher loops.
 *
 * Type Auto-Detection (when using string field names):
 * - Fields ending with '_id', '_count', '_level', etc. -> number
 * - Fields starting with 'is_', 'has_', 'can_', etc. -> boolean
 * - Everything else -> string
 *
 * @example
 * // Auto-detected types (no explicit config needed)
 * const { state, search, filterRefs, queryParams } = useTableFilter({
 *   storeKey: 'TableFilterProducts',
 *   filterFields: [
 *     'category_id',      // Auto-detected as number (ends with _id)
 *     'user_id',          // Auto-detected as number (ends with _id)
 *     'is_active',        // Auto-detected as boolean (starts with is_)
 *     'sku',              // Auto-detected as string (no pattern match)
 *     'status',           // Auto-detected as string (no pattern match)
 *   ]
 * })
 *
 * @example
 * // Explicit types override auto-detection
 * const { state, search, filterRefs, queryParams } = useTableFilter({
 *   storeKey: 'TableFilterUsers',
 *   filterFields: [
 *     'category_id',                           // Auto-detected: number
 *     { name: 'status_code', type: 'string' }, // Explicit override: string
 *     { name: 'is_active', type: 'boolean' },  // Explicit: boolean
 *     { name: 'category_ids', type: 'array' }, // Explicit: array
 *   ]
 * })
 *
 * @example
 * // With default values and custom debounce
 * const { state, search, filterRefs, queryParams } = useTableFilter({
 *   storeKey: 'TableFilterOrders',
 *   filterFields: [
 *     { name: 'company_id', type: 'number', defaultValue: 1 },
 *     { name: 'status', type: 'string', debounceMs: 300 },
 *   ],
 *   debounceSearch: 800
 * })
 */
export function useTableFilter<const TFilterFields extends readonly FilterFieldInput[] = readonly []>(
  options: UseTableFilterOptions<TFilterFields>
): UseTableFilterReturn<TFilterFields> {
  const router = useRouter();
  const route = useRoute();
  const tableFilterStore = useTableFilterStore();

  const {
    storeKey,
    filterFields = [] as unknown as TFilterFields,
    debounceSearch = 500,
    debounceFilters = 500,
    syncUrl = true,
    resetOnLeaveDomain = true,
  } = options;

  // Normalize filter config to standard format
  const normalizedFilters = normalizeFilterConfig(filterFields);

  // Flags to prevent watcher loops
  const isUpdatingFromRoute = ref(false);

  const baseState = {
    page: Number(route.query.page) || 1,
    limit: Number(route.query.limit) || 10,
    search: (route.query.search ?? '') as string,
    sort_by: (route.query.sort_by ?? '') as string,
    sort_order: (route.query.sort_order ?? '') as string,
  };

  // Initialize filter fields in state with proper type coercion
  const filterState = normalizedFilters.reduce<Record<string, unknown>>((acc, fieldConfig) => {
    const { name, type, defaultValue = null } = fieldConfig;
    const routeValue = route.query[name];

    acc[name] = coerceValue(routeValue, type, defaultValue);
    return acc;
  }, {});

  const initialState = {
    ...baseState,
    ...filterState,
  } as TableStateFor<TFilterFields>;

  const table = tableFilterStore.initTable(storeKey, initialState);
  const searchInput = ref<string | undefined>(table.state.search ?? '');
  const state = computed({
    get: () => table.state,
    set: (value) => (table.state = value),
  }) as WritableComputedRef<TableStateFor<TFilterFields>>;

  // Create reactive refs for each filter (for v-model binding in components)
  const search = computed({
    get: () => searchInput.value,
    set: (value) => {
      searchInput.value = value;
    },
  });

  const filterRefs = normalizedFilters.reduce<Record<string, WritableComputedRef<unknown>>>((acc, fieldConfig) => {
    acc[fieldConfig.name] = computed({
      get: () => (state.value as Record<string, unknown>)[fieldConfig.name],
      set: (value) => {
        (state.value as Record<string, unknown>)[fieldConfig.name] = value;
      },
    });

    return acc;
  }, {}) as FilterRefs<TFilterFields>;

  const queryParams = computed(() => {
    const params: Record<string, unknown> = {
      page: state.value.page,
      limit: state.value.limit,
    };

    // Base fields
    if (state.value.search?.trim()) params.search = state.value.search;

    if (state.value.sort_by) params.sort_by = state.value.sort_by;
    if (state.value.sort_order) params.sort_order = state.value.sort_order as SortOrder;

    // Filter fields - only include if not null/undefined/empty
    normalizedFilters.forEach(({ name, type }) => {
      const value = (state.value as Record<string, unknown>)[name];

      // Skip null/undefined/empty values
      if (value === null || value === undefined || value === '') {
        return;
      }

      if (type === 'array') {
        if (Array.isArray(value) && value.length > 0) {
          // Vue Router will encode this as repeated query params
          params[name] = value;
        }
        return;
      }

      // Always include boolean false (it's a valid filter state)
      if (type === 'boolean' || value !== null) {
        params[name] = value;
      }
    });

    return params as QueryParamsFor<TFilterFields>;
  });

  /**
   * Reset all filters to null, keep pagination and sort
   */
  const resetFilters = (): void => {
    tableFilterStore.resetFilters(
      storeKey,
      normalizedFilters.map(({ name }) => name)
    );
  };

  // Watch search with debounce
  const debouncedSearch = useDebounceFn((value: string | undefined) => {
    state.value.search = value ?? '';
    state.value.page = 1;
  }, debounceSearch);

  watch(search, (newValue) => {
    if (isUpdatingFromRoute.value) return;
    debouncedSearch(newValue);
  });

  // Watch each filter field with debounce
  const debouncedFilterChange = useDebounceFn(() => {
    state.value.page = 1;
  }, debounceFilters);

  normalizedFilters.forEach((fieldConfig) => {
    const { name } = fieldConfig;
    const filterRef = (filterRefs as Record<string, WritableComputedRef<unknown> | undefined>)[name];
    if (!filterRef) return;

    watch(filterRef, () => {
      // Skip if this change came from route update
      if (isUpdatingFromRoute.value) return;

      debouncedFilterChange();
    });
  });

  // Watch sort_by and sort_order changes, reset page
  watch(
    () => state.value.sort_by,
    (newSort, oldSort) => {
      if (isUpdatingFromRoute.value) return;
      // Reset page only if sort actually changed (not on initial mount)
      if (oldSort !== undefined && newSort !== oldSort) {
        state.value.page = 1;
      }
    }
  );

  watch(
    () => state.value.sort_order,
    (newOrder, oldOrder) => {
      if (isUpdatingFromRoute.value) return;
      if (oldOrder !== undefined && newOrder !== oldOrder) {
        state.value.page = 1;
      }
    }
  );

  // Watch limit changes, reset page
  watch(
    () => state.value.limit,
    (newLimit, oldLimit) => {
      if (isUpdatingFromRoute.value) return;
      if (oldLimit !== undefined && newLimit !== oldLimit) {
        state.value.page = 1;
      }
    }
  );

  // Watch state -> update URL (if enabled)
  // Use async to wait for route watcher to complete first
  if (syncUrl) {
    watch(
      () => state.value,
      async () => {
        if (isUpdatingFromRoute.value) return;

        // Wait for route update watchers to finish before syncing back
        await nextTick();
        router.replace({ query: queryParams.value as LocationQueryRaw });
      },
      { deep: true }
    );
  }

  // Watch URL -> update state
  watch(
    () => route.query,
    (q) => {
      isUpdatingFromRoute.value = true;

      // Update base fields
      state.value.search = (q.search ?? '') as string;
      searchInput.value = state.value.search;
      state.value.page = Number(q.page);
      state.value.limit = Number(q.limit);
      state.value.sort_by = (q.sort_by ?? '') as string;
      state.value.sort_order = (q.sort_order ?? '') as string;

      // Update filter fields with proper type coercion
      normalizedFilters.forEach((fieldConfig) => {
        const { name, type } = fieldConfig;
        const value = q[name] !== undefined ? coerceValue(q[name], type, null) : null;

        (state.value as Record<string, unknown>)[name] = value;
      });

      // Use nextTick to ensure all state updates are done before unlocking
      nextTick(() => {
        isUpdatingFromRoute.value = false;
      });
    },
    { deep: true }
  );

  onBeforeRouteLeave((to) => {
    if (!resetOnLeaveDomain) return;

    const currentDomain = route.meta.domain;
    const targetDomain = to.meta.domain;

    if (currentDomain !== targetDomain) {
      tableFilterStore.clearTable(storeKey);
    }
  });

  return {
    state,
    search,
    filterRefs,
    queryParams,
    resetFilters,
  };
}

/**
 * Normalize filter config to standard FilterFieldConfig format
 * Auto-detects type from field name patterns:
 * - Ends with '_id', '_count', '_level', etc. -> 'number'
 * - Starts with 'is_', 'has_' -> 'boolean'
 * - Otherwise -> 'string'
 *
 * @private
 * @param {Array<FilterFieldConfig | string>} filterFields
 * @returns {FilterFieldConfig[]}
 */
function normalizeFilterConfig<const TFilterFields extends readonly FilterFieldInput[]>(filterFields: TFilterFields): NormalizedFilterFieldConfig[] {
  const normalized: NormalizedFilterFieldConfig[] = [];

  // Number field patterns
  const numberSuffixes = ['_id', '_count', '_level', '_year', '_month', '_day', '_score', '_rate', '_price', '_amount', '_quantity'] as const;
  const booleanPrefixes = ['is_', 'has_', 'can_', 'should_', 'will_'] as const;

  // Process filterFields (can be strings or objects)
  filterFields.forEach((field) => {
    if (typeof field === 'string') {
      // Auto-detect type from field name
      let detectedType: FilterFieldType = 'string'; // default to string

      // Check for boolean patterns
      const boolMatch = booleanPrefixes.some((prefix) => field.startsWith(prefix));
      if (boolMatch) {
        detectedType = 'boolean';
      }

      // Check for number patterns (takes precedence)
      const numMatch = numberSuffixes.some((suffix) => field.endsWith(suffix));
      if (numMatch) {
        detectedType = 'number';
      }

      normalized.push({ name: field, type: detectedType, defaultValue: null });
    } else if (typeof field === 'object' && field.name) {
      normalized.push({
        name: field.name,
        type: field.type || detectTypeFromName(field.name),
        defaultValue: field.defaultValue ?? null,
        debounceMs: field.debounceMs,
      });
    }
  });

  return normalized;
}

/**
 * Auto-detect field type from field name
 * @private
 * @param {string} fieldName
 * @returns {'number' | 'boolean' | 'string'}
 */
function detectTypeFromName(fieldName: string): 'number' | 'boolean' | 'string' {
  const numberSuffixes = ['_id', '_count', '_level', '_year', '_month', '_day', '_score', '_rate', '_price', '_amount', '_quantity'];
  const booleanPrefixes = ['is_', 'has_', 'can_', 'should_', 'will_'];

  // Check for boolean patterns
  const boolMatch = booleanPrefixes.some((prefix) => fieldName.startsWith(prefix));
  if (boolMatch) {
    return 'boolean';
  }

  // Check for number patterns
  const numMatch = numberSuffixes.some((suffix) => fieldName.endsWith(suffix));
  if (numMatch) {
    return 'number';
  }

  // Default to string
  return 'string';
}

/**
 * Coerce URL query value to correct type
 * @private
 * @param {any} value - URL query value (always string or undefined)
 * @param {'number' | 'boolean' | 'string'} type - Target type
 * @param {any} defaultValue - Default value if coercion fails
 * @returns {any} Coerced value
 */
function coerceValue(value: LocationQueryValue | LocationQueryValue[] | undefined, type: FilterFieldConfig['type'], defaultValue: unknown): unknown {
  if (value === undefined || value === '') return defaultValue ?? null;

  switch (type) {
    case 'number':
      return value !== null && value !== undefined ? Number(value) : null;

    case 'boolean':
      if (value === 'true') return true;
      if (value === 'false') return false;
      return defaultValue ?? null;

    case 'array':
      // Support:
      // - ?tags=a&tags=b  -> ['a','b']
      // - ?tags=a,b       -> ['a','b']
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',').filter(Boolean);
      return defaultValue ?? [];

    case 'string':
      return value ?? null;

    default:
      return value;
  }
}
