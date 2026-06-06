import { defineStore } from 'pinia';
import type { StoredTable, TableFilterStoreState, TableState } from '.';

export const useTableFilterStore = defineStore('tableFilter', {
  state: (): TableFilterStoreState => ({
    tables: {},
  }),

  actions: {
    initTable<TState extends TableState>(key: string, initialState: TState): StoredTable<TState> {
      if (!this.tables[key]) {
        this.tables[key] = {
          state: initialState,
          defaultFilterCleared: false,
        };
      }

      return this.tables[key] as StoredTable<TState>;
    },

    /**
     * @param {string} key
     * @param {string[]} filterNames
     * @returns
     */
    resetFilters(key: string, filterNames: string[]): void {
      const table = this.tables[key];
      if (!table) return;

      filterNames.forEach((name) => {
        table.state[name] = null;
      });

      table.state.page = 1;
      table.defaultFilterCleared = true;
    },

    /**
     * @param {string} key
     */
    clearTable(key: string): void {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.tables[key];
    },
  },
});
