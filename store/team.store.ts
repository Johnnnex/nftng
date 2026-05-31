import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type { AdminRecord, RoleTemplate, PendingInvite, PaginationMeta } from "@/data";
import type { ModulePermissionsMap } from "@/lib/permissions";

const LIMIT = 50;

type TeamMeta = {
  admins: PaginationMeta;
  roles: PaginationMeta;
  invites: PaginationMeta;
};

const DEFAULT_META: TeamMeta = {
  admins: { total: 0, page: 1, limit: LIMIT },
  roles: { total: 0, page: 1, limit: LIMIT },
  invites: { total: 0, page: 1, limit: LIMIT },
};

type TeamState = {
  admins: AdminRecord[];
  roles: RoleTemplate[];
  invites: PendingInvite[];
  meta: TeamMeta;
  loading: boolean;

  fetchAdmins: (page: number) => Promise<void>;
  fetchRoles: (page: number) => Promise<void>;
  fetchInvites: (page: number) => Promise<void>;

  inviteAdmin: (data: {
    email: string;
    firstName: string;
    lastName: string;
    roleId?: string | null;
    modulePermissions: ModulePermissionsMap;
  }) => Promise<void>;
  updateAdminPermissions: (id: string, modulePermissions: ModulePermissionsMap) => Promise<AdminRecord>;
  toggleAdminActive: (id: string, isActive: boolean) => Promise<AdminRecord>;
  createRole: (data: { name: string; modulePermissions: ModulePermissionsMap }) => Promise<RoleTemplate>;
  updateRole: (id: string, data: { name: string; modulePermissions: ModulePermissionsMap }) => Promise<RoleTemplate>;
  deleteRole: (id: string) => Promise<void>;
};

export const useTeamStore = create<TeamState>((set, get) => ({
  admins: [],
  roles: [],
  invites: [],
  meta: DEFAULT_META,
  loading: false,

  fetchAdmins: async (page) => {
    const res = await authRequest<{ data: AdminRecord[]; meta: PaginationMeta }>({
      method: "GET",
      url: `/api/admin/admins?page=${page}&limit=${LIMIT}`,
    });
    set((s) => ({ admins: res.data.data, meta: { ...s.meta, admins: res.data.meta } }));
  },

  fetchRoles: async (page) => {
    const res = await authRequest<{ data: RoleTemplate[]; meta: PaginationMeta }>({
      method: "GET",
      url: `/api/admin/roles?page=${page}&limit=${LIMIT}`,
    });
    set((s) => ({ roles: res.data.data, meta: { ...s.meta, roles: res.data.meta } }));
  },

  fetchInvites: async (page) => {
    const res = await authRequest<{ data: PendingInvite[]; meta: PaginationMeta }>({
      method: "GET",
      url: `/api/admin/invites?page=${page}&limit=${LIMIT}`,
    });
    set((s) => ({ invites: res.data.data, meta: { ...s.meta, invites: res.data.meta } }));
  },

  inviteAdmin: async (data) => {
    const res = await authRequest<{ data: { id: string; email: string; firstName: string; lastName: string } }>({
      method: "POST",
      url: "/api/admin/admins",
      data,
    });
    const { id, email, firstName, lastName } = res.data.data;
    const role = data.roleId ? get().roles.find((r) => r.id === data.roleId) ?? null : null;
    const invite: PendingInvite = {
      id,
      email,
      firstName,
      lastName,
      roleId: data.roleId ?? null,
      roleName: role?.name ?? null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
    set((s) => ({
      invites: [invite, ...s.invites],
      meta: { ...s.meta, invites: { ...s.meta.invites, total: s.meta.invites.total + 1 } },
    }));
  },

  updateAdminPermissions: async (id, modulePermissions) => {
    const res = await authRequest<{ data: AdminRecord }>({
      method: "PATCH",
      url: `/api/admin/admins/${id}`,
      data: { modulePermissions },
    });
    const updated = res.data.data;
    set((s) => ({ admins: s.admins.map((a) => (a.id === id ? updated : a)) }));
    return updated;
  },

  toggleAdminActive: async (id, isActive) => {
    const res = await authRequest<{ data: AdminRecord }>({
      method: "PATCH",
      url: `/api/admin/admins/${id}`,
      data: { isActive },
    });
    const updated = res.data.data;
    set((s) => ({ admins: s.admins.map((a) => (a.id === id ? updated : a)) }));
    return updated;
  },

  createRole: async (data) => {
    const res = await authRequest<{ data: RoleTemplate }>({
      method: "POST",
      url: "/api/admin/roles",
      data,
    });
    const role = res.data.data;
    set((s) => ({
      roles: [...s.roles, role],
      meta: { ...s.meta, roles: { ...s.meta.roles, total: s.meta.roles.total + 1 } },
    }));
    return role;
  },

  updateRole: async (id, data) => {
    const res = await authRequest<{ data: RoleTemplate }>({
      method: "PATCH",
      url: `/api/admin/roles/${id}`,
      data,
    });
    const updated = res.data.data;
    set((s) => ({ roles: s.roles.map((r) => (r.id === id ? updated : r)) }));
    return updated;
  },

  deleteRole: async (id) => {
    await authRequest({ method: "DELETE", url: `/api/admin/roles/${id}` });
    set((s) => ({
      roles: s.roles.filter((r) => r.id !== id),
      meta: { ...s.meta, roles: { ...s.meta.roles, total: Math.max(0, s.meta.roles.total - 1) } },
    }));
  },
}));
