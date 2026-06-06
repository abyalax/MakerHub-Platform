<script setup lang="ts">
import { TrashIcon } from 'lucide-vue-next';
import { defineComponent, h } from 'vue';
import { Table } from '~/layers/shared/app/components/fragments/table';
import type { BulkAction } from '~~/layers/shared/app/components/fragments/table';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import type { EditableUser } from '../composables/useTableStateUsers';
import { useColumnUsers } from '../composables/useColumnUsers';
import UserTableTopActions from './UserTableTopActions.vue';

const { queryParams, state, menuFilter, search } = useTableFilterUsers();
const { has } = usePermission();
const crud = useTableStateUsers();

const { data, isFetching, refetch } = useGetUsers(queryParams);
const canCreate = computed(() => has(PERMISSIONS.USER.CREATE));
const canUpdate = computed(() => has(PERMISSIONS.USER.UPDATE));
const canDelete = computed(() => has(PERMISSIONS.USER.DELETE));

const serverRows = computed<EditableUser[]>(() =>
  (data.value?.data ?? []).map((user) => ({
    ...user,
    roleIds: user.roles.map((role) => role.id),
    isNewRow: false,
  }))
);

const tableData = computed(() => ({
  meta: data.value?.meta,
  links: data.value?.links,
  data: [...crud.localRows.value, ...serverRows.value],
}));

const selectedRowsModel = computed({
  get: () => crud.selectedRows.value,
  set: (value: EditableUser[]) => {
    crud.selectedRows.value = value;
  },
});

const bulkActions: BulkAction<EditableUser>[] = [
  {
    label: 'Delete Selected',
    icon: TrashIcon,
    disabled: () => !canDelete.value,
    onClick: async () => {
      await crud.handleBulkDelete();
    },
  },
];

const columns = computed(() =>
  useColumnUsers({
    canDelete: canDelete.value,
    crud,
  })
);

const TopActions = defineComponent({
  setup() {
    return () =>
      h(UserTableTopActions, {
        canCreate: canCreate.value,
        canUpdate: canUpdate.value,
        canDelete: canDelete.value,
        isFetching: isFetching.value,
        crud,
        onRefresh: refetch,
      });
  },
});

const handleExpandedRow = (user: EditableUser) => {
  return h('div', { class: 'p-4' }, [
    h('h3', { class: 'font-semibold mb-2' }, `Details for ${user.name || 'New user'}`),
    h('p', { class: 'text-sm' }, `Email: ${user.email || '-'}`),
    h('p', { class: 'text-sm' }, `Roles: ${user.roles.map((role) => role.name).join(', ') || '-'}`),
  ]);
};
</script>

<template>
  <Table
    v-model:filter="state"
    v-model:selected="selectedRowsModel"
    v-model:search="search"
    :data="tableData"
    :columns="columns"
    :column-ids="['select', 'name', 'email', 'password', 'roles', 'actions']"
    :bulk-actions="bulkActions"
    :top-actions="TopActions"
    :expanded-row="handleExpandedRow"
    :initial-column-visibility="{
      select: true,
      name: true,
      email: true,
      password: true,
      roles: true,
      actions: true,
    }"
    :menu-filter="menuFilter"
    :pagination="true"
  />
</template>
