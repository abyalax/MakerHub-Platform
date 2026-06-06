import { unref, type Ref } from 'vue';
import type { Paginated } from '../types/meta';

// Extract the meta object type from Paginated interface
type PaginatedMeta = Paginated<unknown>['meta'];

export function useSequencePagination<T extends PaginatedMeta>(state: T | Ref<T>) {
  return (index: number): number => {
    const currentState = unref(state);
    const currentPage = currentState.currentPage || 1;
    const pageSize = currentState.itemsPerPage || 10;
    return (currentPage - 1) * pageSize + index + 1;
  };
}
