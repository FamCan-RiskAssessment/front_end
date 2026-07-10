import { create } from "zustand";
import { readRaw, writeRaw, readJSON, writeJSON, removeKeys } from "./legacyStorage";

const AUTH_KEYS = ["token", "number", "permissions", "roles", "pagesOneCango"];

/**
 * Session/auth store. Hydrates from the legacy localStorage keys so existing
 * sessions survive the migration, and writes through to the same keys with
 * the same serialization so not-yet-migrated readers stay consistent.
 *
 * Deliberately free of permission logic — utils/permissions.js computes
 * dashboard access and pushes it here (avoids an import cycle).
 */
export const useAuthStore = create((set) => ({
  token: readRaw("token"),
  number: readRaw("number"),
  permissions: readJSON("permissions", []),
  roles: readJSON("roles", []),
  pagesOneCango: readJSON("pagesOneCango", []),

  /** Called by the login flows after a successful auth response. */
  setSession: ({ token, number, permissions, roles }) => {
    writeRaw("token", token);
    writeRaw("number", number);
    writeJSON("permissions", permissions);
    writeJSON("roles", roles);
    set({ token, number, permissions, roles });
  },

  /** Called by permissions.persistDashboardAccess with the computed URL list. */
  setDashboardUrls: (urls) => {
    writeJSON("pagesOneCango", urls);
    set({ pagesOneCango: urls });
  },

  /** New (additive) capability — clears the whole session. */
  logout: () => {
    removeKeys(AUTH_KEYS);
    set({ token: null, number: null, permissions: [], roles: [], pagesOneCango: [] });
  },
}));
