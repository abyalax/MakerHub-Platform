<script setup lang="ts">
import { computed } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import InfiniteSelect from '~/layers/shared/app/components/fragments/input/select/InfiniteSelect.vue';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Role } from '../../types/index.js';

interface Props {
  user: EditableUser;
  crud: {
    getFieldValue: <K extends keyof EditableUser>(row: EditableUser, field: K) => EditableUser[K];
    handleFieldChange: <K extends keyof EditableUser>(row: EditableUser, field: K, value: EditableUser[K]) => void;
  };
  controlProps?: Record<string, unknown>;
}

const props = defineProps<Props>();

const http = useHttp();

async function fetchRoles(options: { page: number; limit: number; search: string }): Promise<Paginated<Role>> {
  const response = await http<TResponse<Paginated<Role>>>(ENDPOINT.ROLES, {
    method: 'GET',
    query: {
      page: options.page,
      limit: options.limit,
      search: options.search || undefined,
    },
  });

  return response.data;
}

// Compute values derived from table row state safely
const selectedRoles = computed(() => {
  return (props.crud.getFieldValue(props.user, 'roles') as Role[]) ?? [];
});

// Update logic that updates both the array and the corresponding ID list
function handleUpdate(value: Role[] | Role | null) {
  const nextRoles = Array.isArray(value) ? value : value ? [value] : [];

  props.crud.handleFieldChange(props.user, 'roles', nextRoles);
  props.crud.handleFieldChange(
    props.user,
    'roleIds',
    nextRoles.map((role) => role.id)
  );
}
</script>

<template>
  <InfiniteSelect
    :model-value="selectedRoles"
    :multiple="true"
    placeholder="Select roles"
    label-key="name"
    value-key="id"
    class="min-w-72"
    v-bind="controlProps"
    :query-options="{
      queryKey: [QUERY_KEY.ROLES_LIST],
      fetcher: fetchRoles,
      limit: 20,
    }"
    @update:model-value="handleUpdate"
  />
</template>
