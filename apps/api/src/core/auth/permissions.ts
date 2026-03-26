export const permissions = {
  applications: {
    create: "applications:create",
    readOwn: "applications:read:own",
    manageOwn: "applications:manage:own",
    unlimited: "applications:unlimited"
  },
  preferences: {
    readOwn: "preferences:read:own",
    updateOwn: "preferences:update:own"
  },
  admin: {
    dashboard: "admin:dashboard",
    usersManage: "admin:users:manage"
  }
} as const;

export type Permission =
  | "applications:create"
  | "applications:read:own"
  | "applications:manage:own"
  | "applications:unlimited"
  | "preferences:read:own"
  | "preferences:update:own"
  | "admin:dashboard"
  | "admin:users:manage";

const rolePolicyMap: Record<"free" | "pro" | "admin", Permission[]> = {
  free: [
    permissions.applications.create,
    permissions.applications.readOwn,
    permissions.applications.manageOwn,
    permissions.preferences.readOwn,
    permissions.preferences.updateOwn
  ],
  pro: [
    permissions.applications.create,
    permissions.applications.readOwn,
    permissions.applications.manageOwn,
    permissions.applications.unlimited,
    permissions.preferences.readOwn,
    permissions.preferences.updateOwn
  ],
  admin: [
    permissions.applications.create,
    permissions.applications.readOwn,
    permissions.applications.manageOwn,
    permissions.applications.unlimited,
    permissions.preferences.readOwn,
    permissions.preferences.updateOwn,
    permissions.admin.dashboard,
    permissions.admin.usersManage
  ]
};

export const getPermissionsByRole = (role: "free" | "pro" | "admin"): Permission[] => rolePolicyMap[role];
