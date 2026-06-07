import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { LessonProgress, UpdateLessonProgressData } from './types';

export function useUpdateLessonProgress() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: { lessonId: number; data: UpdateLessonProgressData }) => {
      const response = await http<TResponse<LessonProgress>>(
        ENDPOINT.LESSON_PROGRESS(params.lessonId),
        {
          method: 'PUT',
          body: params.data,
        },
      );
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LESSON_PROGRESS, variables.lessonId] });
      $toast.info('Lesson progress updated successfully');
    },
    onError: (error: { data: TResponse; status: number }) => {
      const errMessage = error.data.message;
      const message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      if (error.status >= 400 && error.status < 500) {
        $toast.warning(message ?? 'Update lesson progress failed');
      } else {
        $toast.error(message ?? 'Internal Server Error');
      }
    },
  });
}
