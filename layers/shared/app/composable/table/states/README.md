Generic composable untuk inline CRUD di atas reusable `<Table>` component.

## Setup

```ts
const crud = useInlineCrud<Product>({
  rowKey: 'id',
  createDefaultRow: () => ({ id: 0, name: '', price: 0, active: true }),
  onSave: async ({ created, updated }) => {
    await api.create(created);
    await api.update(updated); // { id, changes: Partial<T> }[]
    return true; // false = state tidak direset
  },
  onDelete: async (rows) => {
    await api.delete(rows.map((r) => r.id));
    return true;
  },
});
```

## Options

| Option             | Required | Description                                 |
| ------------------ | -------- | ------------------------------------------- |
| `rowKey`           | ✅       | Field unik identifier, e.g. `'id'`          |
| `createDefaultRow` | ✅       | Factory `() => T` untuk baris baru          |
| `onSave`           | ✅       | `async ({ created, updated }) => boolean`   |
| `onDelete`         | —        | `async (rows: T[]) => boolean`              |
| `maxNewRows`       | —        | Maks baris baru sekaligus. Default `5`      |
| `maxSelectedRows`  | —        | Maks baris terpilih untuk edit. Default `5` |

## State

| Ref             | Type                   | Description                     |
| --------------- | ---------------------- | ------------------------------- |
| `localRows`     | `Ref<T[]>`             | Baris baru belum disimpan       |
| `selectedRows`  | `Ref<T[]>`             | Baris existing yang dipilih     |
| `isEditMode`    | `Ref<boolean>`         | Mode edit aktif                 |
| `isLoading`     | `Ref<boolean>`         | Async op sedang berjalan        |
| `hasChanges`    | `ComputedRef<boolean>` | Ada perubahan belum disimpan    |
| `canAddRow`     | `ComputedRef<boolean>` | Di bawah limit `maxNewRows`     |
| `canEnableEdit` | `ComputedRef<boolean>` | 1–maxSelectedRows baris dipilih |

## Actions

| Method                               | Description                              |
| ------------------------------------ | ---------------------------------------- |
| `handleAdd()`                        | Tambah blank row di atas                 |
| `toggleSelect(row)`                  | Select/deselect existing row             |
| `clearSelection()`                   | Deselect semua                           |
| `enableEditMode()`                   | Aktifkan edit + snapshot original        |
| `disableEditMode()`                  | Keluar edit mode, edits tetap ada        |
| `handleFieldChange(row, field, val)` | Track perubahan field                    |
| `handleDelete(row)`                  | Hapus local row atau panggil `onDelete`  |
| `handleBulkDelete()`                 | Delete semua selected existing rows      |
| `handleSave()`                       | Persist semua changes, reset jika sukses |
| `handleCancel()`                     | Buang semua changes, reset state         |

## Helpers

| Method                      | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `isNewRow(row)`             | `_isNew` flag atau id prefixed `tmp-`           |
| `isRowSelected(row)`        | Row ada di `selectedRows`                       |
| `isRowEditable(row)`        | `isNew` OR (`editMode` AND `selected`)          |
| `getFieldValue(row, field)` | Edited value → original value                   |
| `getKey(row)`               | `_tmpId` untuk new row, `rowKey` untuk existing |

---

## Pola implementasi

**1. Table data — merge local + server rows**

```ts
const tableData = computed(() => ({
  data: [...crud.localRows.value, ...serverRows.value],
  meta: { ... },
}));
```

**2. Column cell — switch display vs input**

```ts
cell: ({ row }) => {
  const item = row.original;
  if (!crud.isRowEditable(item)) return h('span', item.name);
  return h(Input, {
    modelValue: crud.getFieldValue(item, 'name'),
    'onUpdate:modelValue': (v) => crud.handleFieldChange(item, 'name', v),
  });
};
```

**3. Top actions — wire ke derived state**

```ts
const TopActions = defineComponent(
  () => () =>
    h('div', { class: 'flex gap-2' }, [
      h(Button, { disabled: !crud.hasChanges.value, onClick: crud.handleSave }, () => 'Save'),
      h(Button, { disabled: !crud.hasChanges.value, onClick: crud.handleCancel }, () => 'Cancel'),
      h(Button, { disabled: !crud.canEnableEdit.value, onClick: crud.enableEditMode }, () => 'Edit'),
      h(Button, { disabled: !crud.canAddRow.value, onClick: crud.handleAdd }, () => 'Add Row'),
      crud.selectedRows.value.length > 0 && h(Button, { onClick: crud.handleBulkDelete }, () => 'Delete'),
    ])
);
```

**4. Pass ke Table**

```html
<table v-model:filter="filter" :data="tableData" :columns="columns" :top-actions="TopActions" />
```

---

## onSave payload

- `created` — local rows dengan edited fields merged in, siap dikirim ke create API
- `updated` — `{ id: T[rowKey], changes: Partial<T> }[]`, hanya rows yang benar-benar berubah (empty changes di-exclude otomatis)
  \_Last Update at 2026-05-15 19:55:20\_
