import { useTableFilter } from '~/layers/shared/app/composable/table/filters/useTableFilter';
import FilterRoleUsers from '../components/filters/FilterProjects.vue';

export function useTableFilterProjects() {
  const { state, filterRefs, queryParams, search } = useTableFilter({
    storeKey: 'TableFilterProjects',
    filterFields: ['role_id', 'is_active'],
    debounceSearch: 500,
    debounceFilters: 300,
    syncUrl: true,
  });

  const menuFilter = computed(() => [
    {
      component: FilterRoleUsers,
      props: {
        roleId: filterRefs.role_id.value,
        'onUpdate:roleId': (value: number | null) => {
          filterRefs.role_id.value = value;
        },
      },
    },
  ]);

  return {
    state,
    filterRefs,
    queryParams,
    search,
    menuFilter,
  };
}
