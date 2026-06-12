<script setup lang="ts">
import { Button } from '~/layers/shared/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/layers/shared/app/components/ui/dialog';
import { Input } from '~/layers/shared/app/components/ui/input';
import type { Permission, Role } from '~/layers/users/types';

const open = defineModel<boolean>('open', { default: false });
const props = defineProps<{
  role?: Role | null;
  permissions: Permission[];
}>();

const form = reactive({
  name: '',
  permissionIds: [] as number[],
});

const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
const isLoading = computed(() => isCreating.value || isUpdating.value);
const isEdit = computed(() => !!props.role);

watch(
  () => [open.value, props.role] as const,
  () => {
    if (!open.value) return;

    form.name = props.role?.name ?? '';
    form.permissionIds = props.role?.permissions?.map((permission) => permission.id) ?? [];
  },
  { immediate: true }
);

const togglePermission = (permissionId: number, checked: boolean) => {
  form.permissionIds = checked ? [...new Set([...form.permissionIds, permissionId])] : form.permissionIds.filter((id) => id !== permissionId);
};

const handleSubmit = async () => {
  if (isEdit.value && props.role) {
    await updateRole({
      id: props.role.id,
      payload: {
        name: form.name,
        permissionIds: form.permissionIds,
      },
    });
  } else {
    await createRole({
      name: form.name,
      permissionIds: form.permissionIds,
    });
  }

  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit Role' : 'Create Role' }}</DialogTitle>
        <DialogDescription>Assign permissions to this role.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label class="text-sm font-medium">Name</label>
          <Input v-model="form.name" required :disabled="isLoading" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Permissions</label>
          <div class="grid max-h-80 gap-2 overflow-auto rounded-md border p-3 sm:grid-cols-2">
            <label v-for="permission in permissions" :key="permission.id" class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                :checked="form.permissionIds.includes(permission.id)"
                :disabled="isLoading"
                @change="togglePermission(permission.id, ($event.target as HTMLInputElement).checked)"
              />
              <span>{{ permission.name }}</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="isLoading" @click="open = false">Cancel</Button>
          <Button type="submit" :disabled="isLoading">{{ isLoading ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
