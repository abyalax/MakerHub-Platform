import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectProgress, UpdateProjectProgressData } from './types';

export function useUpdateProjectProgress() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: { projectId: number; data: UpdateProjectProgressData }) => {
      const response = await http<TResponse<ProjectProgress>>(
        ENDPOINT.PROJECT_PROGRESS(params.projectId),
        {
          method: 'PUT',
          body: params.data,
        },
      );
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_PROGRESS, variables.projectId] });
      $toast.info('Project progress updated successfully');
    },
    onError: (error: { data: TResponse; status: number }) => {
      const errMessage = error.data.message;
      const message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      if (error.status >= 400 && error.status < 500) {
        $toast.warning(message ?? 'Update project progress failed');
      } else {
        $toast.error(message ?? 'Internal Server Error');
      }
    },
  });
}
