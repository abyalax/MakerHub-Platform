import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Bookmark, CreateBookmarkData } from './types';

export function useAddBookmark() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: CreateBookmarkData) => {
      const response = await http<TResponse<Bookmark>>(ENDPOINT.BOOKMARKS, {
        method: 'POST',
        body: params,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BOOKMARKS_LIST] });
      $toast.info('Bookmark added successfully');
    },
    onError: (error: { data: TResponse; status: number }) => {
      const errMessage = error.data.message;
      const message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      if (error.status >= 400 && error.status < 500) {
        $toast.warning(message ?? 'Add bookmark failed');
      } else {
        $toast.error(message ?? 'Internal Server Error');
      }
    },
  });
}
