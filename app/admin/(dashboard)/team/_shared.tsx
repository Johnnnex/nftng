"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";
import { CheckBox, Button } from "@/components";
import { poppins, satoshi } from "@/app/layout";
import { MODULES, MODULE_META } from "@/lib/permissions";
import type { ModuleName, ModulePermissionsMap } from "@/lib/permissions";

// ─── Permission Editor ────────────────────────────────────────────────────────

type PermEditorProps = {
  value: ModulePermissionsMap;
  onChange: (val: ModulePermissionsMap) => void;
};

export const PermissionEditor = ({ value, onChange }: PermEditorProps) => {
  const toggle = (module: ModuleName, action: "read" | "write") => {
    const current = value[module] ?? { read: false, write: false };
    const next = { ...current, [action]: !current[action] };
    if (action === "write" && next.write) next.read = true;
    if (action === "read" && !next.read) next.write = false;
    onChange({ ...value, [module]: next });
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="grid grid-cols-[1fr_72px_72px] px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <span
          className={cn(
            satoshi.className,
            "text-[0.75rem] font-medium text-[#6B7280]",
          )}
        >
          Module
        </span>
        <span
          className={cn(
            satoshi.className,
            "text-[0.75rem] font-medium text-[#6B7280] text-center",
          )}
        >
          Read
        </span>
        <span
          className={cn(
            satoshi.className,
            "text-[0.75rem] font-medium text-[#6B7280] text-center",
          )}
        >
          Write
        </span>
      </div>
      {MODULES.map((key) => {
        const { label, icon } = MODULE_META[key];
        const perms = value[key] ?? { read: false, write: false };
        return (
          <div
            key={key}
            className="grid grid-cols-[1fr_72px_72px] px-4 py-3 border-b border-[#F3F4F6] last:border-0 items-center"
          >
            <div className="flex items-center gap-2.5">
              <Icon icon={icon} className="w-4 h-4 text-[#9CA3AF]" />
              <span
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] text-[#374151]",
                )}
              >
                {label}
              </span>
            </div>
            <div className="flex justify-center">
              <CheckBox
                value={perms.read}
                onChange={() => toggle(key, "read")}
              />
            </div>
            <div
              className={cn(
                "flex justify-center",
                !perms.read && "pointer-events-none opacity-40",
              )}
            >
              <CheckBox
                value={perms.write}
                onChange={() => toggle(key, "write")}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Base Modal ───────────────────────────────────────────────────────────────

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
};

export const Modal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: ModalProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto",
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] sticky top-0 bg-white z-10">
          <h2
            className={cn(
              poppins.className,
              "text-[0.9375rem] font-semibold text-[#111827]",
            )}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <Icon icon="solar:close-bold" className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

export const ConfirmModal = ({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
    <div className="flex flex-col gap-5">
      <p
        className={cn(
          satoshi.className,
          "text-[0.9375rem] text-[#6B7280] leading-relaxed",
        )}
      >
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          type="button"
          onClick={onClose}
          className={cn(
            satoshi.className,
            "px-4 py-2 rounded-lg border-[#E5E7EB] text-[0.875rem] font-medium text-[#374151] hover:bg-[#F9FAFB]",
          )}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          loading={loading}
          className={cn(
            satoshi.className,
            "px-4 py-2 rounded-lg text-white text-[0.875rem] font-medium",
            danger
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#6EC93E] hover:bg-[#5cb535]",
          )}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
