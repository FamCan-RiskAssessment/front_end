import { QueryClient } from "@tanstack/react-query";

/**
 * App-wide QueryClient. Defaults are behavior-neutral versus the legacy
 * fetch-on-mount code: no retries, no focus refetch, immediately stale.
 * Individual queries opt in to caching (e.g. enums use staleTime: Infinity).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
});
