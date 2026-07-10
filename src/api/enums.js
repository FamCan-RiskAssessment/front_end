import { apiFetch } from "./client";
import { queryClient } from "./queryClient";
import { queryKeys } from "../hooks/queries/keys";

/** Raw enum fetch — returns the full legacy response shape { status, message, data }. */
export const fetchEnum = (name) => apiFetch(`enum/${name}`);

/** Shared query options so hooks and imperative callers hit the same cache entry. */
export const enumQueryOptions = (name) => ({
  queryKey: queryKeys.enum(name),
  queryFn: () => fetchEnum(name),
  staleTime: Infinity,
  gcTime: Infinity,
});

/**
 * Imperative, cache-backed enum lookup for non-hook call sites (legacy
 * utilities and event handlers). First call fetches; every later call for the
 * same enum resolves from cache. Return shape is identical to
 * fetchDataGET(`enum/${name}`, token).
 */
export const getEnumCached = (name) => queryClient.fetchQuery(enumQueryOptions(name));
