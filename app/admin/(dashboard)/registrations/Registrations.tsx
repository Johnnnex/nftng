/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useRegistrationsStore } from "@/store";
import { Table, Button } from "@/components";
import { hasPermission } from "@/lib/permissions";
import type { RegistrantRecord, RegistrationsTab } from "@/data";

const LIMIT = 50;

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const EVENT_LABELS: Record<string, string> = {
  soccer_tournament: "Football Tournament",
  unchain_summer_conference: "Conference",
  boxing_night: "Boxing Night",
};

// ─── Detail drawer ─────────────────────────────────────────────────────────────

const RegistrantDrawer = ({
  registrant,
  onClose,
  canWrite,
  activeTab,
}: {
  registrant: RegistrantRecord;
  onClose: () => void;
  canWrite: boolean;
  activeTab: RegistrationsTab;
}) => {
  const { markAttendance } = useRegistrationsStore();
  const [acting, setActing] = useState(false);

  const handleMark = useCallback(async () => {
    const newAttended = !registrant.attended;
    setActing(true);
    try {
      await markAttendance(registrant.id, newAttended, activeTab);
      toast.success(newAttended ? "Marked as attended" : "Removed from attendees");
      onClose();
    } catch { toast.error("Action failed"); }
    finally { setActing(false); }
  }, [registrant, activeTab, markAttendance, onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280]">
            <Icon icon="solar:close-square-bold" className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(poppins.className, "text-[0.9375rem] font-semibold text-[#111827] truncate")}>{registrant.alias}</p>
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{registrant.email}</p>
          </div>
          {registrant.attended && (
            <span className={cn(satoshi.className, "px-2.5 py-1 rounded-full text-[0.75rem] font-semibold bg-[#6EC93E]/10 text-[#3a7a1e]")}>
              Attended
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Alias", value: registrant.alias },
              { label: "Email", value: registrant.email },
              { label: "Gender", value: registrant.gender },
              { label: "Country", value: registrant.country },
              { label: "City", value: registrant.city },
              { label: "First Time", value: registrant.firstTimeAttendee === "yes" ? "Yes" : "No" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F9FAFB] rounded-xl px-4 py-3">
                <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{label}</p>
                <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#374151] mt-0.5 break-all")}>{value || "—"}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1.5")}>Registered for</p>
            <div className="flex flex-wrap gap-1.5">
              {(registrant.events as string[]).map((e) => (
                <span key={e} className={cn(satoshi.className, "px-2.5 py-1 bg-[#6EC93E]/10 text-[#3a7a1e] text-[0.75rem] font-medium rounded-full")}>
                  {EVENT_LABELS[e] ?? e}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mb-1.5")}>Topics of Interest</p>
            <div className="flex flex-wrap gap-1.5">
              {(registrant.topicsOfInterest as string[]).map((t) => (
                <span key={t} className={cn(satoshi.className, "px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-[0.75rem] font-medium rounded-full")}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl px-4 py-3">
            <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>Describes You</p>
            <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151] mt-0.5")}>{registrant.whatDescribesYou || "—"}</p>
          </div>

          <div className="flex gap-3 text-[0.75rem] text-[#9CA3AF]">
            <p className={satoshi.className}>Registered: {fmt(registrant.createdAt)}</p>
            {registrant.attendedAt && <p className={satoshi.className}>Attended: {fmt(registrant.attendedAt)}</p>}
          </div>

          {canWrite && (
            <div className="rounded-xl border border-[#E5E7EB] p-4">
              <Button
                loading={acting}
                onClick={handleMark}
                className={cn(
                  satoshi.className,
                  "w-full py-2.5 rounded-xl font-semibold text-[0.9375rem]",
                  registrant.attended
                    ? "bg-white! border! border-[#E5E7EB]! text-[#374151]! hover:bg-[#F9FAFB]!"
                    : "bg-[#6EC93E]! hover:bg-[#5cb535]! text-white!",
                )}
              >
                <Icon icon={registrant.attended ? "solar:close-circle-bold" : "solar:check-circle-bold"} className="w-4 h-4 mr-2" />
                {registrant.attended ? "Remove from Attendees" : "Mark as Attended"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

const Registrations = () => {
  const { admin } = useAuthStore();
  const { registrations, attendees, meta, baseTotals, loading, fetchTab, markAttendance } = useRegistrationsStore();
  const canWrite = hasPermission(admin?.permissions ?? {}, admin?.isSuper ?? false, "registrations", "write");

  const [activeTab, setActiveTab] = useState<RegistrationsTab>("registrations");
  const [activeRegistrant, setActiveRegistrant] = useState<RegistrantRecord | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: RegistrationsTab) => {
    setActiveTab(tab);
    fetchTab(tab, 1, "");
  }, [fetchTab]);

  const handleSearch = useCallback((value: string | number) => {
    fetchTab(activeTab, 1, String(value));
  }, [activeTab, fetchTab]);

  const handleMarkAttendance = useCallback(async (r: RegistrantRecord) => {
    setMarkingId(r.id);
    try {
      await markAttendance(r.id, !r.attended, activeTab);
      toast.success(!r.attended ? "Marked as attended" : "Removed from attendees");
    } catch { toast.error("Action failed"); }
    finally { setMarkingId(null); }
  }, [activeTab, markAttendance]);

  const handleExport = useCallback(() => {
    const a = document.createElement("a");
    a.href = "/api/admin/registrations/export";
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const currentData = activeTab === "registrations" ? registrations : attendees;
  const currentMeta = meta[activeTab];
  const currentLoading = loading[activeTab];

  const columns = useMemo(() => [
    {
      title: "Alias",
      minWidth: 140,
      customTableBody: (r: RegistrantRecord) => (
        <div>
          <p className={cn(satoshi.className, "text-[0.875rem] font-semibold text-[#111827]")}>{r.alias}</p>
          <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF]")}>{r.email}</p>
        </div>
      ),
    },
    {
      title: "Country",
      width: 110,
      customTableBody: (r: RegistrantRecord) => (
        <span className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>{r.country}</span>
      ),
    },
    {
      title: "Events",
      minWidth: 130,
      customTableBody: (r: RegistrantRecord) => (
        <div className="flex flex-wrap gap-1">
          {(r.events as string[]).map((e) => (
            <span key={e} className={cn(satoshi.className, "px-2 py-0.5 text-[0.6875rem] font-medium bg-[#6EC93E]/10 text-[#3a7a1e] rounded-full whitespace-nowrap")}>
              {EVENT_LABELS[e] ?? e}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Date",
      width: 100,
      customTableBody: (r: RegistrantRecord) => (
        <span className={cn(satoshi.className, "text-[0.8125rem] text-[#9CA3AF] whitespace-nowrap")}>{fmt(r.createdAt)}</span>
      ),
    },
    {
      title: "",
      width: 130,
      customTableBody: (r: RegistrantRecord) => (
        <div className="flex items-center gap-1.5">
          {canWrite && (
            <button
              onClick={() => handleMarkAttendance(r)}
              disabled={markingId === r.id}
              title={r.attended ? "Remove from attendees" : "Mark attended"}
              className={cn(
                satoshi.className,
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors disabled:opacity-60",
                r.attended
                  ? "text-red-600 border border-red-100 hover:bg-red-50"
                  : "text-[#6EC93E] border border-[#6EC93E]/30 hover:bg-[#6EC93E]/5",
              )}
            >
              <Icon
                icon={markingId === r.id ? "solar:refresh-bold" : r.attended ? "solar:close-circle-bold" : "solar:check-circle-bold"}
                className={cn("w-3.5 h-3.5", markingId === r.id && "animate-spin")}
              />
              {r.attended ? "Remove" : "Mark"}
            </button>
          )}
          <button
            onClick={() => setActiveRegistrant(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
          >
            <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
            View
          </button>
        </div>
      ),
    },
  ], [canWrite, handleMarkAttendance, markingId]);

  const data = useMemo(() => currentData.map((r) => [r, r, r, r, r]), [currentData]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(poppins.className, "text-[1.25rem] font-bold text-[#111827]")}>
            Registrations
            <span className={cn(satoshi.className, "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]")}>
              ({baseTotals.registrations + baseTotals.attendees} total)
            </span>
          </h1>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-0.5")}>Manage Unchain Summer 2026 event registrants</p>
        </div>
        <Button
          onClick={handleExport}
          variant="secondary"
          className={cn(satoshi.className, "flex items-center gap-2 px-4 py-2 rounded-xl text-[0.875rem] font-medium")}
        >
          <Icon icon="solar:download-bold-duotone" className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {(["registrations", "attendees"] as RegistrationsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              satoshi.className,
              "relative px-4 py-1.5 rounded-lg text-[0.875rem] font-medium transition-colors capitalize z-10",
              activeTab === tab ? "text-[#111827]" : "text-[#6B7280] hover:text-[#374151]",
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="reg-tab-pill"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">
              {tab === "registrations" ? "Registrations" : "Attendees"}
              <span className={cn("ml-1.5 text-[0.75rem]", activeTab === tab ? "text-[#9CA3AF]" : "text-[#D1D5DB]")}>
                ({meta[tab].total})
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          key={activeTab}
          columns={columns as any}
          data={data as any}
          loading={currentLoading}
          pagination
          head
          search={{ show: true, placeholder: "Search alias or email…", onResolve: handleSearch }}
          metaData={{
            currentPage: (currentMeta.page - 1) * LIMIT + 1,
            endPage: Math.min(currentMeta.page * LIMIT, currentMeta.total),
            totalRecords: currentMeta.total,
            onPageChange: (offset) => {
              const search = useRegistrationsStore.getState().search[activeTab];
              fetchTab(activeTab, Math.floor(offset / LIMIT) + 1, search);
            },
          }}
          emptyStateProps={{
            svg: "solar:users-group-two-rounded-bold-duotone",
            title: activeTab === "registrations" ? "No registrations yet" : "No attendees yet",
            text: activeTab === "registrations"
              ? "Event registrations will appear here once submitted."
              : "Use the Registrations tab to mark people as attended.",
          }}
        />
      </div>

      <AnimatePresence>
        {activeRegistrant && (
          <RegistrantDrawer
            registrant={activeRegistrant}
            onClose={() => setActiveRegistrant(null)}
            canWrite={canWrite}
            activeTab={activeTab}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Registrations;
