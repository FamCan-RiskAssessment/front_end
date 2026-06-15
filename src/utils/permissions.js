import { listOfcategs, listDashBoardUrls } from "./config";
import { permissionCategoryComparer } from "./tools";

export const PERMISSIONS = {
  FULL_ACCESS: "دسترسی کامل",
  SET_PASSWORD: "تنظیم پسورد",
  CREATE_FORM_FOR_USER: "ایجاد فرم برای کاربر",
  HANDLE_OPERATORS: "مدیریت اپراتور ها",
  VIEW_FORMS: "مشاهده فرم ها",
  VIEW_PATIENTS: "مشاهده مراجعه کنندگان",
  VIEW_ROLES: "مشاهده نقش ها",
  CREATE_ROLES: "ایجاد نقش",
  UPDATE_ROLES: "ویرایش نقش",
  DELETE_ROLES: "حذف نقش",
  VIEW_LOGS: "مشاهده لاگ ها",
  FILL_PROFILE: "تکمیل پروفایل",
};

export const DASHBOARD_ROUTES = {
  ROLE_MAKER: "/DashBoard/roleMaker",
  RAND_P: "/DashBoard/RandP",
  PATIENTS: "/DashBoard/patients",
  MODELS_RESULTS: "/DashBoard/modelsResults",
  SUPERVISOR_FORMS: "/DashBoard/supervisorForms",
  SYSTEM_LOG: "/DashBoard/systemLog",
  PASS_CHANGE: "/DashBoard/passChange",
};

export function getStoredPermissions() {
  try {
    return JSON.parse(localStorage.getItem("permissions") || "[]");
  } catch {
    return [];
  }
}

export function hasPermission(permissionName, permissions = getStoredPermissions()) {
  return permissions.some((p) => p.name === permissionName);
}

export function hasAnyPermission(permissionNames, permissions = getStoredPermissions()) {
  return permissionNames.some((name) => hasPermission(name, permissions));
}

export function hasFullAccess(permissions = getStoredPermissions()) {
  return hasPermission(PERMISSIONS.FULL_ACCESS, permissions);
}

export function roleHasFullAccess(role) {
  return role?.permissions?.some((p) => p.name === PERMISSIONS.FULL_ACCESS);
}

export function userHasFullAccess(user) {
  return user?.roles?.some((role) => roleHasFullAccess(role));
}

export function canSetPassword(permissions = getStoredPermissions()) {
  return hasFullAccess(permissions) || hasPermission(PERMISSIONS.SET_PASSWORD, permissions);
}

export function canCreateFormForUser(permissions = getStoredPermissions()) {
  return hasFullAccess(permissions) || hasPermission(PERMISSIONS.CREATE_FORM_FOR_USER, permissions);
}

export function getAccessibleDashboardUrls(permissions = getStoredPermissions()) {
  return permissionCategoryComparer(
    permissions,
    { ...listOfcategs },
    listDashBoardUrls
  );
}

export function persistDashboardAccess(permissions = getStoredPermissions()) {
  const urls = getAccessibleDashboardUrls(permissions);
  localStorage.setItem("pagesOneCango", JSON.stringify(urls));
  return urls;
}

export function getStoredDashboardUrls() {
  try {
    return JSON.parse(localStorage.getItem("pagesOneCango") || "[]");
  } catch {
    return [];
  }
}

export function canAccessDashboardRoute(route, permissions = getStoredPermissions()) {
  const storedUrls = getStoredDashboardUrls();
  if (storedUrls.length > 0) {
    return storedUrls.includes(route);
  }
  return getAccessibleDashboardUrls(permissions).includes(route);
}

export function canAccessDashboard(permissions = getStoredPermissions()) {
  return getAccessibleDashboardUrls(permissions).length > 0;
}

export function shouldUseOperatorFormEndpoint(permissions = getStoredPermissions()) {
  if (hasFullAccess(permissions) || hasPermission(PERMISSIONS.HANDLE_OPERATORS, permissions)) {
    return false;
  }
  return hasPermission(PERMISSIONS.CREATE_FORM_FOR_USER, permissions);
}

export function findOperatorRoleId(roles = []) {
  const withPermissions = roles.filter(
    (role) => Array.isArray(role.permissions) && role.permissions.length > 0
  );

  if (withPermissions.length > 0) {
    const operatorRole = withPermissions.find(
      (role) =>
        role.permissions.some((p) => p.name === PERMISSIONS.CREATE_FORM_FOR_USER) &&
        !role.permissions.some((p) => p.name === PERMISSIONS.HANDLE_OPERATORS) &&
        !role.permissions.some((p) => p.name === PERMISSIONS.FULL_ACCESS)
    );
    if (operatorRole) {
      return operatorRole.id;
    }
  }

  return 0;
}

export function isAssignableRole(role) {
  return !roleHasFullAccess(role);
}
