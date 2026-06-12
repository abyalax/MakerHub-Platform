<script setup lang="ts">
import { computed } from 'vue';
import { Edit, Plus, RefreshCw, Save, Trash2, X } from 'lucide-vue-next';
import { Button } from '~/layers/shared/app/components/ui/button';
import type { useTableStateProjects } from '../composable/useTableStateProjects';
import ProjectCreateModal from './create/ProjectCreateModal.vue';

const props = defineProps<{
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isFetching?: boolean;
  crud: ReturnType<typeof useTableStateProjects>;
  onRefresh: () => void;
}>();

const createOpen = ref<boolean>(false);

const selectedCount = computed(() => props.crud.selectedRows.value.length);
</script>

<template>
  <div class="flex items-center gap-2">
    <Button variant="outline" size="sm" :disabled="props.isFetching || props.crud.isLoading.value" @click="props.onRefresh">
      <RefreshCw class="w-4 h-4 mr-1" />
      Refresh
    </Button>

    <Button v-if="props.crud.hasChanges.value" variant="outline" size="sm" :disabled="props.crud.isLoading.value" @click="props.crud.handleCancel">
      <X class="w-4 h-4 mr-1" />
      Cancel
    </Button>

    <Button variant="default" size="sm" :disabled="!props.crud.hasChanges.value || props.crud.isLoading.value" @click="props.crud.handleSave">
      <Save class="w-4 h-4 mr-1" />
      {{ props.crud.isLoading.value ? 'Saving...' : 'Save' }}
    </Button>

    <Button
      v-if="props.canUpdate"
      :variant="props.crud.isEditMode.value ? 'secondary' : 'outline'"
      size="sm"
      :disabled="!props.crud.canEnableEdit.value || props.crud.isLoading.value"
      @click="props.crud.isEditMode.value ? props.crud.disableEditMode() : props.crud.enableEditMode()"
    >
      <Edit class="w-4 h-4 mr-1" />
      {{ props.crud.isEditMode.value ? 'Editing' : 'Edit' }}
    </Button>

    <Button
      v-if="props.canDelete && selectedCount > 0"
      variant="destructive"
      size="sm"
      :disabled="props.crud.isLoading.value"
      @click="props.crud.handleBulkDelete()"
    >
      <Trash2 class="w-4 h-4 mr-1" />
      Delete ({{ selectedCount }})
    </Button>

    <Button
      v-if="props.canCreate"
      variant="outline"
      size="sm"
      :disabled="props.crud.isLoading.value"
      @click="createOpen = true"
    >
      <Plus class="w-4 h-4 mr-1" />
      Add Project
    </Button>
  </div>
  <ProjectCreateModal v-model:open="createOpen" @created="props.onRefresh" />
</template>
