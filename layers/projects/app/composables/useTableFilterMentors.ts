import { useTableFilter } from '~/layers/shared/app/composable/table/filters/useTableFilter';

export function useTableFilterMentors() {
  const { state, filterRefs, queryParams, search } = useTableFilter({
    storeKey: 'TableFilterAdminMentors',
    filterFields: ['isActive', 'status'],
    debounceSearch: 500,
    debounceFilters: 300,
    syncUrl: true,
  });

  return {
    state,
    filterRefs,
    queryParams,
    search,
  };
}
