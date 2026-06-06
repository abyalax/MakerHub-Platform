<script setup lang="ts">
import { defineComponent, h } from 'vue';
import { Edit, Plus, RefreshCw, Save, Trash2, X } from 'lucide-vue-next';
import { Button } from '~/layers/shared/app/components/ui/button';
import type { useTableStateUsers } from '../composables/useTableStateUsers';

const props = defineProps<{
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isFetching?: boolean;
  crud: ReturnType<typeof useTableStateUsers>;
  onRefresh: () => void;
}>();

const selectedCount = computed(() => props.crud.selectedRows.value.length);

const TopActions = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            disabled: props.isFetching || props.crud.isLoading.value,
            onClick: props.onRefresh,
          },
          () => [h(RefreshCw, { class: 'w-4 h-4 mr-1' }), 'Refresh']
        ),
        props.crud.hasChanges.value &&
          h(
            Button,
            {
              variant: 'outline',
              size: 'sm',
              disabled: props.crud.isLoading.value,
              onClick: props.crud.handleCancel,
            },
            () => [h(X, { class: 'w-4 h-4 mr-1' }), 'Cancel']
          ),
        h(
          Button,
          {
            variant: 'default',
            size: 'sm',
            disabled: !props.crud.hasChanges.value || props.crud.isLoading.value,
            onClick: props.crud.handleSave,
          },
          () => [h(Save, { class: 'w-4 h-4 mr-1' }), props.crud.isLoading.value ? 'Saving...' : 'Save']
        ),
        props.canUpdate &&
          h(
            Button,
            {
              variant: props.crud.isEditMode.value ? 'secondary' : 'outline',
              size: 'sm',
              disabled: !props.crud.canEnableEdit.value || props.crud.isLoading.value,
              onClick: props.crud.isEditMode.value ? props.crud.disableEditMode : props.crud.enableEditMode,
            },
            () => [h(Edit, { class: 'w-4 h-4 mr-1' }), props.crud.isEditMode.value ? 'Editing' : 'Edit']
          ),
        props.canDelete &&
          selectedCount.value > 0 &&
          h(
            Button,
            {
              variant: 'destructive',
              size: 'sm',
              disabled: props.crud.isLoading.value,
              onClick: () => props.crud.handleBulkDelete(),
            },
            () => [h(Trash2, { class: 'w-4 h-4 mr-1' }), `Delete (${selectedCount.value})`]
          ),
        props.canCreate &&
          h(
            Button,
            {
              variant: 'outline',
              size: 'sm',
              disabled: !props.crud.canAddRow.value || props.crud.isLoading.value,
              onClick: props.crud.handleAdd,
            },
            () => [h(Plus, { class: 'w-4 h-4 mr-1' }), 'Add User']
          ),
      ]);
  },
});
</script>

<template>
  <TopActions />
</template>
