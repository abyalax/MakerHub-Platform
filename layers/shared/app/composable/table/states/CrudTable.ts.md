```vue
<script setup lang="ts">
/**
 * ProductTable.vue
 *
 * Example of inline CRUD implemented on top of the reusable <Table> component.
 * Zero changes to Table.vue — all CRUD logic lives in:
 *   - useInlineCrud composable (state)
 *   - column definitions (cell render)
 *   - this component's topActions slot
 */

import type { ColumnDef } from '@tanstack/vue-table';
import { Edit, Plus, Save, Trash2, X } from 'lucide-vue-next';
import { computed, defineComponent, h, ref } from 'vue';

import { Table } from '~/layers/table/index'; // adjust import path
import { useInlineCrud } from '~/layers/table/composable/use-inline-crud'; // adjust import path

import { Badge } from '~/layers/shared/app/components/ui/badge';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '~/layers/shared/app/components/ui/select';
import { Switch } from '~/layers/shared/app/components/ui/switch';

// ─── Domain Type ──────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

// ─── Mock Data & API ──────────────────────────────────────────────────────────

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

const mockData = ref<Product[]>([
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1200, active: true },
  { id: 2, name: 'T-Shirt Basic', category: 'Clothing', price: 20, active: true },
  { id: 3, name: 'Coffee Beans', category: 'Food', price: 15, active: false },
  { id: 4, name: 'Vue.js Book', category: 'Books', price: 40, active: true },
  { id: 5, name: 'Wireless Mouse', category: 'Electronics', price: 45, active: true },
]);

// Simulate API calls
const apiCreate = async (rows: Partial<Product>[]) => {
  await new Promise((r) => setTimeout(r, 600));
  let nextId = Math.max(...mockData.value.map((p) => p.id)) + 1;
  for (const row of rows) {
    mockData.value.push({ id: nextId++, ...(row as Product) });
  }
};

const apiUpdate = async (updates: { id: number; changes: Partial<Product> }[]) => {
  await new Promise((r) => setTimeout(r, 600));
  for (const { id, changes } of updates) {
    const idx = mockData.value.findIndex((p) => p.id === id);
    if (idx >= 0) Object.assign(mockData.value[idx], changes);
  }
};

const apiDelete = async (ids: number[]) => {
  await new Promise((r) => setTimeout(r, 400));
  mockData.value = mockData.value.filter((p) => !ids.includes(p.id));
};

// ─── Filter State (required by Table) ────────────────────────────────────────

const filter = ref({ page: 1, limit: 10, search: '', sort_by: '', sort_order: '' });

const tableData = computed(() => ({
  data: [...crud.localRows.value, ...mockData.value],
  meta: {
    total: mockData.value.length,
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
  },
}));

// ─── CRUD Composable ──────────────────────────────────────────────────────────

const crud = useInlineCrud<Product>({
  rowKey: 'id',
  maxNewRows: 5,
  maxSelectedRows: 5,

  createDefaultRow: () => ({
    id: 0, // placeholder; real id assigned by server
    name: '',
    category: '',
    price: 0,
    active: true,
  }),

  onSave: async ({ created, updated }) => {
    try {
      if (created.length) await apiCreate(created);
      if (updated.length) await apiUpdate(updated as { id: number; changes: Partial<Product> }[]);
      return true;
    } catch {
      return false;
    }
  },

  onDelete: async (rows) => {
    try {
      await apiDelete(rows.map((r) => r.id));
      return true;
    } catch {
      return false;
    }
  },
});

// ─── Column Definitions ───────────────────────────────────────────────────────

/**
 * Each cell uses crud helpers to decide whether to render a static value
 * or an editable input — no changes to Table.vue required.
 */
const columns: ColumnDef<Product>[] = [
  // Checkbox column (leverages built-in table selection)
  {
    id: 'select',
    header: () => h('span', 'Select'),
    cell: ({ row }) => {
      const product = row.original;
      if (crud.isNewRow(product)) return h('span', { class: 'text-xs text-muted-foreground' }, 'New');
      return h('input', {
        type: 'checkbox',
        checked: crud.isRowSelected(product),
        onChange: () => crud.toggleSelect(product),
        class: 'w-4 h-4 cursor-pointer',
      });
    },
    size: 60,
  },

  // Name column
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const product = row.original;
      if (!crud.isRowEditable(product)) return h('span', product.name);
      return h(Input, {
        modelValue: crud.getFieldValue(product, 'name'),
        'onUpdate:modelValue': (v: string) => crud.handleFieldChange(product, 'name', v),
        placeholder: 'Product name',
        class: 'h-8',
      });
    },
    size: 220,
  },

  // Category column
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const product = row.original;
      if (!crud.isRowEditable(product)) return h('span', product.category || '—');
      return h(
        Select,
        {
          modelValue: crud.getFieldValue(product, 'category'),
          'onUpdate:modelValue': (v: string) => crud.handleFieldChange(product, 'category', v),
        },
        {
          default: () => [
            h(SelectTrigger, { class: 'h-8 w-36' }, () => h('span', crud.getFieldValue(product, 'category') || 'Select…')),
            h(SelectContent, {}, () => CATEGORIES.map((cat) => h(SelectItem, { key: cat, value: cat }, () => cat))),
          ],
        }
      );
    },
    size: 180,
  },

  // Price column
  {
    accessorKey: 'price',
    header: 'Price (USD)',
    cell: ({ row }) => {
      const product = row.original;
      if (!crud.isRowEditable(product)) return h('span', `$${product.price.toFixed(2)}`);
      return h(Input, {
        type: 'number',
        modelValue: crud.getFieldValue(product, 'price'),
        'onUpdate:modelValue': (v: string) => crud.handleFieldChange(product, 'price', Number(v)),
        placeholder: '0',
        class: 'h-8 w-28',
      });
    },
    size: 140,
  },

  // Status column
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => {
      const product = row.original;
      const value = crud.getFieldValue(product, 'active');

      if (!crud.isRowEditable(product)) {
        return h(Badge, { variant: value ? 'default' : 'secondary' }, () => (value ? 'Active' : 'Inactive'));
      }

      return h('div', { class: 'flex items-center gap-2' }, [
        h(Switch, {
          checked: value,
          'onUpdate:checked': (v: boolean) => crud.handleFieldChange(product, 'active', v),
        }),
        h('span', { class: 'text-xs' }, value ? 'Active' : 'Inactive'),
      ]);
    },
    size: 130,
  },

  // Actions column
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const product = row.original;
      return h('div', { class: 'flex gap-1' }, [
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            class: 'h-8 w-8 text-destructive hover:text-destructive',
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              crud.handleDelete(product);
            },
          },
          () => h(Trash2, { class: 'w-4 h-4' })
        ),
      ]);
    },
    size: 80,
  },
];

const columnIds = ['select', 'name', 'category', 'price', 'active', 'actions'];

// ─── Top Actions Component ────────────────────────────────────────────────────

/**
 * Rendered inside the Table's topActions slot.
 * Contains all CRUD action buttons with appropriate disabled states.
 */
const TopActions = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'flex items-center gap-2' }, [
        // Cancel — shown when there are unsaved changes
        crud.hasChanges.value &&
          h(
            Button,
            {
              variant: 'outline',
              size: 'sm',
              onClick: crud.handleCancel,
              disabled: crud.isLoading.value,
            },
            () => [h(X, { class: 'w-4 h-4 mr-1' }), 'Cancel']
          ),

        // Save — enabled when there are pending changes
        h(
          Button,
          {
            variant: 'default',
            size: 'sm',
            disabled: !crud.hasChanges.value || crud.isLoading.value,
            onClick: crud.handleSave,
          },
          () => [crud.isLoading.value ? h('span', { class: 'animate-spin mr-1' }, '⟳') : h(Save, { class: 'w-4 h-4 mr-1' }), 'Save']
        ),

        // Edit — enabled when rows are selected
        h(
          Button,
          {
            variant: crud.isEditMode.value ? 'secondary' : 'outline',
            size: 'sm',
            disabled: !crud.canEnableEdit.value || crud.isLoading.value,
            onClick: crud.isEditMode.value ? crud.disableEditMode : crud.enableEditMode,
          },
          () => [h(Edit, { class: 'w-4 h-4 mr-1' }), crud.isEditMode.value ? 'Editing…' : 'Edit']
        ),

        // Delete selected — bulk delete existing rows
        crud.selectedRows.value.length > 0 &&
          h(
            Button,
            {
              variant: 'destructive',
              size: 'sm',
              disabled: crud.isLoading.value,
              onClick: crud.handleBulkDelete,
            },
            () => [h(Trash2, { class: 'w-4 h-4 mr-1' }), `Delete (${crud.selectedRows.value.length})`]
          ),

        // Add row
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            disabled: !crud.canAddRow.value || crud.isEditMode.value || crud.isLoading.value,
            onClick: crud.handleAdd,
          },
          () => [h(Plus, { class: 'w-4 h-4 mr-1' }), 'Add Row']
        ),
      ]);
  },
});
</script>

<template>
  <Table v-model:filter="filter" :columns="columns" :column-ids="columnIds" :data="tableData" :top-actions="TopActions" :pagination="false" />
</template>
```

_Last Update at 2026-05-15 19:55:20_
