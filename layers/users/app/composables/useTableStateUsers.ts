import { useQueryClient } from '@tanstack/vue-query';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useInlineCrud } from '~/layers/shared/app/composable/table/states/useInlineCrud';
import type { Role, User } from '../types';

export type EditableUser = User & {
  password?: string;
  roleIds?: number[];
  isNewRow: boolean;
};

export const useTableStateUsers = () => {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  const crud = useInlineCrud<EditableUser>({
    rowKey: 'id',
    maxNewRows: 5,
    maxSelectedRows: 5,

    createDefaultRow: () => ({
      id: 0,
      name: '',
      email: '',
      password: '',
      roles: [],
      permissions: [],
      roleIds: [],
      isNewRow: true,
    }),

    onSave: async ({ created, updated }) => {
      try {
        for (const user of created) {
          await createUserMutation.mutateAsync({
            name: user.name,
            email: user.email,
            password: user.password ?? '',
            roleIds: user.roleIds ?? [],
          });
        }

        for (const update of updated) {
          await updateUserMutation.mutateAsync({
            id: Number(update.id),
            payload: {
              name: update.changes.name,
              email: update.changes.email,
              password: update.changes.password || undefined,
              roleIds: update.changes.roleIds,
            },
          });
        }

        await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS_LIST] });
        return true;
      } catch (error) {
        console.error('Save users failed:', error);
        return false;
      }
    },

    onDelete: async (rows) => {
      try {
        await Promise.all(rows.map((row) => deleteUserMutation.mutateAsync(row.id)));
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS_LIST] });
        return true;
      } catch (error) {
        console.error('Delete users failed:', error);
        return false;
      }
    },
  });

  const getRoleIds = (user: EditableUser): number[] => {
    const editedRoleIds = crud.getFieldValue(user, 'roleIds');
    if (Array.isArray(editedRoleIds)) return editedRoleIds;
    if (Array.isArray(user.roleIds)) return user.roleIds;
    return user.roles.map((role) => role.id);
  };

  const getRoleNames = (user: EditableUser, roles: Role[]): string[] => {
    const roleIds = getRoleIds(user);
    return roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.name).filter(Boolean) as string[];
  };

  return {
    ...crud,
    getRoleIds,
    getRoleNames,
  };
};
