<script lang="ts" setup>
import InfiniteSelect from '~/layers/shared/app/components/fragments/input/select/InfiniteSelect.vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Role } from '~/layers/users/types';

const roleId = defineModel<number | null>('roleId', {
  required: true,
});

const http = useHttp();

const fetchRoles = async (params: { page: number; limit: number; search: string }): Promise<Paginated<Role>> => {
  const response = await http<TResponse<Paginated<Role>>>(ENDPOINT.ROLES, {
    method: 'GET',
    query: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
    },
  });

  return response.data;
};

const selectedRole = ref<Role | null>(null);

watch(
  roleId,
  async (value) => {
    if (value === null) {
      selectedRole.value = null;
      return;
    }

    if (selectedRole.value?.id === value) return;

    const response = await http<TResponse<Role>>(`${ENDPOINT.ROLES}/${value}`, {
      method: 'GET',
    });

    if (roleId.value === value) {
      selectedRole.value = response.data;
    }
  },
  { immediate: true }
);

watch(selectedRole, (value) => {
  const nextRoleId = value?.id ?? null;

  if (roleId.value !== nextRoleId) {
    roleId.value = nextRoleId;
  }
});
</script>

<template>
  <InfiniteSelect
    v-model="selectedRole"
    class="h-8 w-40"
    placeholder="All Roles"
    label-key="name"
    value-key="id"
    data-testid="users-role-filter"
    :query-options="{
      queryKey: [QUERY_KEY.ROLES_LIST],
      fetcher: fetchRoles,
      limit: 20,
    }"
  />
</template>
