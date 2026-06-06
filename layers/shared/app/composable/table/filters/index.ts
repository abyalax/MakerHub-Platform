import type { ComputedRef, WritableComputedRef } from 'vue';
import type { SortOrder } from '../../../types/meta';

export type FilterFieldType = 'number' | 'boolean' | 'string' | 'array';

export type NumberFieldSuffix = '_id' | '_count' | '_level' | '_year' | '_month' | '_day' | '_score' | '_rate' | '_price' | '_amount' | '_quantity';

export type BooleanFieldPrefix = 'is_' | 'has_' | 'can_' | 'should_' | 'will_';

export type AutoDetectedFilterType<TName extends string> = TName extends `${string}${NumberFieldSuffix}`
  ? 'number'
  : TName extends `${BooleanFieldPrefix}${string}`
    ? 'boolean'
    : 'string';

export type FilterValueByType<TType extends FilterFieldType> = TType extends 'number'
  ? number | null | undefined
  : TType extends 'boolean'
    ? boolean | null | undefined
    : TType extends 'array'
      ? string[] | null | undefined
      : string | null | undefined;

/**
 * Filter field configuration with type information
 */
export interface FilterFieldConfig<TName extends string = string, TType extends FilterFieldType | undefined = FilterFieldType | undefined> {
  name: TName;
  /**
   * Data type: 'number' | 'boolean' | 'string' | 'array'
   * If omitted, auto-detected from field name:
   * - '_id', '_count', '_level' suffixes → 'number'
   * - 'is_', 'has_', 'can_' prefixes → 'boolean'
   * - Otherwise → 'string'
   */
  type?: TType;
  defaultValue?: unknown;
  debounceMs?: number;
}

export type FilterFieldInput = string | FilterFieldConfig<string, FilterFieldType | undefined>;

export type FilterFieldName<TField> = TField extends string ? TField : TField extends { name: infer TName extends string } ? TName : never;

export type FilterFieldResolvedType<TField> = TField extends string
  ? AutoDetectedFilterType<TField>
  : TField extends { type: infer TType extends FilterFieldType }
    ? TType
    : TField extends { name: infer TName extends string }
      ? AutoDetectedFilterType<TName>
      : 'string';

export type FilterFieldsState<TFilterFields extends readonly FilterFieldInput[]> = {
  [TField in TFilterFields[number] as FilterFieldName<TField>]: FilterValueByType<FilterFieldResolvedType<TField>>;
};

export type FilterRefs<TFilterFields extends readonly FilterFieldInput[]> = {
  [TField in TFilterFields[number] as FilterFieldName<TField>]: WritableComputedRef<FilterValueByType<FilterFieldResolvedType<TField>>>;
};

export type NormalizedFilterFieldConfig<TName extends string = string> = Required<
  Pick<FilterFieldConfig<TName, FilterFieldType>, 'name' | 'type' | 'defaultValue'>
> &
  Pick<FilterFieldConfig<TName, FilterFieldType>, 'debounceMs'>;

/**
 * Options to configure useTableFilter hook
 */
export interface UseTableFilterOptions<TFilterFields extends readonly FilterFieldInput[] = readonly FilterFieldInput[]> {
  /**
   * Identifier for the table filter state in the global Pinia store.
   * Required so state remains isolated per table/module.
   * Convention: use `TableFilter` + module name, for example
   * `useTableFilterProducts()` -> `TableFilterProducts`.
   */
  storeKey: string;

  /**
   * Filter field configurations or names
   * String fields are auto-typed based on naming patterns:
   * - 'category_id' → number (ends with _id)
   * - 'is_active' → boolean (starts with is_)
   * - 'sku' → string (no pattern)
   *
   * @example
   * // Simple auto-detection
   * filterFields: ['category_id', 'is_active', 'sku']
   *
   * @example
   * // Explicit override
   * filterFields: [
   *   'category_id',
   *   { name: 'is_active', type: 'boolean' },
   *   { name: 'status_code', type: 'string' }
   * ]
   */
  filterFields?: TFilterFields;

  /**
   * Debounce delay for search input in milliseconds
   * @default 500
   */
  debounceSearch?: number;

  /**
   * Debounce delay for filter changes in milliseconds
   * @default 500
   */
  debounceFilters?: number;

  /**
   * Sync state to URL query params
   * @default true
   */
  syncUrl?: boolean;

  /**
   * Reset table filter state when leaving a different domain/module.
   * @default true
   */
  resetOnLeaveDomain?: boolean;
}

/**
 * Query parameters object sent to API
 */
export type QueryParams<T extends Record<string, unknown> = Record<string, unknown>> = {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: SortOrder;
} & T;

export type QueryParamsFor<TFilterFields extends readonly FilterFieldInput[] = readonly FilterFieldInput[]> = QueryParams<
  Partial<FilterFieldsState<TFilterFields>>
>;

/**
 * Table state containing pagination, sorting, search, and filters
 */
export type TableState<T extends Record<string, unknown> = Record<string, unknown>> = {
  page: number;
  limit: number;
  search: string;
  sort_by: string;
  sort_order: string;
} & T;

export type TableStateFor<TFilterFields extends readonly FilterFieldInput[] = readonly FilterFieldInput[]> = TableState<
  FilterFieldsState<TFilterFields>
>;

/**
 * Return type of useTableFilter hook
 */
export interface UseTableFilterReturn<TFilterFields extends readonly FilterFieldInput[] = readonly FilterFieldInput[]> {
  /**
   * Reactive state object containing page, limit, search, sort, filters
   */
  state: WritableComputedRef<TableStateFor<TFilterFields>>;

  /**
   * Reactive ref for search input
   */
  search: WritableComputedRef<string | undefined>;

  /**
   * Object containing reactive refs for each filter field
   * Access with: filterRefs.category_id.value
   */
  filterRefs: FilterRefs<TFilterFields>;

  /**
   * Computed query parameters to send to API
   * Automatically filters out null/undefined values
   */
  queryParams: ComputedRef<QueryParamsFor<TFilterFields>>;

  /**
   * Reset all filters to null, keep pagination and sort
   */
  resetFilters: () => void;
}

export interface StoredTable<TState extends TableState = TableState> {
  state: TState;
  defaultFilterCleared: boolean;
}

export interface TableFilterStoreState {
  tables: Record<string, StoredTable>;
}
