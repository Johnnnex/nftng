import { z } from "zod";

const modulePermissionShape = z.object({
  read: z.boolean(),
  write: z.boolean(),
});

export const inviteAdminSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  roleId: z.string().uuid().nullable().optional(),
  modulePermissions: z.record(z.string(), modulePermissionShape).optional(),
});

export type InviteAdminData = z.infer<typeof inviteAdminSchema>;

export const roleTemplateSchema = z.object({
  name: z.string().min(1, "Role name required").max(80),
  modulePermissions: z.record(z.string(), modulePermissionShape),
});

export type RoleTemplateData = z.infer<typeof roleTemplateSchema>;

export const updatePermissionsSchema = z.object({
  modulePermissions: z.record(z.string(), modulePermissionShape).optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePermissionsData = z.infer<typeof updatePermissionsSchema>;

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, "Token required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AcceptInviteData = z.infer<typeof acceptInviteSchema>;

// Server-side only — no confirmPassword (purely a client UX check)
export const acceptInviteBodySchema = z.object({
  token: z.string().min(1, "Token required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AcceptInviteBody = z.infer<typeof acceptInviteBodySchema>;
