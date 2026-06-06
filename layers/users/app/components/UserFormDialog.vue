<script setup lang="ts">
import { Button } from '~/layers/shared/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/layers/shared/app/components/ui/dialog';
import { Input } from '~/layers/shared/app/components/ui/input';
import type { Role, User } from '../types';

const open = defineModel<boolean>('open', { default: false });
const props = defineProps<{
  user?: User | null;
  roles: Role[];
}>();

const form = reactive({
  name: '',
  email: '',
  password: '',
  roleIds: [] as number[],
});

const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
const isLoading = computed(() => isCreating.value || isUpdating.value);
const isEdit = computed(() => !!props.user);

watch(
  () => [open.value, props.user] as const,
  () => {
    if (!open.value) return;

    form.name = props.user?.name ?? '';
    form.email = props.user?.email ?? '';
    form.password = '';
    form.roleIds = props.user?.roles.map((role) => role.id) ?? [];
  },
  { immediate: true }
);

const toggleRole = (roleId: number, checked: boolean) => {
  form.roleIds = checked ? [...new Set([...form.roleIds, roleId])] : form.roleIds.filter((id) => id !== roleId);
};

const handleSubmit = async () => {
  if (isEdit.value && props.user) {
    await updateUser({
      id: props.user.id,
      payload: {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        roleIds: form.roleIds,
      },
    });
  } else {
    await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      roleIds: form.roleIds,
    });
  }

  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit User' : 'Create User' }}</DialogTitle>
        <DialogDescription>Manage user identity and role assignment.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label class="text-sm font-medium">Name</label>
          <Input v-model="form.name" required :disabled="isLoading" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <Input v-model="form.email" type="email" required :disabled="isLoading" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Password</label>
          <Input v-model="form.password" type="password" :required="!isEdit" :disabled="isLoading" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Roles</label>
          <div class="grid gap-2 rounded-md border p-3">
            <label v-for="role in roles" :key="role.id" class="flex items-center gap-2 text-sm">
              <input type="checkbox" :checked="form.roleIds.includes(role.id)" :disabled="isLoading" @change="toggleRole(role.id, ($event.target as HTMLInputElement).checked)" />
              <span>{{ role.name }}</span>
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
