import { computed, ref } from 'vue';
import type { InlineCrudOptions, InlineCrudRow } from './index';

/**
 * useInlineCrud
 *
 * Generic composable for inline CRUD operations within a data table.
 * Manages local (new) rows, edit mode, change tracking, and orchestrates
 * create/update/delete API calls.
 *
 * Usage:
 *   const crud = useInlineCrud<Product>({
 *     rowKey: 'id',
 *     maxNewRows: 5,
 *     maxSelectedRows: 5,
 *     createDefaultRow: () => ({ name: '', price: 0, status: true }),
 *     onSave: async ({ created, updated }) => { ... },
 *     onDelete: async (rows) => { ... },
 *   });
 */

// ─── Composable ───────────────────────────────────────────────────────────────

let tmpCounter = 0;
const nextTmpId = () => `tmp-${++tmpCounter}`;

export function useInlineCrud<T extends object>(options: InlineCrudOptions<T>) {
  const { rowKey, maxNewRows = 5, maxSelectedRows = 5, createDefaultRow, onSave, onDelete } = options;

  // ── State ──────────────────────────────────────────────────────────────────

  /** New rows added locally, not yet persisted */
  const localRows = ref<InlineCrudRow<T>[]>([]);

  /** Currently selected existing rows (for edit/delete) */
  const selectedRows = ref<T[]>([]);

  /** Whether edit mode is active */
  const isEditMode = ref(false);

  /** Map of rowKey → modified field values */
  const editedData = ref<Record<string, Partial<T>>>({});

  /** Map of rowKey → original field values (snapshot before edit) */
  const originalData = ref<Record<string, Partial<T>>>({});

  /** Async loading flag */
  const isLoading = ref(false);

  // ── Derived ────────────────────────────────────────────────────────────────

  const hasChanges = computed(() => Object.keys(editedData.value).length > 0);

  const canAddRow = computed(() => localRows.value.length < maxNewRows);

  const canEnableEdit = computed(() => selectedRows.value.length > 0 && selectedRows.value.length <= maxSelectedRows);

  // ── Row Identity Helpers ───────────────────────────────────────────────────

  const getKey = (row: T | InlineCrudRow<T>): string => {
    const r = row as InlineCrudRow<T>;
    return r._tmpId ?? String((row as Record<string, unknown>)[rowKey as string]);
  };

  const isNewRow = (row: T | InlineCrudRow<T>): boolean => {
    const r = row as InlineCrudRow<T>;
    return !!r._isNew || !!r._tmpId;
  };

  const isRowSelected = (row: T): boolean => {
    const key = getKey(row);
    return selectedRows.value.some((r) => getKey(r as T) === key);
  };

  const isRowEditable = (row: T): boolean => {
    if (isNewRow(row)) return true;
    return isEditMode.value && isRowSelected(row);
  };

  // ── Selection ──────────────────────────────────────────────────────────────

  /**
   * Toggle row selection. Enforces maxSelectedRows limit.
   * Only existing rows are selectable (new rows are always editable).
   */
  const toggleSelect = (row: T): void => {
    if (isNewRow(row)) return;
    const key = getKey(row);
    const idx = selectedRows.value.findIndex((r) => getKey(r as InlineCrudRow<T>) === key);

    if (idx >= 0) {
      selectedRows.value = selectedRows.value.filter((_, i) => i !== idx);
    } else {
      if (selectedRows.value.length >= maxSelectedRows) return;
      selectedRows.value = [...selectedRows.value, row] as T[];
    }
  };

  const clearSelection = (): void => {
    selectedRows.value = [];
  };

  // ── Create ─────────────────────────────────────────────────────────────────

  /**
   * Add a blank new row to the top of the table.
   * New row is immediately editable.
   */
  const handleAdd = (): void => {
    if (!canAddRow.value) return;
    const tmpId = nextTmpId();
    const blank = createDefaultRow() as InlineCrudRow<T>;
    blank._tmpId = tmpId;
    blank._isNew = true;

    localRows.value = [blank, ...localRows.value] as InlineCrudRow<T>[];

    // Track it in editedData so it appears as "has changes"
    editedData.value = {
      ...editedData.value,
      [tmpId]: blank,
    };
  };

  // ── Edit Mode ──────────────────────────────────────────────────────────────

  /**
   * Enable edit mode for currently selected rows.
   * Takes a snapshot of original data for rollback support.
   */
  const enableEditMode = (): void => {
    if (!canEnableEdit.value) return;

    const snapshot: Record<string, Partial<T>> = {};
    for (const row of selectedRows.value) {
      const key = getKey(row as T);
      snapshot[key] = { ...(row as Partial<T>) };
    }

    originalData.value = { ...originalData.value, ...snapshot };
    isEditMode.value = true;
  };

  const disableEditMode = (): void => {
    isEditMode.value = false;
  };

  // ── Field Change ───────────────────────────────────────────────────────────

  /**
   * Called when user edits a field in an editable row.
   * Merges change into editedData keyed by row identifier.
   */
  const handleFieldChange = <K extends keyof T>(row: T, field: K, value: T[K]): void => {
    const key = getKey(row);
    editedData.value = {
      ...editedData.value,
      [key]: {
        ...editedData.value[key],
        [field]: value,
      },
    };
  };

  /**
   * Get the current display value for a field:
   * edited value → original row value
   */
  const getFieldValue = <K extends keyof T>(row: T, field: K): T[K] => {
    const key = getKey(row);
    const edited = editedData.value[key] as Partial<T> | undefined;
    if (edited && field in edited) return edited[field] as T[K];
    return (row as Record<string, unknown>)[field as string] as T[K];
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  /**
   * Delete a single row:
   * - New row: remove from localRows, clean editedData
   * - Existing row: call onDelete, then clear selection
   */
  const handleDelete = async (row: T): Promise<void> => {
    if (isNewRow(row)) {
      const key = getKey(row);
      localRows.value = localRows.value.filter((r) => getKey(r as InlineCrudRow<T>) !== key);
      const { [key]: _, ...rest } = editedData.value;
      editedData.value = rest;
      return;
    }

    if (!onDelete) return;
    isLoading.value = true;
    try {
      const ok = await onDelete([row]);
      if (ok) {
        selectedRows.value = selectedRows.value.filter((r) => getKey(r as InlineCrudRow<T>) !== getKey(row));
      }
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Bulk delete selected existing rows.
   */
  const handleBulkDelete = async (): Promise<void> => {
    const existingSelected = selectedRows.value.filter((r) => !isNewRow(r as T)) as T[];
    if (!onDelete || existingSelected.length === 0) return;

    isLoading.value = true;
    try {
      const ok = await onDelete(existingSelected);
      if (ok) clearSelection();
    } finally {
      isLoading.value = false;
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  /**
   * Save all pending changes:
   * - created: new localRows with their edited fields merged in
   * - updated: existing rows with field-level diffs
   */
  const handleSave = async (): Promise<boolean> => {
    if (!hasChanges.value) return true;

    // Build created payload
    const created = localRows.value.map((row) => {
      const key = getKey(row as InlineCrudRow<T>);
      return {
        ...row,
        ...editedData.value[key],
      } as InlineCrudRow<T>;
    });

    // Build updated payload (only existing rows that have edits)
    const updated = selectedRows.value
      .filter((row) => !isNewRow(row as T))
      .map((row) => {
        const key = getKey(row as InlineCrudRow<T>);
        return {
          id: (row as Record<string, unknown>)[rowKey as string] as T[keyof T],
          changes: editedData.value[key] ?? {},
        };
      })
      .filter((entry) => Object.keys(entry.changes).length > 0);

    isLoading.value = true;
    try {
      const ok = await onSave({ created, updated });
      if (ok) {
        resetState();
      }
      return ok;
    } catch {
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // ── Cancel / Rollback ──────────────────────────────────────────────────────

  /**
   * Discard all local changes and reset state.
   */
  const handleCancel = (): void => {
    resetState();
  };

  const resetState = (): void => {
    localRows.value = [];
    selectedRows.value = [];
    isEditMode.value = false;
    editedData.value = {};
    originalData.value = {};
  };

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    // State (readonly for consumers)
    localRows,
    selectedRows,
    isEditMode,
    editedData,
    isLoading,

    // Derived
    hasChanges,
    canAddRow,
    canEnableEdit,

    // Helpers
    getKey,
    isNewRow,
    isRowSelected,
    isRowEditable,
    getFieldValue,

    // Actions
    toggleSelect,
    clearSelection,
    handleAdd,

    enableEditMode,
    disableEditMode,

    handleFieldChange,
    handleDelete,
    handleBulkDelete,
    handleSave,
    handleCancel,
  };
}
