import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import { Input } from '~/layers/shared/app/components/ui/input';
import { createCrudSelectColumn, crudCellControlProps } from '~/layers/shared/app/composable/table/crud';
import SelectCategories from '../components/SelectCategories.vue';
import type { EditableProject } from './useTableStateProjects.js';

type Params = {
  crud: {
    isNewRow: (row: EditableProject) => boolean;
    isRowEditable: (row: EditableProject) => boolean;
    getFieldValue: <K extends keyof EditableProject>(row: EditableProject, field: K) => EditableProject[K];
    handleFieldChange: <K extends keyof EditableProject>(row: EditableProject, field: K, value: EditableProject[K]) => void;
    handleDelete: (row: EditableProject) => void;
    isLoading: { value: boolean };
  };
  canDelete: boolean;
};

export const useColumnProjects = (params: Params): ColumnDef<EditableProject>[] => {
  return [
    // 1. SELECT COLUMN
    createCrudSelectColumn(params.crud),

    // 2. TITLE COLUMN
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const project = row.original;

        if (!params.crud.isRowEditable(project)) {
          return h('div', { class: 'font-medium' }, project.title);
        }

        return h(Input, {
          modelValue: (params.crud.getFieldValue(project, 'title') as string) ?? '',
          'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(project, 'title', String(value)),
          type: 'text',
          placeholder: 'Project Title',
          class: 'h-8 min-w-56',
          ...crudCellControlProps,
        });
      },
    },

    // 3. SLUG COLUMN
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => {
        const project = row.original;

        if (!params.crud.isRowEditable(project)) {
          return h('div', { class: 'text-sm text-muted-foreground' }, project.slug);
        }

        return h(Input, {
          modelValue: (params.crud.getFieldValue(project, 'slug') as string) ?? '',
          'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(project, 'slug', String(value)),
          type: 'text',
          placeholder: 'project-slug',
          class: 'h-8 min-w-44',
          ...crudCellControlProps,
        });
      },
    },

    // 4. PRICE COLUMN
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const project = row.original;
        const displayPrice = `${project.currency} ${project.price}`;

        if (!params.crud.isRowEditable(project)) {
          return h('div', { class: 'font-mono' }, displayPrice);
        }

        return h('div', { class: 'flex gap-1 items-center min-w-36' }, [
          h('span', { class: 'text-xs text-muted-foreground font-mono' }, project.currency),
          h(Input, {
            modelValue: (params.crud.getFieldValue(project, 'price') as string) ?? '',
            'onUpdate:modelValue': (value: string | number) => params.crud.handleFieldChange(project, 'price', String(value)),
            type: 'number',
            placeholder: '0.00',
            class: 'h-8 w-full',
            ...crudCellControlProps,
          }),
        ]);
      },
    },

    // 5. CATEGORY COLUMN (Using InfiniteSelect)
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const project = row.original;

        if (!params.crud.isRowEditable(project)) {
          return h('div', {}, project.category?.name ?? '-');
        }

        return h(SelectCategories, {
          project: project,
          crud: params.crud,
          controlProps: crudCellControlProps,
        });
      },
    },

    {
      accessorKey: 'mentor',
      header: 'Mentor',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', {}, project.mentor?.user?.name ?? '-');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', { class: 'text-sm' }, project.status ?? '-');
      },
    },
    {
      accessorKey: 'accessType',
      header: 'Access',
      cell: ({ row }) => {
        const project = row.original;

        return h('div', { class: 'text-sm' }, project.accessType ?? '-');
      },
    },

    // 6. ACTIONS COLUMN
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const project = row.original;

        return h(
          'button',
          {
            class: 'text-sm text-destructive disabled:opacity-50',
            disabled: !params.canDelete || params.crud.isLoading.value,
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              params.crud.handleDelete(project);
            },
          },
          'Delete'
        );
      },
    },
  ];
};
