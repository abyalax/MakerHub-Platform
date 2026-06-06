# Shared CRUD Table Pattern

This document defines the reusable CRUD table pattern for feature layers.
Use it when a table supports inline create, edit, save, cancel, and delete.

## Goal

All CRUD tables should share the same structure:

- feature table component composes data, filters, columns, selection, expansion, and actions
- feature state composable wraps `useInlineCrud()`
- feature column composable uses shared CRUD column helpers where possible
- feature-specific editors stay inside the feature layer
- shared table primitives stay in `layers/shared`
- create flow uses inline blank rows and column-rendered editors, not separate form blocks above the table

The reference implementation is:

- `layers/example/app/components/TableEvents.vue`
- `layers/example/app/composables/useTableStateEvents.ts`
- `layers/example/app/composables/useColumnEvents.ts`

The broader rule for all feature `Table*` components is the same: keep the table shell thin and move column definitions into a dedicated composable for that feature.

## Shared Exports

Shared CRUD table helpers live in:

```text
layers/shared/app/composable/table/crud/index.ts
```

Exports:

- `CrudRowController<T>`: minimal row-editing contract consumed by column components.
- `CrudTableState<T>`: full table CRUD state/action contract returned by `useInlineCrud()`.
- `createCrudSelectColumn(crud)`: select column that renders `New` for unsaved rows.
- `createCrudExpandColumn(expanded, options)`: expand column backed by a shared `expanded` ref.
- `createCrudDeleteColumn(crud)`: row action column for delete.
- `crudCellControlProps`: reusable `onClick` and `onFocus` stop-propagation props for editors.
- `stopCrudCellEvent(event)`: standalone event helper.

## File Shape

For a CRUD feature, use this shape:

```text
app/components/Table<Feature>.vue
app/components/<Feature>TableTopActions.vue
app/components/RowDetail<Feature>.vue
app/composables/useTableState<Feature>.ts
app/composables/useTableFilter<Feature>.ts
app/composables/useColumn<Feature>.ts
app/composables/useGet<Feature>.ts
app/composables/useCreate<Feature>.ts
app/composables/useUpdate<Feature>.ts
app/composables/useDelete<Feature>.ts
app/types/index.ts
```

## State Composable

Feature CRUD state should wrap `useInlineCrud()`.

```ts
export const useTableStateFeature = () => {
  const createMutation = useCreateFeature();
  const updateMutation = useUpdateFeature();
  const deleteMutation = useDeleteFeature();

  return useInlineCrud<Feature>({
    rowKey: 'id',
    maxNewRows: 5,
    maxSelectedRows: 5,
    createDefaultRow: () => ({
      id: '',
      name: '',
      status: 'draft',
    }),
    onSave: async ({ created, updated }) => {
      for (const row of created) {
        await createMutation.mutateAsync(toCreatePayload(row));
      }

      for (const row of updated) {
        await updateMutation.mutateAsync({
          id: row.id,
          payload: row.changes,
        });
      }

      return true;
    },
    onDelete: async (rows) => {
      await deleteMutation.mutateAsync(rows.map((row) => row.id));
      return true;
    },
  });
};
```

Keep domain mapping in this composable:

- default row values
- create payload conversion
- update payload conversion
- delete id extraction
- lookup helpers such as status labels or category names

## Table Component

The table component is the composition root.

```ts
const expanded = ref<Feature[]>([]);
const selected = ref<Feature[]>([]);

const crud = useTableStateFeature();
const { queryParams, state } = useTableFilterFeature();
const { data } = useGetFeature(queryParams);

const tableData = computed(() => ({
  meta: data.value?.meta,
  links: data.value?.links,
  data: [...crud.localRows.value, ...(data.value?.data || [])],
}));

const columns = useColumnFeature({ crud, expanded });
```

Rules:

- merge `crud.localRows.value` before server rows
- keep `expanded` and `selected` in the table component
- pass top actions as a render function
- keep page components thin

## Create Flow

Creation should follow the same inline pattern used by `layers/example`:

1. `handleAdd()` inserts a blank row at the top of the table.
2. The column composable renders inputs/selects for `crud.isRowEditable(row)`.
3. Top actions expose `Add`, `Save`, and `Cancel` only for CRUD tables.
4. Non-create navigation or workflow actions should also live in a dedicated feature-owned top-actions component, not inline in the table page template.
5. All create-related inputs stay inside the table columns, a row detail surface, or another feature-owned editor surface.

Current examples:

- `layers/users/app/components/TableUsers.vue`
- `layers/users/app/composables/useColumnUsers.ts`
- `layers/vendors/app/components/TableVendors.vue`
- `layers/vendors/app/composables/useColumnVendors.ts`
- `layers/shared/app/components/fragments/table/ui/CrudInlineTopActions.vue`
- `layers/purchase-orders/app/components/PurchaseOrderTableTopActions.vue`
- `layers/qcf/app/components/TableQcf.vue`
- `layers/qcf/app/composables/useColumnQcf.ts`
- `layers/qcf/app/composables/useTableStateQcf.ts`
- `layers/finance/app/components/TableInvoices.vue`
- `layers/finance/app/composables/useColumnInvoices.ts`
- `layers/finance/app/composables/useTableStateInvoices.ts`
- `layers/warehouse/app/components/TableGoodsReceipts.vue`
- `layers/warehouse/app/composables/useColumnGoodsReceipts.ts`
- `layers/warehouse/app/composables/useTableStateGoodsReceipts.ts`
- `layers/purchase-requisitions/app/components/TablePurchaseRequisitions.vue`
- `layers/purchase-requisitions/app/composables/useColumnPurchaseRequisitions.ts`
- `layers/purchase-requisitions/app/composables/useTableStatePurchaseRequisitions.ts`
- `layers/rfq/app/components/TableRfqs.vue`
- `layers/rfq/app/composables/useColumnRfqs.ts`
- `layers/rfq/app/composables/useTableStateRfqs.ts`

## Column Composable

Start each CRUD column set with shared columns:

```ts
export const useColumnFeature = ({ crud, expanded }: Params): ColumnDef<Feature>[] => [
  createCrudSelectColumn(crud),
  createCrudExpandColumn(expanded),
  // feature columns...
  createCrudDeleteColumn(crud),
];
```

For editable cells:

```ts
cell: ({ row }) => {
  const item = row.original;

  if (!crud.isRowEditable(item)) {
    return h('span', item.name);
  }

  return h(Input, {
    modelValue: crud.getFieldValue(item, 'name'),
    'onUpdate:modelValue': (value: string | number) => crud.handleFieldChange(item, 'name', String(value)),
    ...crudCellControlProps,
  });
};
```

Column rules:

- read-only mode formats existing values
- edit mode always reads through `crud.getFieldValue(...)`
- edit mode always writes through `crud.handleFieldChange(...)`
- inputs, selects, and focusable controls should use `crudCellControlProps`
- custom upload/media editors may stay as feature components

## What Should Be Shared

Put behavior in `layers/shared` only when it is domain-neutral:

- select column behavior
- expand column behavior
- delete action column behavior
- cell event propagation helpers
- generic inline CRUD state
- generic filter state

Keep behavior in the feature layer when it is domain-specific:

- payload mapping
- option lists and label lookup
- badges with domain statuses
- custom media upload behavior
- row detail layout
- feature top-action labels

## Migration Checklist

For each existing CRUD table:

- identify the table component, state composable, and column composable
- replace ad-hoc selected/new-row column logic with `createCrudSelectColumn`
- replace ad-hoc expansion logic with `createCrudExpandColumn`
- replace simple delete action columns with `createCrudDeleteColumn`
- replace duplicated input/select stop-propagation handlers with `crudCellControlProps`
- replace separate create form blocks with inline rows driven by `useInlineCrud()`
- move any remaining create-only inputs out of the table header and into column renderers or a feature-owned editor surface
- keep domain-specific editor rendering in the feature column composable
- verify `useInlineCrud()` owns add/edit/save/cancel/delete state
- run the nearest table tests or `pnpm test:run` when the change is broad

## Non-Goals

This pattern does not make every column fully declarative.
Dense table editors often need domain-specific render functions, validation, upload state, and display formatting.
The shared layer should remove repeated mechanics, not hide feature behavior behind a generic abstraction that is hard to debug.
_Last Updated at 24 May 2026_
