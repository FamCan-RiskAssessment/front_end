import { create } from "zustand";
import { readRaw, writeRaw, readJSON, writeJSON } from "./legacyStorage";

/**
 * In-progress questionnaire draft + the coordination flags the form pages
 * share. Writes through to the legacy localStorage keys.
 *
 * Migration note: the questionnaire pages still read/write some of these
 * keys directly; components adopting this store should call hydrate() on
 * mount until every writer is migrated (Phase 6b).
 */
export const useFormDraftStore = create((set) => ({
  formData: readJSON("form_data", null),
  formId: readRaw("form_id"),
  trueSteps: readJSON("trueSteps", null),
  imperfectForm: readJSON("imperfectForm", false),
  postalVerified: readJSON("postalVerified", false),
  famcanFilled: readJSON("famcanFilled", false),
  selfcanFilled: readJSON("selfcanFilled", false),

  /** Re-read every key — bridges direct localStorage writes from legacy code. */
  hydrate: () =>
    set({
      formData: readJSON("form_data", null),
      formId: readRaw("form_id"),
      trueSteps: readJSON("trueSteps", null),
      imperfectForm: readJSON("imperfectForm", false),
      postalVerified: readJSON("postalVerified", false),
      famcanFilled: readJSON("famcanFilled", false),
      selfcanFilled: readJSON("selfcanFilled", false),
    }),

  setDraft: ({ formData, formId, trueSteps }) => {
    writeJSON("form_data", formData);
    writeRaw("form_id", formId);
    writeJSON("trueSteps", trueSteps);
    set({ formData, formId, trueSteps });
  },

  patchDraft: (partial) =>
    set((state) => {
      const formData = { ...(state.formData || {}), ...partial };
      writeJSON("form_data", formData);
      return { formData };
    }),

  setFlag: (name, value) => {
    writeJSON(
      { imperfectForm: "imperfectForm", postalVerified: "postalVerified",
        famcanFilled: "famcanFilled", selfcanFilled: "selfcanFilled" }[name],
      value
    );
    set({ [name]: value });
  },

  clearDraft: () => {
    // Writes the literal "null" string, exactly like the legacy setItem(key, null).
    writeJSON("form_data", null);
    writeRaw("form_id", null);
    writeJSON("trueSteps", null);
    set({ formData: null, formId: null, trueSteps: null });
  },
}));
