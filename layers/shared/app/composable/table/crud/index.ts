import type { ColumnDef } from '@tanstack/vue-table';
import type { Component, ComputedRef, Ref } from 'vue';
import { h } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import CheckboxHeader from '~/layers/shared/app/components/fragments/input/CheckboxHeader.vue';
import CheckboxCell from '~/layers/shared/app/components/fragments/input/CheckboxCell.vue';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Switch } from '~/layers/shared/app/components/ui/switch';
import { ExpandButton } from '~/layers/shared/app/components/fragments/table';

export type CrudRowKey = string | number;

export type CrudRowController<T extends object> = {
  isNewRow: (row: T) => boolean;
  isRowEditable: (row: T) => boolean;
  getFieldValue: <K extends keyof T>(row: T, field: K) => T[K];
  handleFieldChange: <K extends keyof T>(row: T, field: K, value: T[K]) => void;
  handleDelete: (row: T) => void | Promise<void>;
};

type CrudStateRef<T> = Ref<T> | ComputedRef<T>;

export type CrudTableState<T extends object> = CrudRowController<T> & {
  localRows: Ref<T[]>;
  selectedRows: Ref<T[]>;
  isEditMode: Ref<boolean>;
  editedData: Ref<Record<string, Partial<T>>>;
  isLoading: Ref<boolean>;
  hasChanges: CrudStateRef<boolean>;
  canAddRow: CrudStateRef<boolean>;
  canEnableEdit: CrudStateRef<boolean>;
  getKey: (row: T) => string;
  isRowSelected: (row: T) => boolean;
  toggleSelect: (row: T) => void;
  clearSelection: () => void;
  handleAdd: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  handleBulkDelete: () => void | Promise<void>;
  handleSave: () => boolean | Promise<boolean>;
  handleCancel: () => void;
};

type RowKeyGetter<T extends object> = (row: T) => CrudRowKey;

const defaultGetRowKey = <T extends object>(row: T): CrudRowKey => {
  const record = row as Record<string, unknown>;
  return String(record._tmpId ?? record.id ?? '');
};

export const stopCrudCellEvent = (event: MouseEvent | FocusEvent): void => {
  event.stopPropagation();
};

export const crudCellControlProps = {
  onClick: stopCrudCellEvent,
  onFocus: stopCrudCellEvent,
};

export const createCrudSelectColumn = <T extends object>(
  crud: Pick<CrudRowController<T>, 'isNewRow'>,
  options?: {
    newRowLabel?: string;
    size?: number;
  }
): ColumnDef<T> => ({
  id: 'select',
  header: (context) =>
    h(CheckboxHeader, {
      context: { table: context.table },
    }),
  cell: (context) => {
    const item = context.row.original;
    if (crud.isNewRow(item)) return h('span', { class: 'text-xs text-muted-foreground' }, options?.newRowLabel ?? 'New');
    return h(CheckboxCell, {
      context: { row: context.row },
    });
  },
  enableSorting: false,
  enableHiding: false,
  size: options?.size ?? 50,
});

export const createCrudExpandColumn = <T extends object>(
  expanded: Ref<T[]>,
  options?: {
    getRowKey?: RowKeyGetter<T>;
    size?: number;
  }
): ColumnDef<T> => {
  const getRowKey = options?.getRowKey ?? defaultGetRowKey;

  const isRowExpanded = (row: T): boolean => {
    const key = getRowKey(row);
    return expanded.value.some((item) => getRowKey(item) === key);
  };

  const toggleRowExpansion = (row: T): void => {
    const key = getRowKey(row);
    if (isRowExpanded(row)) {
      expanded.value = expanded.value.filter((item) => getRowKey(item) !== key);
      return;
    }

    expanded.value = [...expanded.value, row];
  };

  return {
    id: 'expand',
    header: () => null,
    cell: ({ row }) =>
      h(ExpandButton, {
        expanded: isRowExpanded(row.original),
        'onUpdate:expanded': () => toggleRowExpansion(row.original),
        key: `expand-${String(getRowKey(row.original))}`,
      }),
    enableSorting: false,
    enableHiding: false,
    size: options?.size ?? 40,
  };
};

export const createCrudDeleteColumn = <T extends object>(
  crud: Pick<CrudRowController<T>, 'handleDelete'>,
  options?: {
    id?: string;
    header?: string;
    icon?: Component;
    size?: number;
  }
): ColumnDef<T> => ({
  id: options?.id ?? 'actions',
  header: options?.header ?? 'Actions',
  size: options?.size ?? 80,
  cell: ({ row }) => {
    const Icon = options?.icon ?? Trash2;

    return h('div', { class: 'flex gap-1' }, [
      h(
        Button,
        {
          variant: 'ghost',
          size: 'icon',
          class: 'h-8 w-8 text-destructive hover:text-destructive',
          onClick: (event: MouseEvent) => {
            event.stopPropagation();
            void crud.handleDelete(row.original);
          },
        },
        () => h(Icon, { class: 'w-4 h-4' })
      ),
    ]);
  },
});

export const createCrudStatusToggleColumn = <
  T extends object,
  K extends keyof T,
  TActive extends T[K],
  TInactive extends T[K],
>(
  crud: Pick<CrudRowController<T>, 'handleFieldChange'>,
  options: {
    field: K;
    activeValue: TActive;
    inactiveValue: TInactive;
    activeLabel: string;
    inactiveLabel: string;
    onToggle?: (row: T, value: T[K]) => void | Promise<void>;
    id?: string;
    header?: string;
    size?: number;
  }
): ColumnDef<T> => ({
  id: options.id ?? `${String(options.field)}-toggle`,
  header: options.header ?? 'Status',
  size: options.size ?? 110,
  cell: ({ row }) => {
    const item = row.original;
    const value = item[options.field];
    const isActive = value === options.activeValue;
    const nextValue = isActive ? options.inactiveValue : options.activeValue;

    return h('div', { class: 'flex items-center gap-2' }, [
      h(Switch, {
        modelValue: isActive,
        ...(options.onToggle
          ? {
              onClick: (event: MouseEvent) => {
                stopCrudCellEvent(event);
                void options.onToggle?.(item, nextValue);
              },
              onFocus: stopCrudCellEvent,
            }
          : {
              'onUpdate:modelValue': (checked: boolean) =>
                crud.handleFieldChange(item, options.field, (checked ? options.activeValue : options.inactiveValue) as T[K]),
              ...crudCellControlProps,
            }),
      }),
      h('span', { class: 'text-xs font-medium' }, isActive ? options.activeLabel : options.inactiveLabel),
    ]);
  },
  enableSorting: false,
  enableHiding: false,
});
