export const MODULES = ["adminManagement", "products", "logistics", "registrations"] as const;
export type ModuleName = (typeof MODULES)[number];
export type ModulePermission = { read: boolean; write: boolean };
export type ModulePermissionsMap = Partial<Record<ModuleName, ModulePermission>>;

export const MODULE_META: Record<ModuleName, { label: string; icon: string }> = {
  adminManagement: { label: "Admin Management", icon: "solar:shield-user-bold-duotone" },
  products: { label: "Products", icon: "solar:bag-bold-duotone" },
  logistics: { label: "Logistics", icon: "solar:delivery-bold-duotone" },
  registrations: { label: "Registrations", icon: "solar:users-group-two-rounded-bold-duotone" },
};

export const PAGE_PERMISSION_MAP: Partial<Record<string, { module: ModuleName; action: "read" | "write" }>> = {
  // Products module sub-pages
  "/admin/products/new":    { module: "products",        action: "write" },
  "/admin/products/config": { module: "products",        action: "read" },
  "/admin/products":        { module: "products",        action: "read" },
  "/admin/orders":          { module: "products",        action: "read" },
  // Logistics module sub-pages
  "/admin/logistics/items":         { module: "logistics", action: "read" },
  "/admin/logistics/trips":         { module: "logistics", action: "read" },
  "/admin/logistics/international": { module: "logistics", action: "read" },
  "/admin/logistics/config":        { module: "logistics", action: "read" },
  "/admin/logistics":               { module: "logistics", action: "read" },
  // Other modules
  "/admin/registrations": { module: "registrations",   action: "read" },
  "/admin/team":          { module: "adminManagement", action: "read" },
  "/admin/team/roles":    { module: "adminManagement", action: "read" },
};

export function hasPermission(
  permissions: ModulePermissionsMap,
  isSuper: boolean,
  module: ModuleName,
  action: "read" | "write",
): boolean {
  if (isSuper) return true;
  return permissions?.[module]?.[action] ?? false;
}
