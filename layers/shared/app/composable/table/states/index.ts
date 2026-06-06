// Symbol trick so TS doesn't complain on Omit
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rowKeySymbol = Symbol();
// ─── Types ────────────────────────────────────────────────────────────────────

export type InlineCrudRow<T> = T & {
  _tmpId?: string;
  _isNew?: boolean;
};

export interface InlineCrudOptions<T extends object> {
  /** Key of the field used as unique row identifier (e.g. 'id') */
  rowKey: keyof T;

  /** Maximum number of new (unsaved) rows allowed at once. Default: 5 */
  maxNewRows?: number;

  /** Maximum number of rows selectable for bulk edit. Default: 5 */
  maxSelectedRows?: number;

  /** Factory function that returns a blank row for creation */
  createDefaultRow: () => Omit<T, typeof rowKeySymbol>;

  /**
   * Called when user clicks Save.
   * Return true on success, false/throw on failure.
   */
  onSave: (payload: { created: InlineCrudRow<T>[]; updated: { id: T[keyof T]; changes: Partial<T> }[] }) => Promise<boolean>;

  /**
   * Called when user deletes existing rows.
   * Return true on success, false/throw on failure.
   */
  onDelete?: (rows: T[]) => Promise<boolean>;
}
