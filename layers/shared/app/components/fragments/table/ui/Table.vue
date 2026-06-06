<script setup lang="ts" generic="T">
import type { Cell, Header, PaginationState, Row, RowSelectionState, SortingState, Updater } from '@tanstack/vue-table';
import { FlexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, useVueTable } from '@tanstack/vue-table';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { ArrowDown, ArrowUp, FunnelPlus } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useScrollPosition } from '../composable/use-scroll-position';
import { useCreateStickyColumnStyle } from '../composable/use-sticky-column-style';
import { useCreateStickyHeaderStyle } from '../composable/use-sticky-header-style';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/layers/shared/app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/layers/shared/app/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/layers/shared/app/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/layers/shared/app/components/ui/tooltip';

import type { AcceptableValue } from 'reka-ui';
import type { TableState } from '~/layers/shared/app/composable/table/filters';
import type { Component } from 'vue';
import BulkActions from './BulkActions.vue';
import ColumnVisibilitySelector from './ColumnVisibilitySelector.vue';
import FacetedFilter from './FacetedFilter.vue';
import TablePagination from './TablePagination.vue';
import type { TableMenuFilterItem, TableProps } from '../index';

const props = withDefaults(defineProps<TableProps<T>>(), {
  pagination: true,
  perPageOptions: () => [
    { label: '5 / page', value: 5 },
    { label: '10 / page', value: 10 },
    { label: '20 / page', value: 20 },
    { label: '30 / page', value: 30 },
    { label: '40 / page', value: 40 },
    { label: '50 / page', value: 50 },
    { label: '100 / page', value: 100 },
  ],
});

const search = defineModel<TableState['search'] | undefined>('search', {
  required: false,
  default: undefined,
});

const filter = defineModel<TableState>('filter', {
  required: true,
});

const selected = defineModel<Array<T>>('selected', {
  required: false,
  default: [],
});

const expanded = defineModel<Array<T>>('expanded', {
  required: false,
  default: [],
});

// Helper function to get unique row identifier
const getRowId = (row: T): string | number => {
  const rowWithId = row as T & { id?: string | number };
  return rowWithId.id ?? JSON.stringify(row);
};

// Manual expansion functions
const isRowExpanded = (row: T): boolean => {
  if (!Array.isArray(expanded.value)) {
    expanded.value = [];
    return false;
  }
  const rowId = getRowId(row);
  return expanded.value.some((item) => getRowId(item) === rowId);
};

const toggleRowExpansion = (row: T) => {
  if (!Array.isArray(expanded.value)) expanded.value = [];
  const rowId = getRowId(row);
  const isExpanded = expanded.value.some((item) => getRowId(item) === rowId);

  if (isExpanded) {
    expanded.value = expanded.value.filter((item) => getRowId(item) !== rowId);
  } else {
    expanded.value = [...expanded.value, row];
  }
};

const setExpanded = (updater: unknown) => {
  const newExpanded = typeof updater === 'function' ? updater(expanded.value) : updater;
  expanded.value = newExpanded as Array<T>;
};

const computedData = computed(() => {
  if (!props.data) return [];
  return props.data.data ?? [];
});

const computedPagination = computed(() => {
  if (!props.data) {
    return {
      itemsPerPage: 10,
      totalItems: 0,
      currentPage: 1,
      totalPages: 0,
      sortBy: [],
      searchBy: [],
      search: '',
      select: [],
    };
  }
  return props.data.meta;
});

const scrollRef = ref<HTMLElement | null>(null);
const { scrollLeft, scrollTop } = useScrollPosition(scrollRef);

const sorting = ref<SortingState>([]);
const globalFilter = ref<AcceptableValue | undefined>(undefined);
const rowSelection = ref<RowSelectionState>({});

const pageIndex = computed(() => Number(filter.value?.page ?? 1) - 1);
const pageSize = computed(() => Number(filter.value?.limit ?? 10));

const selectedPerPageValue = computed(() => String(filter.value?.limit ?? 10));
const selectedLabel = computed(() => props.perPageOptions?.find((opt) => String(opt.value) === selectedPerPageValue.value));
const selectedPerPageText = computed(() => selectedLabel.value?.label ?? `${selectedPerPageValue.value} / page`);

const getRowIdentity = (row: T, fallbackIndex?: number): string => {
  const rowWithId = row as T & { id?: string | number; _tmpId?: string };
  return String(rowWithId.id ?? rowWithId._tmpId ?? fallbackIndex ?? '');
};

const areSelectedRowsEqual = (left: T[], right: T[]): boolean => {
  if (left.length !== right.length) return false;
  return left.every((row, index) => {
    const rightRow = right[index];
    return rightRow !== undefined && getRowIdentity(row, index) === getRowIdentity(rightRow, index);
  });
};

const areRowSelectionEqual = (left: RowSelectionState, right: RowSelectionState): boolean => {
  const leftKeys = Object.keys(left)
    .filter((key) => left[key])
    .sort();
  const rightKeys = Object.keys(right)
    .filter((key) => right[key])
    .sort();
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key, index) => key === rightKeys[index]);
};

const normalizeRowSelection = (selection: RowSelectionState): RowSelectionState =>
  Object.fromEntries(Object.entries(selection).filter(([, selected]) => selected));

const headerStickyStyle = useCreateStickyHeaderStyle<T, unknown>(props.freezeColumnIds ?? [], scrollTop.value);
const bodyStickyStyle = useCreateStickyColumnStyle<T, unknown>(props.freezeColumnIds ?? []);

const onPaginationChange = (updater: Updater<PaginationState>) => {
  const next = typeof updater === 'function' ? updater({ pageIndex: pageIndex.value, pageSize: pageSize.value }) : updater;
  filter.value.page = next.pageIndex + 1;
  filter.value.limit = next.pageSize;
};

const serverSearch = (value: AcceptableValue) => {
  search.value = String(value || '');
  filter.value.page = 1;
  globalFilter.value = value;
};

const table = useVueTable<T>({
  columns: props.columns ?? [],
  enableRowSelection: true,
  enableMultiRowSelection: true,
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableMultiSort: false,

  getCoreRowModel: getCoreRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),

  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  pageCount: computedPagination.value?.totalPages,
  onPaginationChange: props.pagination ? onPaginationChange : undefined,
  onRowSelectionChange: (updater) => {
    const nextSelection = typeof updater === 'function' ? updater(rowSelection.value) : updater;
    const normalizedSelection = normalizeRowSelection(nextSelection as RowSelectionState);
    if (!areRowSelectionEqual(rowSelection.value, normalizedSelection)) {
      rowSelection.value = normalizedSelection;
    }
  },
  onExpandedChange: setExpanded,
  onGlobalFilterChange: serverSearch,
  getRowId: (originalRow, index) => {
    const rowWithId = originalRow as T & { id?: string | number; _tmpId?: string };
    return String(rowWithId.id ?? rowWithId._tmpId ?? index);
  },

  initialState: {
    columnVisibility: props.initialColumnVisibility,
    columnOrder: props.columnIds,
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get pagination() {
      return props.pagination
        ? {
            pageIndex: pageIndex.value,
            pageSize: pageSize.value,
          }
        : undefined;
    },
    get globalFilter() {
      return globalFilter.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
  get data() {
    return computedData.value;
  },
});

const resolvedMenuFilters = computed(() => props.menuFilter ?? []);

const isMenuFilterItem = (item: Component | TableMenuFilterItem): item is TableMenuFilterItem =>
  typeof item === 'object' && item !== null && 'component' in item;

const getMenuFilterComponent = (item: Component | TableMenuFilterItem): Component => (isMenuFilterItem(item) ? item.component : item);

const getMenuFilterProps = (item: Component | TableMenuFilterItem): Record<string, unknown> => (isMenuFilterItem(item) ? (item.props ?? {}) : {});

const setGlobalFilter = (value: AcceptableValue) => {
  serverSearch(value);
};

const handlePerPageChange = (value: AcceptableValue) => {
  filter.value.limit = Number(value);
};

const handleSortClick = (header: Header<T, unknown>) => {
  const column = header.column;
  const currentSort = sorting.value.find((s) => s.id === column.id);

  // state: undefined → asc
  if (currentSort === undefined) {
    sorting.value = [{ id: column.id, desc: false }];
    filter.value.sort_by = String(column.id);
    filter.value.sort_order = 'asc';
    return;
  }

  // state: asc → desc
  if (currentSort.desc === false) {
    sorting.value = [{ id: column.id, desc: true }];
    filter.value.sort_by = String(column.id);
    filter.value.sort_order = 'desc';
    return;
  }

  // state: desc → undefined (reset)
  sorting.value = [];
  filter.value.sort_by = '';
  filter.value.sort_order = '';
};

const handleRowClick = (row: Row<T>, event: MouseEvent) => {
  // Call the original onClickRow if provided
  if (props.onClickRow) {
    props.onClickRow(row.original, event);
  } else {
    // Only toggle row expansion if no custom onClickRow is provided
    if (props.expandedRow) toggleRowExpansion(row.original);
  }
};

const getHeaderForCell = (cell: Cell<T, unknown>): Header<T, unknown> => {
  const header = table?.getHeaderGroups()?.[0]?.headers[cell.column.getIndex()];
  if (!header) throw new Error(`Header not found for cell column ${cell.column.id}`);
  return header;
};

const getSortTooltip = (sorted: false | 'asc' | 'desc'): string => {
  if (sorted === false || sorted == null) return 'Sort Ascending';
  if (sorted === 'asc') return 'Sort Descending';
  if (sorted === 'desc') return 'Unsort by this column';
  return 'Sort by this column';
};

const rowCount = computed(() => table.getRowModel().rows.length);
const useVirtualization = computed(() => props.virtualizer && rowCount.value > props.virtualizer.virtualizeAt);

const virtualizer = useVirtualizer({
  count: rowCount.value,
  getScrollElement: () => scrollRef.value,
  estimateSize: () => 34,
  overscan: 20,
});

watch(
  () => globalFilter.value,
  (value) => {
    if (value !== undefined) table.setGlobalFilter(value);
  }
);

watch(
  () => rowSelection.value,
  (selection) => {
    const nextSelected = table
      .getRowModel()
      .rows.filter((row) => selection[row.id])
      .map((row) => row.original);
    if (!areSelectedRowsEqual(selected.value, nextSelected)) {
      selected.value = nextSelected;
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => selected.value,
  (newSelected) => {
    const selectedIds = new Set(newSelected.map((row, index) => getRowIdentity(row, index)));
    const nextSelection = table.getRowModel().rows.reduce<RowSelectionState>((acc, row) => {
      if (selectedIds.has(row.id)) acc[row.id] = true;
      return acc;
    }, {});

    if (!areRowSelectionEqual(rowSelection.value, nextSelection)) {
      rowSelection.value = nextSelection;
    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  const route = useRoute();
  const routePage = Number(route.query.page);
  const routeLimit = Number(route.query.limit);

  if (Number.isFinite(routePage) && routePage > 0) {
    filter.value.page = routePage;
  }
  if (Number.isFinite(routeLimit) && routeLimit > 0) {
    filter.value.limit = routeLimit;
  }

  if (route.query.search !== undefined) search.value = String(route.query.search || '');
  if (route.query.sort_by !== undefined) filter.value.sort_by = String(route.query.sort_by || '');
  if (route.query.sort_order !== undefined) filter.value.sort_order = String(route.query.sort_order || '');
});
</script>

<template>
  <main class="w-full flex flex-col gap-4">
    <!-- Table Controls -->
    <div class="flex items-end justify-between flex-wrap gap-3">
      <div class="flex gap-4 flex-wrap">
        <!-- Bulk Actions -->
        <BulkActions v-if="props.bulkActions?.length" :table="table" :bulk-actions="props.bulkActions" />

        <!-- Menu Filter -->
        <Popover v-if="resolvedMenuFilters.length">
          <PopoverTrigger as-child>
            <Button variant="outline" class="cursor-pointer">
              <FunnelPlus class="w-4 h-4 mr-2" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" style="width: fit-content">
            <div :class="`grid grid-cols-${resolvedMenuFilters.length > 1 ? 2 : 1} gap-2`">
              <div v-for="(item, index) in resolvedMenuFilters" :key="index" class="col-span-1">
                <component :is="getMenuFilterComponent(item)" v-bind="getMenuFilterProps(item)" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <!-- Search -->
        <div class="flex gap-md items-center justify-center" style="width: 300px">
          <Input placeholder="Search..." :model-value="(globalFilter as string) ?? ''" @update:model-value="setGlobalFilter" />
        </div>

        <!-- Faceted Filters -->
        <template v-for="faceted in props.facetedFilter" :key="String(faceted.columnId)">
          <FacetedFilter
            v-if="table.getColumn(String(faceted.columnId))"
            :column="table.getColumn(String(faceted.columnId))"
            :title="faceted.title"
            :options="faceted.options"
          />
        </template>
      </div>

      <!-- Top Actions -->
      <div class="flex gap-2 items-end justify-end flex-wrap">
        <component :is="props.topActions" v-if="props.topActions" />
        <ColumnVisibilitySelector v-if="props.initialColumnVisibility" :table="table" :column-ids="props.columnIds" />
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <div ref="scrollRef" class="overflow-x-auto overflow-y-scroll no-scrollbar max-h-[68vh] w-full rounded-md">
        <div class="relative">
          <Table>
            <TableHeader class="rounded-md">
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
                class="cursor-pointer rounded-md bg-background hover:bg-accent/50 group/row"
              >
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.index"
                  :col-span="header.colSpan"
                  :style="headerStickyStyle(header, scrollLeft)"
                  class="sticky-shadow h-14 cursor-pointer relative"
                >
                  <template v-if="header.column.accessorFn !== undefined">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div class="flex justify-between items-center w-full" @click="handleSortClick(header)">
                          <template v-if="!header.isPlaceholder">
                            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                            <ArrowUp v-if="header.column.getIsSorted() === 'asc'" class="w-4 h-4 ml-2" />
                            <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" class="w-4 h-4 ml-2" />
                          </template>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent class="z-100">
                        {{ getSortTooltip(header.column.getIsSorted()) }}
                      </TooltipContent>
                    </Tooltip>
                  </template>
                  <template v-else-if="!header.isPlaceholder">
                    <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                  </template>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <!-- Virtual Rows -->
              <template v-if="useVirtualization">
                <template v-for="virtualRow in virtualizer.getVirtualItems()" :key="virtualRow.key">
                  <template v-for="(row, rowIndex) in [table.getRowModel().rows[virtualRow.index]]" :key="row?.id">
                    <TableRow
                      v-if="row"
                      :key="row.id"
                      :data-state="row.getIsSelected() && 'selected'"
                      class="cursor-pointer bg-background hover:bg-secondary"
                      :style="{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start - rowIndex * virtualRow.size}px)`,
                      }"
                      @click="handleRowClick(row, $event)"
                    >
                      <TableCell
                        v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                        :style="
                          () => {
                            const header = getHeaderForCell(cell);
                            return bodyStickyStyle(header, scrollLeft, row.getIsSelected());
                          }
                        "
                        class="sticky-shadow h-14 relative"
                      >
                        <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                      </TableCell>
                    </TableRow>

                    <!-- Expanded Row -->
                    <tr
                      v-if="isRowExpanded(row?.original as T) && props.expandedRow"
                      :key="`expanded-${getRowId(row?.original as T)}`"
                      class="bg-muted"
                    >
                      <td :colspan="row?.getVisibleCells().length" class="p-0" style="width: 100%; padding: 0 !important">
                        <div style="width: 100%; display: block">
                          <component :is="props.expandedRow(row?.original as T)" />
                        </div>
                      </td>
                    </tr>
                  </template>
                </template>
              </template>

              <!-- Regular Rows -->
              <template v-else>
                <template v-for="row in table.getRowModel().rows" :key="row.id">
                  <TableRow
                    :data-state="row.getIsSelected() && 'selected'"
                    class="bg-background hover:bg-accent/50 group/row"
                    style="cursor: pointer"
                    @click="handleRowClick(row, $event)"
                  >
                    <TableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      :style="
                        () => {
                          const header = getHeaderForCell(cell);
                          return bodyStickyStyle(header, scrollLeft, row.getIsSelected());
                        }
                      "
                      class="sticky-shadow h-14 relative"
                    >
                      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    </TableCell>
                  </TableRow>

                  <!-- Expanded Row - Outside table structure -->
                  <tr v-if="isRowExpanded(row.original) && props.expandedRow" :key="`expanded-${getRowId(row.original)}`" class="bg-muted">
                    <td :colspan="row.getVisibleCells().length" class="p-0" style="width: 100%; padding: 0 !important">
                      <div style="width: 100%; display: block">
                        <component :is="props.expandedRow(row.original)" />
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </TableBody>

            <!-- Table Footer -->
            <TableFooter v-if="table.getFooterGroups().length > 0">
              <TableRow v-for="footerGroup in table.getFooterGroups()" :key="footerGroup.id">
                <TableHead
                  v-for="header in footerGroup.headers"
                  :key="header.index"
                  :col-span="header.colSpan"
                  :style="bodyStickyStyle(header, scrollLeft)"
                  class="sticky-shadow h-14 cursor-pointer relative"
                >
                  <FlexRender :render="header.column.columnDef.footer" :props="header.getContext()" />
                </TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="props.pagination" class="flex justify-end items-center mb-6">
      <div class="flex gap-2">
        <TablePagination
          :total-pages="computedPagination?.totalPages || 1"
          :current-page="computedPagination?.currentPage || 1"
          @page-change="(page) => table.setPageIndex(page - 1)"
          @next-page="table.nextPage"
          @previous-page="table.previousPage"
        />

        <Select :model-value="selectedPerPageValue" @update:model-value="handlePerPageChange">
          <SelectTrigger :key="selectedPerPageText" class="w-32.5 h-8">
            <SelectValue>
              {{ selectedPerPageText }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in props.perPageOptions" :key="option.value" :value="String(option.value)">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </main>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.sticky-shadow {
  position: relative;
}

.sticky-shadow::after {
  content: '';
  position: absolute;
  top: 0;
  right: -1px;
  width: 1px;
  height: 100%;
  background: var(--sticky-shadow);
  opacity: 0.1;
}

/* Force expanded row to take full width */
.expanded-row-full-width {
  width: 100% !important;
  max-width: 100% !important;
  table-layout: fixed !important;
}

.expanded-row-full-width td {
  width: 100% !important;
  max-width: 100% !important;
}
</style>
