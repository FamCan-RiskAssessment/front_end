import { APIURL } from "../utils/config";

/**
 * Token provider — swappable so the client does not depend on any store.
 * Defaults to the legacy localStorage key; Phase 4 points it at the auth store.
 */
let getToken = () => localStorage.getItem("token");

/** @param {() => (string|null)} fn */
export const setTokenProvider = (fn) => {
  getToken = fn;
};

/** Current auth token via the active provider. */
export const getAuthToken = () => getToken();

/**
 * Single fetch client for the whole app. All legacy helpers in utils/tools.js
 * delegate here; new code should call apiFetch directly.
 *
 * Error semantics intentionally mirror the legacy fetchDataGET:
 *   throw new Error(data.message || errorMessage)
 * so existing catch-block toasts keep working unchanged.
 *
 * @param {string} endpoint  path relative to APIURL, no leading slash
 * @param {object} [options]
 * @param {string}  [options.method="GET"]
 * @param {object|FormData} [options.body]  plain object → JSON.stringify; FormData passes through
 * @param {object}  [options.headers]       extra headers, merged last
 * @param {string|null} [options.token]     override; defaults to the token provider
 * @param {boolean} [options.throwOnError=true]
 * @param {string}  [options.errorMessage="Request failed"]
 * @param {"auto"|"json"|"none"} [options.contentType="auto"]  "auto": json unless FormData
 * @param {"json"|"response"} [options.parse="json"]  "response" returns the raw Response
 */
export async function apiFetch(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token = getToken(),
    throwOnError = true,
    errorMessage = "Request failed",
    contentType = "auto",
    parse = "json",
  } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders = { Authorization: `Bearer ${token}`, ...headers };
  const wantsJsonContentType =
    contentType === "json" || (contentType === "auto" && !isFormData);
  if (wantsJsonContentType) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${APIURL}/${endpoint}`, {
    method,
    headers: finalHeaders,
    ...(body !== undefined && {
      body: isFormData ? body : JSON.stringify(body),
    }),
  });

  if (parse === "response") return res;

  const data = await res.json();
  if (!res.ok && throwOnError) throw new Error(data.message || errorMessage);
  return data;
}
