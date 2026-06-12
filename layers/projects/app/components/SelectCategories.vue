<script setup lang="ts">
import { computed } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import InfiniteSelect from '~/layers/shared/app/components/fragments/input/select/InfiniteSelect.vue';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Category, Project } from '../../types';

const props = defineProps<{
  project: Project & {
    category?: Category | null;
  };
  crud: {
    getFieldValue: <K extends keyof Project>(row: Project, field: K) => Project[K];
    handleFieldChange: <K extends keyof Project>(row: Project, field: K, value: Project[K]) => void;
  };
  controlProps?: Record<string, unknown>;
}>();

const http = useHttp();

const selectedCategory = computed<Category | null>({
  get: () => props.project.category ?? null,
  set: (category) => {
    props.crud.handleFieldChange(props.project, 'categoryId', category?.id as Project['categoryId']);
  },
});

const fetchCategories = async (params: { page: number; limit: number; search: string }): Promise<Paginated<Category>> => {
  const response = await http<TResponse<Paginated<Category>>>(ENDPOINT.PROJECTS.LIST_CATEGORIES, {
    method: 'GET',
    query: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
    },
  });

  return response.data;
};
</script>

<template>
  <InfiniteSelect
    v-model="selectedCategory"
    label-key="name"
    value-key="id"
    placeholder="Select Category"
    class="min-w-44"
    :query-options="{
      queryKey: ['project-categories'],
      fetcher: fetchCategories,
    }"
    v-bind="controlProps"
  />
</template>
