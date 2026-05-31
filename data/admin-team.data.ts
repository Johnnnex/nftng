import type { ModulePermissionsMap } from "@/lib/permissions";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
};

export type PendingInvite = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string | null;
  roleName: string | null;
  createdAt: string;
  expiresAt: string;
};

export type AdminRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuper: boolean;
  isActive: boolean;
  initialRoleId: string | null;
  initialRoleName: string | null;
  permissions: ModulePermissionsMap;
  createdAt: string;
  lastLoginAt: string | null;
};

export type RoleTemplate = {
  id: string;
  name: string;
  modulePermissions: ModulePermissionsMap;
  assignedCount: number;
  createdAt: string;
};

export type AdminFormField = {
  name: string;
  label: string;
  sublabel?: string;
  kind: "email" | "text" | "select" | "password";
  placeholder: string;
};

export const INVITE_ADMIN_FIELDS: (AdminFormField | [AdminFormField, AdminFormField])[] = [
  { name: "email", kind: "email", label: "Email address", placeholder: "admin@nftng.io" },
  [
    { name: "firstName", kind: "text", label: "First name", placeholder: "Amaka" },
    { name: "lastName", kind: "text", label: "Last name", placeholder: "Okafor" },
  ],
  {
    name: "roleId",
    kind: "select",
    label: "Role template",
    sublabel: "(optional)",
    placeholder: "— Custom permissions —",
  },
];

export const ROLE_TEMPLATE_FIELDS: AdminFormField[] = [
  { name: "name", kind: "text", label: "Role name", placeholder: "e.g. Logistics Admin" },
];

export const ACCEPT_INVITE_FIELDS: AdminFormField[] = [
  { name: "password", kind: "password", label: "New password", placeholder: "Min. 8 characters" },
  { name: "confirmPassword", kind: "password", label: "Confirm password", placeholder: "Re-enter password" },
];
