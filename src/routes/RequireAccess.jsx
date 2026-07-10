import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/**
 * Route guard. Replaces the per-page useEffect guards: redirects to /error
 * BEFORE the page renders (the legacy guards redirected after mount).
 *
 * `check` is one of the utils/permissions.js predicates — e.g.
 * () => canAccessDashboardRoute(DASHBOARD_ROUTES.PATIENTS). Those predicates
 * read the auth store imperatively; subscribing to permissions/pagesOneCango
 * here re-evaluates the guard when the session changes (login/logout).
 */
export default function RequireAccess({ check, errorType = 403, children }) {
  useAuthStore((s) => s.permissions);
  useAuthStore((s) => s.pagesOneCango);

  if (!check()) {
    return <Navigate to="/error" replace state={{ error_type: errorType }} />;
  }
  return children;
}
