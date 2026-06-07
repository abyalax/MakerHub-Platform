import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectDTO } from '../../types';

interface ModerateProjectParams {
  projectId: number;
  status: 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';
}

export function useModerateProject() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: ModerateProjectParams) => {
      const response = await http<TResponse<ProjectDTO>>(ENDPOINT.ADMIN_MODERATE_PROJECT(params.projectId), {
        method: 'PUT',
        body: { status: params.status },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ADMIN_LIST_PROJECTS] });
      $toast.info('Project status updated successfully');
    },
    onError: (error: { data: TResponse }) => {
      const response = error?.data;
      $toast.warning(response?.message ?? 'Failed to update project status');
    },
  });
}
