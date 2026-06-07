import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { LessonProgress } from './types';

export function useGetLessonProgress(lessonId: ComputedRef<number | null>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.LESSON_PROGRESS, unref(lessonId)]),
    queryFn: async () => {
      if (!unref(lessonId)) return null;
      const response = await http<TResponse<LessonProgress>>(ENDPOINT.LESSON_PROGRESS(unref(lessonId)!), {
        method: 'GET',
      });
      return response.data;
    },
    staleTime: 0,
    enabled: computed(() => !!unref(lessonId)),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
