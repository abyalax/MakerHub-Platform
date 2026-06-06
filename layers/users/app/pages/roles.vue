<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import Page from '~~/layers/shared/app/components/layouts/Page.vue';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Input } from '~/layers/shared/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/layers/shared/app/components/ui/table';
import type { Role } from '../types';

definePageMeta({
  middleware: 'authorization',
  requiresAuth: true,
  requiresPermissions: [PERMISSIONS.ROLE.READ],
});

const search = ref('');
const queryParams = computed(() => ({
  page: 1,
  limit: 50,
  search: search.value,
}));

const { has } = usePermission();
const { data: rolesData, isFetching, refetch } = useGetRoles(queryParams);
const { data: permissionsData } = useGetPermissions();
const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole();

const formOpen = ref(false);
const editingRole = ref<Role | null>(null);
const roles = computed(() => rolesData.value?.data ?? []);
const permissions = computed(() => permissionsData.value ?? []);
const canCreate = computed(() => has(PERMISSIONS.ROLE.CREATE));
const canUpdate = computed(() => has(PERMISSIONS.ROLE.UPDATE));
const canDelete = computed(() => has(PERMISSIONS.ROLE.DELETE));

const openCreate = () => {
  editingRole.value = null;
  formOpen.value = true;
};

const openEdit = (role: Role) => {
  editingRole.value = role;
  formOpen.value = true;
};

const handleDelete = async (role: Role) => {
  if (!confirm(`Delete role ${role.name}?`)) return;
  await deleteRole(role.id);
};
</script>

<template>
  <Page title="Roles" :breadcrumbs="[{ title: 'Roles', url: '/roles', active: true }]">
    <template #children>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Input v-model="search" class="max-w-sm" placeholder="Search roles..." />
          <div class="flex gap-2">
            <Button variant="outline" :disabled="isFetching" @click="refetch">Refresh</Button>
            <Button v-if="canCreate" :disabled="isFetching || isDeleting" @click="openCreate">
              <Plus class="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </div>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead class="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="role in roles" :key="role.id">
                <TableCell class="font-medium">{{ role.name }}</TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-1">
                    <RoleBadge v-for="permission in role.permissions" :key="permission.id" :role="permission.key" />
                    <span v-if="!role.permissions?.length" class="text-sm text-muted-foreground">No permissions</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button v-if="canUpdate" variant="outline" size="sm" @click="openEdit(role)">Edit</Button>
                    <Button v-if="canDelete" variant="destructive" size="sm" :disabled="isDeleting" @click="handleDelete(role)">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="roles.length === 0">
                <TableCell colspan="3" class="h-24 text-center text-muted-foreground">No roles found.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <RoleFormDialog v-model:open="formOpen" :role="editingRole" :permissions="permissions" />
      </div>
    </template>
  </Page>
</template>
