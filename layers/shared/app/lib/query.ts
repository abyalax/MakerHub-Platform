import type { MutationMeta, QueryClientConfig } from '@tanstack/vue-query';
import { MutationCache, QueryClient } from '@tanstack/vue-query';

let browserQueryClient: QueryClient;

function makeQueryClient(config: QueryClientConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        const meta: MutationMeta | undefined = mutation.meta;

        if (meta?.invalidateQueries) {
          browserQueryClient?.invalidateQueries({
            queryKey: [meta.invalidateQueries],
          });
        }
      },
    }),
    ...config,
  });
}

export function getQueryClient(config: QueryClientConfig): QueryClient {
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient(config);
  }
  return browserQueryClient;
}
