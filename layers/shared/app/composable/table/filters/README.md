# useTableFilter Hook

A reusable Vue 3 composable for managing table state, filters, pagination, sorting, and URL synchronization. Provides automatic type detection, debouncing, and zero watcher loops.

## Features

- **Automatic URL sync** - State synchronized with query parameters
- **Type detection** - Auto-detects field types from naming patterns
- **Debouncing** - Built-in debouncing for search and filters
- **Zero watcher loops** - Prevents infinite reactivity cycles
- **Type-safe coercion** - Proper type conversion from URL strings
- **Flexible configuration** - Support for both `sort` and `sort_by` APIs

## Quick Start

```js
import { useTableFilter } from '@/hooks/filters/useTableFilter';

// Basic usage with auto-detected types
const { state, search, filterRefs, queryParams, updateOptions } = useTableFilter({
  filterFields: [
    'category_id', // Auto-detected as number (ends with _id)
    'is_active', // Auto-detected as boolean (starts with is_)
    'sku', // Auto-detected as string
  ],
});
```

## API Reference

### Options

```ts
interface UseTableFilterOptions {
  filterFields?: Array<FilterFieldConfig | string>;
  sortParam?: 'sort' | 'sort_by'; // Default: 'sort_by'
  debounceSearch?: number; // Default: 500ms
  debounceFilters?: number; // Default: 500ms
  syncUrl?: boolean; // Default: true
}
```

### Filter Field Configuration

```ts
interface FilterFieldConfig {
  name: string;
  type?: 'number' | 'boolean' | 'string' | 'array';
  defaultValue?: any;
  debounceMs?: number;
}
```

### Return Value

```ts
interface UseTableFilterReturn {
  state: TableState; // Reactive state object
  search: Ref<string>; // Search input ref
  filterRefs: { [key: string]: Ref<any> }; // Filter refs for v-model
  sortByModel: Ref<SortByModel[]>; // Vuetify sort model
  queryParams: ComputedRef<QueryParams>; // API query parameters
  updateOptions: (options) => void; // Table options handler
  resetFilters: () => void; // Reset all filters
}
```

## Type Auto-Detection

The hook automatically detects field types from naming patterns:

### Number Detection

Fields ending with these suffixes are detected as `number`:

- `_id`, `_count`, `_level`, `_year`, `_month`, `_day`
- `_score`, `_rate`, `_price`, `_amount`, `_quantity`

### Boolean Detection

Fields starting with these prefixes are detected as `boolean`:

- `is_`, `has_`, `can_`, `should_`, `will_`

### String Detection

All other fields default to `string` type.

## Examples

### Example 1: Auto-Detection (Recommended)

```js
// All field types auto-detected from naming patterns
export function useTableFilterProducts() {
  return useTableFilter({
    filterFields: [
      'category_id', // Auto: number
      'brand_id', // Auto: number
      'is_active', // Auto: boolean
      'is_featured', // Auto: boolean
      'sku', // Auto: string
      'name', // Auto: string
    ],
    sortParam: 'sort_by',
    debounceSearch: 800,
  });
}
```

### Example 2: Explicit Type Override

```js
// Override auto-detection when needed
export function useTableFilterUsers() {
  return useTableFilter({
    filterFields: [
      'user_id', // Auto: number
      { name: 'postal_code', type: 'number' }, // Override: number
      { name: 'is_code', type: 'string' }, // Override: string (not boolean)
      { name: 'tracking_id', type: 'string' }, // Override: string (not number)
      { name: 'tracked_ids', type: 'array' }, // Override: array
      'can_edit', // Auto: boolean
    ],
    sortParam: 'sort',
  });
}
```

### Example 3: With Default Values

```js
// Set default values for filters
export function useTableFilterOrders() {
  return useTableFilter({
    filterFields: [
      { name: 'status', type: 'string', defaultValue: 'pending' },
      { name: 'priority', type: 'string', defaultValue: 'normal' },
      { name: 'min_amount', type: 'number', defaultValue: 0 },
      { name: 'is_urgent', type: 'boolean', defaultValue: false },
    ],
    debounceSearch: 600,
    debounceFilters: 300,
  });
}
```

### Example 4: Array Filters

```js
// Handle array filters (multi-select)
export function useTableFilterProducts() {
  return useTableFilter({
    filterFields: [
      { name: 'categories', type: 'array' }, // Multi-select categories
      { name: 'tags', type: 'array' }, // Multi-select tags
      'brand_id', // Single brand filter
    ],
  });
}
```

### Example 5: Custom Debounce

```js
// Different debounce timings per field
export function useTableFilterSearch() {
  return useTableFilter({
    filterFields: [
      { name: 'search_query', type: 'string', debounceMs: 1000 }, // Slow search
      { name: 'category', type: 'string', debounceMs: 200 }, // Fast filter
      { name: 'price_range', type: 'string', debounceMs: 500 }, // Medium
    ],
    debounceSearch: 300, // Global search debounce
    debounceFilters: 200, // Global filter debounce
  });
}
```

## Usage in Components

### Vue Component Example

```vue
<script setup>
import { useTableFilter } from '@/hooks/filters/useTableFilter';

const { state, search, filterRefs, sortByModel, queryParams, updateOptions } = useTableFilter({
  filterFields: [{ name: 'status', type: 'string', defaultValue: 'active' }, { name: 'category_id', type: 'number' }, 'is_featured'],
  sortParam: 'sort',
});

// Use queryParams for API calls
const { data, loading } = await fetchProducts(queryParams.value);
</script>

<template>
  <!-- Search Input -->
  <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" clearable />

  <!-- Filter Selects -->
  <v-select v-model="filterRefs.status.value" :items="['active', 'inactive', 'pending']" label="Status" />

  <v-select v-model="filterRefs.category_id.value" :items="categories" item-value="id" item-title="name" label="Category" />

  <v-checkbox v-model="filterRefs.is_featured.value" label="Featured Only" />

  <!-- Data Table -->
  <v-data-table-server
    v-model:page="state.page"
    v-model:items-per-page="state.limit"
    v-model:sort-by="sortByModel"
    :items="data?.items || []"
    :loading="loading"
    @update:options="updateOptions"
  />
</template>
```

## Advanced Usage

### Custom URL Parameter Names

```js
// Map internal field names to different URL parameter names
export function useTableFilterLegacy() {
  const { state, queryParams } = useTableFilter({
    filterFields: ['status', 'category'],
    syncUrl: true, // Still sync to URL
  });

  // Custom URL mapping if needed
  const customQueryParams = computed(() => ({
    ...queryParams.value,
    // Map to legacy API parameter names
    status_filter: queryParams.value.status,
    cat_id: queryParams.value.category,
  }));

  return { state, queryParams: customQueryParams };
}
```

### Conditional Filters

```js
// Add/remove filters based on conditions
export function useTableFilterDynamic(hasAdvancedFilters) {
  const baseFields = ['search', 'status'];
  const advancedFields = ['category', 'brand', 'price_range'];

  return useTableFilter({
    filterFields: [...baseFields, ...(hasAdvancedFilters ? advancedFields : [])],
  });
}
```

_Last Update at 2026-05-15 19:55:20_
