import type { ColumnDef } from '@tanstack/vue-table';
import type { Component } from 'vue';
import type { Paginated } from '~~/layers/shared/app/types/meta';

export { default as BulkActions } from './ui/BulkActions.vue';
export { default as ExpandButton } from './ui/ExpandButton.vue';
export { default as ColumnVisibilitySelector } from './ui/ColumnVisibilitySelector.vue';
export { default as FacetedFilter } from './ui/FacetedFilter.vue';
export { default as Table } from './ui/Table.vue';
export { default as TablePagination } from './ui/TablePagination.vue';

export interface Option {
  label: string;
  value: number;
}

export type Options = Option[];

export interface BulkAction<T = unknown> {
  icon: Component;
  label: string;
  onClick: (selectedRows: T[]) => void;
  disabled?: (selectedRows: T[]) => boolean;
}

export interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: Component;
}

export interface TableMenuFilterItem {
  component: Component;
  props?: Record<string, unknown>;
}

export interface TableFacetedFilter<T = unknown> {
  columnId: keyof T;
  title: string;
  options: FacetedFilterOption[];
}

export interface TableVirtualizer {
  virtualizeAt: number;
}

/** use new standar paginate structure */
export type TableData<T> = Paginated<T>;
/** allow partial data for consumers */
export type PartialTableData<T> = Partial<Paginated<T>>;

export interface TableProps<T = unknown> {
  bulkActions?: BulkAction<T>[];
  columns: ColumnDef<T>[];
  columnIds: string[];
  freezeColumnIds?: string[];
  data?: PartialTableData<T>;
  topActions?: Component;
  virtualizer?: TableVirtualizer;
  initialColumnVisibility?: Record<string, boolean>;
  perPageOptions?: Options;
  pagination?: { initialState?: Record<string, unknown> } | boolean;
  menuFilter?: Array<Component | TableMenuFilterItem>;
  facetedFilter?: TableFacetedFilter<T>[];
  expandedRow?: (record: T) => Component;
  onClickRow?: (data: T, event?: MouseEvent) => void;
}
