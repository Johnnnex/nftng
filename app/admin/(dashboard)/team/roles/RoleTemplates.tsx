"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn, hasPermission } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useTeamStore } from "@/store";
import { Table, Input, Button } from "@/components";
import {
  ROLE_TEMPLATE_FIELDS,
  type AdminFormField,
  type RoleTemplate,
  roleTemplateSchema,
  type RoleTemplateData,
} from "@/data";
import { Modal, PermissionEditor, ConfirmModal } from "../_shared";
import { MODULE_META } from "@/lib/permissions";
import type { ModuleName, ModulePermissionsMap } from "@/lib/permissions";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RolesSkeleton = () => (
  <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
    <div className="h-14 bg-[#F3F4F6] border-b border-[#E5E7EB]" />
    <div className="p-4 flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`h-16 rounded-xl ${i % 2 === 0 ? "bg-[#F3F4F6]" : "bg-[#F9FAFB]"}`} />
      ))}
    </div>
  </div>
);

// ─── Role Form Modal ──────────────────────────────────────────────────────────

const RoleFormModal = ({
  open,
  onClose,
  editRole,
}: {
  open: boolean;
  onClose: () => void;
  editRole: RoleTemplate | null;
}) => {
  const { createRole, updateRole } = useTeamStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleTemplateData>({
    resolver: zodResolver(roleTemplateSchema),
    defaultValues: { name: "", modulePermissions: {} },
  });

  const [permissions, setPermissions] = useState<ModulePermissionsMap>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editRole) {
        reset({ name: editRole.name, modulePermissions: {} });
        setPermissions({ ...editRole.modulePermissions });
      } else {
        reset({ name: "", modulePermissions: {} });
        setPermissions({});
      }
    }
  }, [open, editRole, reset]);

  const closeAndReset = useCallback(() => {
    reset();
    setPermissions({});
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: RoleTemplateData) => {
    setSubmitting(true);
    try {
      const payload = { name: data.name, modulePermissions: permissions };
      if (editRole) {
        await updateRole(editRole.id, payload);
      } else {
        await createRole(payload);
      }
      toast.success(editRole ? "Role updated" : "Role created");
      closeAndReset();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: AdminFormField) => {
    const err = errors[field.name as keyof RoleTemplateData]?.message as string | undefined;
    return (
      <div key={field.name}>
        <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
          {field.label}
        </label>
        <Input
          type={field.kind}
          placeholder={field.placeholder}
          error={err}
          className={err ? undefined : "border-[#D0D5DD]"}
          {...register(field.name as keyof RoleTemplateData)}
        />
      </div>
    );
  };

  return (
    <Modal open={open} onClose={closeAndReset} title={editRole ? "Edit Role Template" : "New Role Template"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {ROLE_TEMPLATE_FIELDS.map(renderField)}

        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151] mb-2")}>
            Default permissions
          </p>
          <PermissionEditor value={permissions} onChange={setPermissions} />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button
            variant="secondary"
            type="button"
            onClick={closeAndReset}
            className={cn(satoshi.className, "px-4 py-2 rounded-lg border-[#E5E7EB] text-[0.875rem] font-medium text-[#374151] hover:bg-[#F9FAFB]")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            className={cn(satoshi.className, "px-4 py-2 rounded-lg bg-[#6EC93E] text-white text-[0.875rem] font-medium hover:bg-[#5cb535]")}
          >
            {editRole ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

type ConfirmState = { target: RoleTemplate };

const RoleTemplates = () => {
  const { admin, hydrated } = useAuthStore();
  const { roles, meta, loading, deleteRole, fetchRoles } = useTeamStore();
  const LIMIT = 50;
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "adminManagement", "write");

  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleTemplate | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmModal) return;
    setConfirmLoading(true);
    try {
      await deleteRole(confirmModal.target.id);
      toast.success("Role template deleted");
      setConfirmModal(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Delete failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      "Name",
      {
        title: "Modules",
        minWidth: 280,
        customTableBody: (r: RoleTemplate) => (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(r.modulePermissions).length === 0 ? (
              <span className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] italic")}>No permissions</span>
            ) : (
              Object.entries(r.modulePermissions).map(([mod, perm]) => (
                <span
                  key={mod}
                  className={cn(satoshi.className, "flex items-center gap-1 px-2 py-0.5 bg-[#F3F4F6] rounded-full text-[0.75rem] text-[#374151]")}
                >
                  {MODULE_META[mod as ModuleName]?.label ?? mod}
                  <span className="text-[#9CA3AF]">{perm.write ? "r/w" : "r"}</span>
                </span>
              ))
            )}
          </div>
        ),
      },
      {
        title: "Assigned",
        width: 110,
        customTableBody: (count: number) => (
          <span className={cn(satoshi.className, "text-[0.875rem]", count > 0 ? "text-[#374151] font-medium" : "text-[#9CA3AF]")}>
            {count} {count === 1 ? "admin" : "admins"}
          </span>
        ),
      },
      "Created",
      {
        title: "",
        width: 100,
        customTableBody: (r: RoleTemplate) => (
          <div className="flex items-center gap-1.5">
            {canWrite && (
              <button
                onClick={() => setEditRole(r)}
                className={cn(satoshi.className, "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors")}
              >
                <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            {canWrite && (
              <button
                onClick={() => setConfirmModal({ target: r })}
                disabled={r.assignedCount > 0}
                title={r.assignedCount > 0 ? "Cannot delete — role is assigned to admins" : "Delete role"}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [canWrite],
  );

  const data = useMemo(
    () => roles.map((r) => [r.name, r, r.assignedCount, fmt(r.createdAt), r]),
    [roles],
  );

  if (!hydrated) return <RolesSkeleton />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Role Templates
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>
              ({roles.length})
            </span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>
            Define permission presets to apply when inviting admins
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setCreateOpen(true)}
            className={cn(satoshi.className, "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6EC93E] text-white text-[0.875rem] font-semibold hover:bg-[#5cb535] transition-colors shadow-sm shadow-[#6EC93E]/20")}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            New Role
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={loading}
          pagination
          metaData={{
            currentPage: (meta.roles.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.roles.page * LIMIT, meta.roles.total),
            totalRecords: meta.roles.total,
            onPageChange: (offset) => fetchRoles(Math.floor(offset / LIMIT) + 1),
          }}
          emptyStateProps={{
            svg: "solar:shield-bold-duotone",
            title: "No role templates",
            text: "Create a role template to quickly assign permissions when inviting admins.",
          }}
        />
      </div>

      <RoleFormModal
        open={createOpen || !!editRole}
        onClose={() => { setCreateOpen(false); setEditRole(null); }}
        editRole={editRole}
      />

      {confirmModal && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          title="Delete Role Template"
          message="This role template will be permanently deleted. Admins currently using it will keep their existing permissions."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          loading={confirmLoading}
        />
      )}
    </>
  );
};

export default RoleTemplates;
