<script setup lang="ts">
import { TrashIcon } from 'lucide-vue-next';
import { defineComponent, h } from 'vue';
import { Table } from '~/layers/shared/app/components/fragments/table';
import type { BulkAction } from '~~/layers/shared/app/components/fragments/table';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import ProjectTableTopActions from './ProjectTableTopActions.vue';
import { useColumnProjects } from '~/layers/projects/app/composable/useColumnProjects.js';
import { useTableFilterProjects } from '../composable/useTableFilterProjects.js';
import { useTableStateProjects, type EditableProject } from '../composable/useTableStateProjects.js';
import { useGetProjects } from '../composable/useGetProjects.js';

const { queryParams, state, menuFilter, search } = useTableFilterProjects();
const { has } = usePermission();
const crud = useTableStateProjects();

const { data, isFetching, refetch } = useGetProjects(queryParams);

const canCreate = computed(() => has(PERMISSIONS.PROJECT.CREATE));
const canUpdate = computed(() => has(PERMISSIONS.PROJECT.UPDATE));
const canDelete = computed(() => has(PERMISSIONS.PROJECT.DELETE));

const serverRows = computed<EditableProject[]>(() =>
  (data.value?.data ?? []).map((project) => ({
    ...project,
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
  set: (value: EditableProject[]) => {
    crud.selectedRows.value = value;
  },
});

const bulkActions: BulkAction<EditableProject>[] = [
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
  useColumnProjects({
    canDelete: canDelete.value,
    crud,
  })
);

const TopActions = defineComponent({
  setup() {
    return () =>
      h(ProjectTableTopActions, {
        canCreate: canCreate.value,
        canUpdate: canUpdate.value,
        canDelete: canDelete.value,
        isFetching: isFetching.value,
        crud,
        onRefresh: refetch,
      });
  },
});

const handleExpandedRow = (project: EditableProject) => {
  return h('div', { class: 'space-y-1 p-4' }, [
    h('h3', { class: 'mb-2 font-semibold' }, project.title || 'New Project'),
    h('p', { class: 'text-sm' }, `Slug: ${project.slug || '-'}`),
    h('p', { class: 'text-sm' }, `Category: ${project.category?.name ?? '-'}`),
    h('p', { class: 'text-sm' }, `Mentor: ${project.mentor?.user?.name ?? '-'}`),
    h('p', { class: 'text-sm' }, `Status: ${project.status ?? '-'}`),
    h('p', { class: 'text-sm' }, `Access: ${project.accessType ?? '-'}`),
    h('p', { class: 'text-sm' }, `Price: ${project.currency ?? '-'} ${project.price ?? '-'}`),
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
    :column-ids="['select', 'title', 'slug', 'category', 'mentor', 'price', 'status', 'accessType', 'actions']"
    :bulk-actions="bulkActions"
    :top-actions="TopActions"
    :expanded-row="handleExpandedRow"
    :initial-column-visibility="{
      select: true,
      title: true,
      slug: true,
      category: true,
      mentor: true,
      price: true,
      status: true,
      accessType: true,
      actions: true,
    }"
    :menu-filter="menuFilter"
    :pagination="true"
  />
</template>
