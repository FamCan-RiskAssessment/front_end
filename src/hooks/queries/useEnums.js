import { useQuery, useQueries } from "@tanstack/react-query";
import { enumQueryOptions } from "../../api/enums";

/** Cached enum query — full legacy response shape in `data`. */
export const useEnum = (name) => useQuery(enumQueryOptions(name));

/** Several enums at once; results are positional, each cached independently. */
export const useEnumList = (names) =>
  useQueries({ queries: names.map(enumQueryOptions) });
