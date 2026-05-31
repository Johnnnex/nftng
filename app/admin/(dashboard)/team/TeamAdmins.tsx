/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn, hasPermission } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useTeamStore } from "@/store";
import { Table, StatusChip, Input, Button, Tab } from "@/components";
import type { SelectOption } from "@/components";
import {
  INVITE_ADMIN_FIELDS,
  type AdminFormField,
  type AdminRecord,
  type PendingInvite,
  inviteAdminSchema,
  type InviteAdminData,
} from "@/data";
import { Modal, PermissionEditor, ConfirmModal } from "./_shared";
import type { ModulePermissionsMap } from "@/lib/permissions";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TeamSkeleton = () => (
  <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
    <div className="h-14 bg-[#F3F4F6] border-b border-[#E5E7EB]" />
    <div className="p-4 flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-16 rounded-xl ${i % 2 === 0 ? "bg-[#F3F4F6]" : "bg-[#F9FAFB]"}`}
        />
      ))}
    </div>
  </div>
);

// ─── Invite Modal ─────────────────────────────────────────────────────────────

const InviteModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { roles, inviteAdmin } = useTeamStore();
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteAdminData>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: "", firstName: "", lastName: "", roleId: null },
  });

  const [permissions, setPermissions] = useState<ModulePermissionsMap>({});
  const [submitting, setSubmitting] = useState(false);
  const selectedRoleId = watch("roleId");

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find((r) => r.id === selectedRoleId);
      if (role) setPermissions(role.modulePermissions);
    } else {
      setPermissions({});
    }
  }, [selectedRoleId, roles]);

  const closeAndReset = useCallback(() => {
    reset();
    setPermissions({});
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: InviteAdminData) => {
    setSubmitting(true);
    try {
      await inviteAdmin({ ...data, modulePermissions: permissions });
      toast.success(`Invite sent to ${data.email}`);
      closeAndReset();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions: SelectOption[] = [
    { value: "", label: "— Custom permissions —" },
    ...roles.map((r) => ({ value: r.id, label: r.name })),
  ];

  const renderField = (field: AdminFormField) => {
    const err = errors[field.name as keyof InviteAdminData]?.message;

    if (field.kind === "select") {
      return (
        <div key={field.name}>
          <label
            className={cn(
              satoshi.className,
              "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
            )}
          >
            {field.label}{" "}
            {field.sublabel && (
              <span
                className={cn(
                  satoshi.className,
                  "text-[#9CA3AF] font-normal text-[0.8125rem]",
                )}
              >
                {field.sublabel}
              </span>
            )}
          </label>
          <Controller
            name="roleId"
            control={control}
            render={({ field: rhfField }) => (
              <Input
                type="select"
                name="roleId"
                selectOptions={roleOptions}
                value={(rhfField.value as string) ?? ""}
                onChange={(e) => rhfField.onChange(e.target.value || null)}
                placeholder={field.placeholder}
              />
            )}
          />
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label
          className={cn(
            satoshi.className,
            "block text-[0.875rem] font-medium text-[#374151] mb-1.5",
          )}
        >
          {field.label}
        </label>
        <Input
          type={field.kind}
          placeholder={field.placeholder}
          error={err}
          className={err ? undefined : "border-[#D0D5DD]"}
          {...register(field.name as keyof InviteAdminData)}
        />
      </div>
    );
  };

  return (
    <Modal open={open} onClose={closeAndReset} title="Invite Admin">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {INVITE_ADMIN_FIELDS.map((f, i) =>
          Array.isArray(f) ? (
            <div key={i} className="grid grid-cols-2 gap-3">
              {f.map(renderField)}
            </div>
          ) : (
            renderField(f)
          ),
        )}

        <div>
          <p
            className={cn(
              satoshi.className,
              "text-[0.875rem] font-medium text-[#374151] mb-2",
            )}
          >
            Module permissions
            {selectedRoleId && (
              <span className="ml-1.5 text-[0.8125rem] font-normal text-[#9CA3AF]">
                from template — editable
              </span>
            )}
          </p>
          <PermissionEditor value={permissions} onChange={setPermissions} />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button
            variant="secondary"
            type="button"
            onClick={closeAndReset}
            className={cn(
              satoshi.className,
              "px-4 py-2 rounded-lg border-[#E5E7EB] text-[0.875rem] font-medium text-[#374151] hover:bg-[#F9FAFB]",
            )}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            className={cn(
              satoshi.className,
              "px-4 py-2 rounded-lg bg-[#6EC93E] text-white text-[0.875rem] font-medium hover:bg-[#5cb535]",
            )}
          >
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Edit Permissions Modal ───────────────────────────────────────────────────

const EditPermissionsModal = ({
  admin,
  open,
  onClose,
}: {
  admin: AdminRecord | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { roles, updateAdminPermissions } = useTeamStore();
  const [permissions, setPermissions] = useState<ModulePermissionsMap>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (admin) setPermissions({ ...admin.permissions });
  }, [admin]);

  const handleReset = () => {
    const role = roles.find((r) => r.id === admin?.initialRoleId);
    if (role) setPermissions({ ...role.modulePermissions });
  };

  const handleSave = async () => {
    if (!admin) return;
    setSubmitting(true);
    try {
      await updateAdminPermissions(admin.id, permissions);
      toast.success("Permissions updated");
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Permissions">
      {admin && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
            <div className="w-9 h-9 rounded-full bg-[#6EC93E]/15 border border-[#6EC93E]/30 flex items-center justify-center shrink-0">
              <span
                className={cn(
                  poppins.className,
                  "text-[0.6875rem] font-bold text-[#6EC93E]",
                )}
              >
                {admin.firstName[0]}
                {admin.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-semibold text-[#111827] truncate",
                )}
              >
                {admin.firstName} {admin.lastName}
              </p>
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#9CA3AF] truncate",
                )}
              >
                {admin.email}
              </p>
            </div>
            {admin.initialRoleName && (
              <span
                className={cn(
                  satoshi.className,
                  "shrink-0 text-[0.75rem] text-[#6EC93E] bg-[#6EC93E]/10 px-2.5 py-1 rounded-full",
                )}
              >
                {admin.initialRoleName}
              </span>
            )}
          </div>

          <PermissionEditor value={permissions} onChange={setPermissions} />

          <div className="flex items-center gap-3 pt-1">
            {admin.initialRoleId && (
              <button
                type="button"
                onClick={handleReset}
                className={cn(
                  satoshi.className,
                  "flex items-center gap-1.5 text-[0.875rem] text-[#6EC93E] hover:text-[#5cb535] transition-colors",
                )}
              >
                <Icon icon="solar:restart-bold" className="w-4 h-4" />
                Reset to template
              </button>
            )}
            <div className="ml-auto flex gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
                className={cn(
                  satoshi.className,
                  "px-4! py-2 rounded-lg border-[#E5E7EB] text-[0.875rem] font-medium text-[#374151] hover:bg-[#F9FAFB]",
                )}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                loading={submitting}
                className={cn(
                  satoshi.className,
                  "px-4! py-2 rounded-lg bg-[#6EC93E] text-white text-[0.875rem] font-medium hover:bg-[#5cb535]",
                )}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

type ConfirmState = { type: "deactivate" | "activate"; target: AdminRecord };

const fmtExpiry = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diffH = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
  if (diffH < 0) return "Expired";
  if (diffH < 1) return "< 1h left";
  if (diffH < 24) return `${diffH}h left`;
  return fmt(d);
};

const TeamAdmins = () => {
  const { admin, hydrated } = useAuthStore();
  const { admins, invites, meta, loading, toggleAdminActive, fetchAdmins, fetchInvites } = useTeamStore();
  const LIMIT = 50;
  const canWrite = hasPermission(
    admin?.permissions ?? {},
    admin?.isSuper ?? false,
    "adminManagement",
    "write",
  );

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminRecord | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setConfirmLoading(true);
    try {
      await toggleAdminActive(
        confirmModal.target.id,
        confirmModal.type === "activate",
      );
      toast.success(
        confirmModal.type === "activate"
          ? "Admin activated"
          : "Admin deactivated",
      );
      setConfirmModal(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  const adminColumns = useMemo(
    () => [
      {
        title: "Name",
        minWidth: 200,
        customTableBody: (a: AdminRecord) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6EC93E]/15 border border-[#6EC93E]/30 flex items-center justify-center shrink-0">
              <span
                className={cn(
                  poppins.className,
                  "text-[0.6875rem] font-bold text-[#6EC93E]",
                )}
              >
                {a.firstName[0]}
                {a.lastName[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-semibold text-[#111827] truncate",
                )}
              >
                {a.firstName} {a.lastName}
              </p>
              {a.isSuper && (
                <span
                  className={cn(
                    satoshi.className,
                    "text-[0.75rem] text-[#6EC93E]",
                  )}
                >
                  Super Admin
                </span>
              )}
            </div>
          </div>
        ),
      },
      "Email",
      "Role",
      {
        title: "Status",
        width: 120,
        customTableBody: (s: "active" | "inactive") => (
          <StatusChip status={s} />
        ),
      },
      "Last Login",
      {
        title: "",
        width: 180,
        customTableBody: (a: AdminRecord) => {
          if (a.isSuper) {
            return (
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#D1D5DB] italic select-none",
                )}
              >
                read only
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5">
              {canWrite && (
                <button
                  onClick={() => setEditAdmin(a)}
                  className={cn(
                    satoshi.className,
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors",
                  )}
                >
                  <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
              {canWrite && (
                <button
                  onClick={() =>
                    setConfirmModal({
                      type: a.isActive ? "deactivate" : "activate",
                      target: a,
                    })
                  }
                  className={cn(
                    satoshi.className,
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.8125rem] border transition-colors",
                    a.isActive
                      ? "text-red-500 border-red-100 hover:bg-red-50"
                      : "text-[#6EC93E] border-[#6EC93E]/20 hover:bg-[#6EC93E]/10",
                  )}
                >
                  <Icon
                    icon={
                      a.isActive
                        ? "solar:close-circle-bold"
                        : "solar:check-circle-bold"
                    }
                    className="w-3.5 h-3.5"
                  />
                  {a.isActive ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [canWrite],
  );

  const adminData = useMemo(
    () =>
      admins.map((a) => [
        a,
        a.email,
        a.isSuper ? "Super Admin" : (a.initialRoleName ?? "Custom"),
        a.isActive ? "active" : "inactive",
        a.lastLoginAt ? fmt(a.lastLoginAt) : "Never",
        a,
      ]),
    [admins],
  );

  const inviteColumns = useMemo(
    () => [
      {
        title: "Name",
        minWidth: 200,
        customTableBody: (inv: PendingInvite) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
              <span
                className={cn(
                  poppins.className,
                  "text-[0.6875rem] font-bold text-[#F59E0B]",
                )}
              >
                {inv.firstName[0]}
                {inv.lastName[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-semibold text-[#111827] truncate",
                )}
              >
                {inv.firstName} {inv.lastName}
              </p>
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#9CA3AF] truncate",
                )}
              >
                {inv.email}
              </p>
            </div>
          </div>
        ),
      },
      "Role",
      "Invited",
      {
        title: "Expires",
        width: 120,
        customTableBody: (exp: string) => (
          <span
            className={cn(
              satoshi.className,
              "text-[0.8125rem]",
              exp === "Expired" ? "text-red-500" : "text-[#F59E0B]",
            )}
          >
            {exp}
          </span>
        ),
      },
    ],
    [],
  );

  const inviteData = useMemo(
    () =>
      invites.map((inv) => [
        inv,
        inv.roleName ?? "Custom",
        fmt(inv.createdAt),
        fmtExpiry(inv.expiresAt),
      ]),
    [invites],
  );

  if (!hydrated) return <TeamSkeleton />;

  const confirmCopy = {
    deactivate: {
      title: "Deactivate Admin",
      message:
        "This admin will lose access to the dashboard immediately. You can reactivate them at any time.",
      label: "Deactivate",
      danger: true,
    },
    activate: {
      title: "Activate Admin",
      message: "This admin will regain access to their assigned modules.",
      label: "Activate",
      danger: false,
    },
  } as const;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className={cn(
              poppins.className,
              "text-[1.25rem] font-bold text-[#111827]",
            )}
          >
            Team
          </h1>
          <p
            className={cn(
              satoshi.className,
              "text-[0.875rem] text-[#9CA3AF] mt-0.5",
            )}
          >
            Manage admin accounts and their permissions
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setInviteOpen(true)}
            className={cn(
              satoshi.className,
              "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6EC93E] text-white text-[0.875rem] font-semibold hover:bg-[#5cb535] transition-colors shadow-sm shadow-[#6EC93E]/20",
            )}
          >
            <Icon icon="solar:user-plus-bold" className="w-4 h-4" />
            Invite Admin
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Tab
          tabs={[
            (active, key, btnProps) => (
              <button
                key={key}
                {...btnProps}
                className={cn(
                  satoshi.className,
                  "p-[.5rem_1rem_.375rem_1rem] text-[0.9375rem] font-medium leading-6 transition-all duration-[.4s]",
                  active ? "text-[#6EC93E]" : "text-[#667185]",
                )}
              >
                Admins
                <span
                  className={cn(
                    "ml-1.5 text-[0.8125rem]",
                    active ? "text-[#6EC93E]/70" : "text-[#9CA3AF]",
                  )}
                >
                  ({admins.length})
                </span>
              </button>
            ),
            (active, key, btnProps) => (
              <button
                key={key}
                {...btnProps}
                className={cn(
                  satoshi.className,
                  "p-[.5rem_1rem_.375rem_1rem] text-[0.9375rem] font-medium leading-6 transition-all duration-[.4s]",
                  active ? "text-[#6EC93E]" : "text-[#667185]",
                )}
              >
                Pending Invites
                {invites.length > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 text-[0.8125rem]",
                      active ? "text-[#6EC93E]/70" : "text-[#9CA3AF]",
                    )}
                  >
                    ({invites.length})
                  </span>
                )}
              </button>
            ),
          ]}
          activeLineProps={{ className: "bg-[#6EC93E]" }}
          tabChildren={[
            <Table
              key="admins"
              columns={adminColumns as any}
              data={adminData as any}
              shouldNotHaveBorder
              loading={loading}
              pagination
              metaData={{
                currentPage: (meta.admins.page - 1) * LIMIT + 1,
                endPage: Math.min(meta.admins.page * LIMIT, meta.admins.total),
                totalRecords: meta.admins.total,
                onPageChange: (offset) => fetchAdmins(Math.floor(offset / LIMIT) + 1),
              }}
              emptyStateProps={{
                svg: "solar:users-group-rounded-bold-duotone",
                title: "No admins yet",
                text: "Invite an admin to get started.",
              }}
            />,
            <Table
              key="invites"
              columns={inviteColumns as any}
              data={inviteData as any}
              shouldNotHaveBorder
              loading={loading}
              pagination
              metaData={{
                currentPage: (meta.invites.page - 1) * LIMIT + 1,
                endPage: Math.min(meta.invites.page * LIMIT, meta.invites.total),
                totalRecords: meta.invites.total,
                onPageChange: (offset) => fetchInvites(Math.floor(offset / LIMIT) + 1),
              }}
              emptyStateProps={{
                svg: "solar:letter-bold-duotone",
                title: "No pending invites",
                text: "All sent invites have been accepted.",
              }}
            />,
          ]}
        />
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <EditPermissionsModal
        admin={editAdmin}
        open={!!editAdmin}
        onClose={() => setEditAdmin(null)}
      />

      {confirmModal && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          title={confirmCopy[confirmModal.type].title}
          message={confirmCopy[confirmModal.type].message}
          confirmLabel={confirmCopy[confirmModal.type].label}
          danger={confirmCopy[confirmModal.type].danger}
          onConfirm={handleConfirm}
          loading={confirmLoading}
        />
      )}
    </>
  );
};

export default TeamAdmins;
