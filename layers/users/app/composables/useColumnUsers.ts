import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import InfiniteSelect from '~/layers/shared/app/components/fragments/input/select/InfiniteSelect.vue';
import { Input } from '~/layers/shared/app/components/ui/input';
import { createCrudSelectColumn, crudCellControlProps } from '~/layers/shared/app/composable/table/crud';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import RoleBadge from '../components/RoleBadge.vue';
import type { Role } from '../types/index.js';
import type { EditableUser } from './useTableStateUsers.js';

type Params = {
  crud: {
    isNewRow: (row: EditableUser) => boolean;
    isRowEditable: (row: EditableUser) => boolean;
    getFieldValue: <K extends keyof EditableUser>(row: EditableUser, field: K) => EditableUser[K];
    handleFieldChange: <K extends keyof EditableUser>(row: EditableUser, field: K, value: EditableUser[K]) => void;
    getRoleIds: (row: EditableUser) => number[]; // Adjust type if your IDs are strings
    handleDelete: (row: EditableUser) => void;
    isLoading: { value: boolean };
  };
  canDelete: boolean;
};

export const useColumnUsers = (params: Params): ColumnDef<EditableUser>[] => {
  const http = useHttp();

  const fetchRoles = async (options: { page: number; limit: number; search: string }): Promise<Paginated<Role>> => {
    const response = await http<TResponse<Paginated<Role>>>(ENDPOINT.ROLES, {
      method: 'GET',
      query: {
        page: options.page,
        limit: options.limit,
        search: options.search || undefined,
      },
    });

    return response.data;
  };

  return [
    // 1. KOLOM SELECT
    createCrudSelectColumn(params.crud),

    // 2. KOLOM NAME
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;

        if (!params.crud.isRowEditable(user)) {
          return h('div', { class: 'font-medium' }, user.name);
        }

        return h(Input, {
          modelValue: (params.crud.getFieldValue(user, 'name') as string) ?? '',
          'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(user, 'name', String(value)),
          type: 'text',
          placeholder: 'Name',
          class: 'h-8 min-w-44',
          ...crudCellControlProps,
        });
      },
    },

    // 3. KOLOM EMAIL
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const user = row.original;

        if (!params.crud.isRowEditable(user)) {
          return h('div', { class: 'lowercase' }, user.email);
        }

        return h(Input, {
          modelValue: (params.crud.getFieldValue(user, 'email') as string) ?? '',
          'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(user, 'email', String(value)),
          type: 'email',
          placeholder: 'Email',
          class: 'h-8 min-w-44',
          ...crudCellControlProps,
        });
      },
    },

    // 4. KOLOM ROLES
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => {
        const user = row.original;

        if (!params.crud.isRowEditable(user)) {
          return h(
            'div',
            { class: 'flex gap-1 flex-wrap' },
            user.roles.length
              ? user.roles.map((role) =>
                  h(RoleBadge, {
                    key: role.id,
                    role: role.name,
                  })
                )
              : h('span', { class: 'text-sm text-muted-foreground' }, '-')
          );
        }

        const selectedRoles = params.crud.getFieldValue(user, 'roles');

        return h(InfiniteSelect as any, {
          modelValue: selectedRoles,
          multiple: true,
          placeholder: 'Select roles',
          labelKey: 'name',
          valueKey: 'id',
          class: 'min-w-72',
          ...crudCellControlProps,
          queryOptions: {
            queryKey: [QUERY_KEY.ROLES_LIST],
            fetcher: fetchRoles,
            limit: 20,
          },
          'onUpdate:modelValue': (value: Role[] | Role | null) => {
            const nextRoles = Array.isArray(value) ? value : value ? [value] : [];
            params.crud.handleFieldChange(user, 'roles', nextRoles);
            params.crud.handleFieldChange(user, 'roleIds', nextRoles.map((role) => role.id));
          },
        });
      },
    },

    // 5. KOLOM ACTIONS
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;

        return h(
          'button',
          {
            class: 'text-sm text-destructive disabled:opacity-50',
            disabled: !params.canDelete || params.crud.isLoading.value,
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              params.crud.handleDelete(user);
            },
          },
          'Delete'
        );
      },
    },
  ];
};
