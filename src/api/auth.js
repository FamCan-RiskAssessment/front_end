import { apiFetch } from "./client";

/**
 * Unauthenticated and auth-mutating endpoints. Each returns the raw Response
 * so call sites can keep their existing `res.ok` / `data.message` handling.
 */

export const login = (phone) =>
  apiFetch("auth/login", { method: "POST", body: { phone }, token: null, parse: "response" });

export const adminLogin = (phone, password) =>
  apiFetch("auth/admin/login", {
    method: "POST",
    body: { phone, password },
    token: null,
    parse: "response",
  });

export const verifyOtp = (phone, otp) =>
  apiFetch("auth/verify-otp", {
    method: "POST",
    body: { phone, otp },
    token: null,
    parse: "response",
  });

export const changePassword = (password) =>
  apiFetch("admin/user/password", {
    method: "PUT",
    body: { password },
    parse: "response",
  });
