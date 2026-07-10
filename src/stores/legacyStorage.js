/**
 * Bridge between the Zustand stores and the app's legacy localStorage keys.
 *
 * During the migration window some code still reads these keys directly, so
 * every store action writes through to localStorage SYNCHRONOUSLY with the
 * exact serialization the legacy code used:
 *   - raw string keys:  token, number, form_id, operatorUserId,
 *                       userNeededAdress, oprUserPhone
 *   - JSON keys:        permissions, roles, pagesOneCango, form_data,
 *                       trueSteps, famcanFilled, selfcanFilled, residentEnter
 *   - clearing idiom:   legacy code wrote setItem(key, null) → the literal
 *                       string "null"; reads here treat "null"/"undefined"
 *                       as empty so pre-existing sessions keep working.
 */

const EMPTY_SENTINELS = new Set([null, "null", "undefined", ""]);

/** Read a raw-string key; returns null for missing or legacy-"null" values. */
export function readRaw(key) {
  const value = localStorage.getItem(key);
  return EMPTY_SENTINELS.has(value) ? null : value;
}

/**
 * Write a raw-string key. Clearing (null/undefined) writes the literal
 * string "null" — NOT removeItem — because legacy code cleared these keys
 * via setItem(key, null) and some readers assume the key exists as a string
 * (e.g. getItem("userNeededAdress").length in questionareNavid).
 */
export function writeRaw(key, value) {
  if (value === null || value === undefined) {
    localStorage.setItem(key, "null");
  } else {
    localStorage.setItem(key, value);
  }
}

/** Read a JSON key; returns `fallback` for missing, legacy-"null", or corrupt values. */
export function readJSON(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    if (EMPTY_SENTINELS.has(value)) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/** Write a JSON key. JSON.stringify(null) === "null", matching the legacy clearing idiom. */
export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value ?? null));
}

/** Remove a list of keys (used by logout/clear actions). */
export function removeKeys(keys) {
  keys.forEach((key) => localStorage.removeItem(key));
}
