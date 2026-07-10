/**
 * Central query-key registry. Every useQuery/useMutation in the app builds
 * its key from here so invalidation stays consistent.
 */
export const queryKeys = {
  enum: (name) => ["enums", name],

  formsList: (params) => ["forms", "list", params],
  formDetail: (formId, part) => ["forms", "detail", formId, part],

  patientsList: (params) => ["patients", "list", params],
  patientRow: (formId) => ["patients", "row", formId],

  rolesList: () => ["roles", "list"],
  roleDetail: (id) => ["roles", "detail", id],
  permissionsList: () => ["permissions", "list"],

  logs: (params) => ["logs", params],
  modelResults: (params) => ["models", "results", params],

  usersTree: () => ["users", "tree"],
};
