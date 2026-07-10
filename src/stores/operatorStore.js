import { create } from "zustand";
import { readRaw, writeRaw, readJSON, writeJSON } from "./legacyStorage";

/**
 * Operator-fills-form-for-user flow state. Writes through to the legacy
 * localStorage keys. Same migration note as formDraftStore: consumers
 * adopting the store call hydrate() until all writers are migrated.
 */
export const useOperatorStore = create((set) => ({
  operatorUserId: readRaw("operatorUserId"),
  userNeededAdress: readRaw("userNeededAdress"),
  oprUserPhone: readRaw("oprUserPhone"),
  residentEnter: readJSON("residentEnter", null),

  hydrate: () =>
    set({
      operatorUserId: readRaw("operatorUserId"),
      userNeededAdress: readRaw("userNeededAdress"),
      oprUserPhone: readRaw("oprUserPhone"),
      residentEnter: readJSON("residentEnter", null),
    }),

  setOperatorTarget: ({ operatorUserId, userNeededAdress }) => {
    writeRaw("operatorUserId", operatorUserId);
    writeRaw("userNeededAdress", userNeededAdress);
    set({ operatorUserId, userNeededAdress });
  },

  setOprUserPhone: (phone) => {
    writeRaw("oprUserPhone", phone);
    set({ oprUserPhone: phone });
  },

  setResidentEnter: (value) => {
    writeJSON("residentEnter", value);
    set({ residentEnter: value });
  },

  clear: () => {
    // writeRaw(null) writes the "null" literal — some legacy readers call
    // .length on these values and would crash on a removed key.
    writeRaw("operatorUserId", null);
    writeRaw("userNeededAdress", null);
    writeRaw("oprUserPhone", null);
    writeJSON("residentEnter", null);
    set({ operatorUserId: null, userNeededAdress: null, oprUserPhone: null, residentEnter: null });
  },
}));
