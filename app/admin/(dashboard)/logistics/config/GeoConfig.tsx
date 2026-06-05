/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useLogisticsStore } from "@/store";
import { Input, Button, Table } from "@/components";
import { hasPermission } from "@/lib/permissions";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  geoCountrySchema,
  geoStateSchema,
  geoCitySchema,
  geoDeliveryPriceSchema,
  type GeoCountryFormData,
  type GeoStateFormData,
  type GeoCityFormData,
  type GeoDeliveryPriceFormData,
} from "@/data";
import type { GeoCountry, GeoState, GeoCity, DeliveryConfig } from "@/data";

const METHODS = ["park", "gig", "direct"] as const;
type Method = (typeof METHODS)[number];
const LIMIT = 50;

// ─── GeoModal — no X button, backdrop click or Cancel to close ────────────────

type GeoModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
};

const GeoModal = ({
  title,
  children,
  onClose,
  onSubmit,
  loading,
  submitLabel = "Save",
}: GeoModalProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <motion.div
      initial={{ scale: 0.95, y: 8 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 8 }}
      transition={{ duration: 0.18 }}
      className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5"
    >
      <p
        className={cn(
          poppins.className,
          "text-[1rem] font-semibold text-[#111827]",
        )}
      >
        {title}
      </p>
      {children}
      <div className="flex gap-3 pt-1">
        <Button
          variant="secondary"
          onClick={onClose}
          className={cn(
            satoshi.className,
            "flex-1 py-2.5 rounded-xl text-[0.875rem]",
          )}
        >
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={onSubmit}
          className={cn(
            satoshi.className,
            "flex-1 py-2.5 rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem]",
          )}
        >
          {submitLabel}
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Import Modal ─────────────────────────────────────────────────────────────

type CsvResult = {
  total: number;
  succeeded: number;
  skipped: number;
  errors: string[];
};

// Fuzzy name match — tolerates casing, extra spaces, partial containment
const fuzzyMatch = (csvName: string, dbName: string): boolean => {
  const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
  const a = norm(csvName);
  const b = norm(dbName);
  if (a === b) return true;
  if (b.includes(a) || a.includes(b)) return true;
  // Word-level: every word in the CSV term appears somewhere in the DB name
  const aWords = a.split(/[\s/,]+/).filter(Boolean);
  return aWords.length > 0 && aWords.every((w) => b.includes(w));
};

const ImportModal = ({ onClose }: { onClose: () => void }) => {
  const { countries, fetchStates, fetchCities, upsertDeliveryConfig } =
    useLogisticsStore();
  const [importing, setImporting] = useState(false);
  const [csvResult, setCsvResult] = useState<CsvResult | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = [
      "country_name,city_name,state_name,method,price,estimated_days",
      "Nigeria,Ikeja,Lagos,park,2500,1-2 business days",
      "Nigeria,Ikeja,Lagos,gig,3000,2-3 business days",
      "Nigeria,Ibadan,Oyo,park,3500,2-4 business days",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "delivery-config-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvRow = (line: string) => {
    const fields: string[] = [];
    let current = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuote = !inQuote;
        continue;
      }
      if (ch === "," && !inQuote) {
        fields.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    fields.push(current.trim());
    return fields;
  };

  const handleCsvImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (csvInputRef.current) csvInputRef.current.value = "";
      setImporting(true);
      setCsvResult(null);
      try {
        const text = await file.text();
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length < 2) {
          toast.error("CSV must have a header row and at least one data row");
          return;
        }
        const header = parseCsvRow(lines[0]).map((h) =>
          h.toLowerCase().replace(/\s+/g, "_"),
        );
        const countryNameIdx = header.indexOf("country_name");
        const cityNameIdx = header.indexOf("city_name");
        const stateNameIdx = header.indexOf("state_name");
        const methodIdx = header.indexOf("method");
        const priceIdx = header.indexOf("price");
        const estimatedDaysIdx = header.indexOf("estimated_days");

        if (cityNameIdx === -1 || methodIdx === -1 || priceIdx === -1) {
          toast.error("CSV must have columns: city_name, method, price");
          return;
        }

        const results: CsvResult = {
          total: 0,
          succeeded: 0,
          skipped: 0,
          errors: [],
        };

        // Per-fetch caches to avoid redundant API calls during the import loop
        const stateCache = new Map<string, GeoState[]>(); // countryId → states
        const cityCache = new Map<string, GeoCity[]>(); // stateId → cities

        for (let i = 1; i < lines.length; i++) {
          const fields = parseCsvRow(lines[i]);
          results.total++;
          const cityName = fields[cityNameIdx]?.trim();
          const stateName =
            stateNameIdx >= 0 ? fields[stateNameIdx]?.trim() : undefined;
          const countryName =
            countryNameIdx >= 0 ? fields[countryNameIdx]?.trim() : undefined;
          const rowMethod = fields[methodIdx]?.trim().toLowerCase() as Method;
          const rowPrice = parseFloat(fields[priceIdx]?.trim() ?? "");
          const rowEstDays =
            estimatedDaysIdx >= 0
              ? fields[estimatedDaysIdx]?.trim()
              : undefined;

          if (
            !cityName ||
            !METHODS.includes(rowMethod) ||
            isNaN(rowPrice) ||
            rowPrice < 0
          ) {
            results.skipped++;
            results.errors.push(`Row ${i + 1}: invalid data — skipped`);
            continue;
          }

          // Resolve country
          const matchedCountry = countryName
            ? countries.find((c) => fuzzyMatch(countryName, c.name))
            : undefined;

          let matchedCityId: string | undefined;

          if (stateName) {
            // Need states for this country — fetch if not cached
            let statesForCountry: GeoState[] = [];
            if (matchedCountry) {
              if (!stateCache.has(matchedCountry.id)) {
                await fetchStates(matchedCountry.id);
                stateCache.set(
                  matchedCountry.id,
                  useLogisticsStore.getState().states,
                );
              }
              statesForCountry = stateCache.get(matchedCountry.id) ?? [];
            } else {
              // No country specified — search already-loaded states
              statesForCountry = useLogisticsStore.getState().states;
            }

            const matchedState = statesForCountry.find((s) =>
              fuzzyMatch(stateName, s.name),
            );
            if (matchedState) {
              if (!cityCache.has(matchedState.id)) {
                await fetchCities(matchedState.id);
                cityCache.set(
                  matchedState.id,
                  useLogisticsStore.getState().cities,
                );
              }
              const citiesForState = cityCache.get(matchedState.id) ?? [];
              matchedCityId = citiesForState.find((c) =>
                fuzzyMatch(cityName, c.name),
              )?.id;
            }
          } else {
            // No state hint — search currently loaded cities
            matchedCityId = useLogisticsStore
              .getState()
              .cities.find((c) => fuzzyMatch(cityName, c.name))?.id;
          }

          if (!matchedCityId) {
            results.skipped++;
            results.errors.push(
              `Row ${i + 1}: city "${cityName}" not found — skipped`,
            );
            continue;
          }

          try {
            await upsertDeliveryConfig({
              cityId: matchedCityId,
              method: rowMethod,
              price: rowPrice,
              estimatedDays: rowEstDays || undefined,
            });
            results.succeeded++;
          } catch {
            results.skipped++;
            results.errors.push(`Row ${i + 1}: save failed — skipped`);
          }
        }

        setCsvResult(results);
        toast.success(
          `Import done: ${results.succeeded} saved, ${results.skipped} skipped`,
        );
      } catch {
        toast.error("Failed to parse CSV");
      } finally {
        setImporting(false);
      }
    },
    [upsertDeliveryConfig, countries, fetchStates, fetchCities],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-[#F3F4F6]">
          <p
            className={cn(
              poppins.className,
              "text-[1rem] font-semibold text-[#111827]",
            )}
          >
            Bulk Import Delivery Configs
          </p>
          <p
            className={cn(
              satoshi.className,
              "text-[0.8125rem] text-[#9CA3AF] mt-1",
            )}
          >
            Download the template, fill in your delivery prices, then upload.
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          <div className="rounded-xl bg-[#F9FAFB] border border-[#F3F4F6] p-4 flex flex-col gap-2.5">
            <p
              className={cn(
                satoshi.className,
                "text-[0.8125rem] font-semibold text-[#374151]",
              )}
            >
              How it works
            </p>
            {[
              "Download the CSV template below",
              "Fill in city, state, method (park/gig/direct), price, and optional estimated days",
              "Upload — existing entries update, new ones are created",
              "Cities not found in the system are skipped (load them via Cities tab first)",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    satoshi.className,
                    "shrink-0 w-5 h-5 rounded-full bg-[#6EC93E] text-white text-[0.6875rem] font-bold flex items-center justify-center mt-0.5",
                  )}
                >
                  {i + 1}
                </span>
                <p
                  className={cn(
                    satoshi.className,
                    "text-[0.8125rem] text-[#6B7280]",
                  )}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-3">
            <p
              className={cn(
                satoshi.className,
                "text-[0.75rem] font-semibold text-[#374151] mb-1",
              )}
            >
              CSV columns
            </p>
            <code className="text-[0.75rem] text-[#16A34A] font-mono">
              country_name, city_name, state_name, method, price, estimated_days
            </code>
            <p
              className={cn(
                satoshi.className,
                "text-[0.75rem] text-[#9CA3AF] mt-1",
              )}
            >
              <code className="font-mono">country_name</code>,{" "}
              <code className="font-mono">state_name</code>, and{" "}
              <code className="font-mono">estimated_days</code> are optional but recommended for accurate matching.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              className={cn(
                satoshi.className,
                "flex items-center gap-2 flex-1 justify-center py-2.5! px-0! rounded-xl text-[0.875rem]",
              )}
            >
              <Icon icon="solar:download-bold" className="w-4 h-4" />
              Download Template
            </Button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvImport}
            />
            <Button
              loading={importing}
              onClick={() => csvInputRef.current?.click()}
              className={cn(
                satoshi.className,
                "flex items-center gap-2 flex-1 justify-center py-2.5! px-0! rounded-xl bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.875rem]",
              )}
            >
              <Icon icon="solar:upload-bold" className="w-4 h-4" />
              {importing ? "Importing…" : "Upload CSV"}
            </Button>
          </div>

          {csvResult && (
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-[#F3F4F6]">
                {[
                  {
                    label: "Total rows",
                    value: csvResult.total,
                    color: "text-[#374151]",
                  },
                  {
                    label: "Saved",
                    value: csvResult.succeeded,
                    color: "text-[#6EC93E]",
                  },
                  {
                    label: "Skipped",
                    value: csvResult.skipped,
                    color:
                      csvResult.skipped > 0
                        ? "text-amber-500"
                        : "text-[#9CA3AF]",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center py-3 px-4"
                  >
                    <p
                      className={cn(
                        satoshi.className,
                        "text-[1.25rem] font-bold",
                        color,
                      )}
                    >
                      {value}
                    </p>
                    <p
                      className={cn(
                        satoshi.className,
                        "text-[0.75rem] text-[#9CA3AF]",
                      )}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              {csvResult.errors.length > 0 && (
                <div className="px-4 py-3 border-t border-[#F3F4F6] max-h-32 overflow-y-auto">
                  {csvResult.errors.map((err, i) => (
                    <p
                      key={i}
                      className={cn(
                        satoshi.className,
                        "text-[0.75rem] text-amber-600",
                      )}
                    >
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-[#F3F4F6]">
          <Button
            variant="secondary"
            onClick={onClose}
            className={cn(
              satoshi.className,
              "w-full py-2.5 rounded-xl text-[0.875rem]",
            )}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = ["Countries", "States", "Cities", "Delivery Prices"] as const;
type Tab = (typeof TABS)[number];

// ─── Shared selection state (lifted to GeoConfig parent) ─────────────────────

type GeoSel = {
  selCountry: string;
  selState: string;
  selCity: string;
  statesLoading: boolean;
  citiesLoading: boolean;
  deliveryConfigsLoading: boolean;
  onCountryChange: (id: string) => void;
  onStateChange: (id: string) => void;
  onCityChange: (id: string) => void;
};

// ─── Countries ────────────────────────────────────────────────────────────────

const CountriesTab = ({ canWrite }: { canWrite: boolean }) => {
  const { countries, geoLoading, createCountry, updateCountry, deleteCountry } =
    useLogisticsStore();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    item?: GeoCountry;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register: reg,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeoCountryFormData>({ resolver: zodResolver(geoCountrySchema) });

  const onSearchResolve = useCallback(
    (v: string | number) => setSearch(String(v)),
    [],
  );

  const openAdd = () => {
    reset({ name: "", code: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (c: GeoCountry) => {
    reset({ name: c.name, code: c.code });
    setModal({ mode: "edit", item: c });
  };

  const onSave = async (data: GeoCountryFormData) => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await createCountry({ name: data.name, code: data.code });
        toast.success("Country added");
      } else if (modal?.item) {
        await updateCountry(modal.item.id, { name: data.name, code: data.code });
        toast.success("Country updated");
      }
      setModal(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !confirm(
          "Delete this country? All states, cities, and delivery configs under it will also be deleted.",
        )
      )
        return;
      try {
        await deleteCountry(id);
        toast.success("Deleted");
      } catch (e: any) {
        toast.error(e?.response?.data?.error ?? "Failed");
      }
    },
    [deleteCountry],
  );

  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search]);

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const pageData = useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT),
    [filtered, page],
  );

  const columns = useMemo(
    () => [
      {
        title: "Code",
        width: 80,
        customTableBody: (r: GeoCountry) => (
          <span
            className={cn(
              satoshi.className,
              "text-[0.8125rem] font-bold text-[#374151] bg-[#F3F4F6] rounded px-2 py-0.5",
            )}
          >
            {r.code}
          </span>
        ),
      },
      {
        title: "Name",
        customTableBody: (r: GeoCountry) => (
          <span
            className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}
          >
            {r.name}
          </span>
        ),
      },
      {
        title: "",
        width: 80,
        customTableBody: (r: GeoCountry) =>
          canWrite ? (
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => openEdit(r)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <Icon icon="solar:pen-bold" className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            </div>
          ) : null,
      },
    ],
    [canWrite, handleDelete],
  );

  const data = useMemo(() => pageData.map((r) => [r, r, r]), [pageData]);

  return (
    <>
      <div className="max-w-3xl flex items-center justify-between mb-4">
        <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}>
          {countries.length} countries
        </p>
        {canWrite && (
          <Button
            onClick={openAdd}
            className={cn(
              satoshi.className,
              "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white text-[0.875rem] font-semibold transition-colors",
            )}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add
            Country
          </Button>
        )}
      </div>

      <Table
        columns={columns as any}
        data={data as any}
        loading={geoLoading}
        head
        search={{
          show: true,
          placeholder: "Search by name or code…",
          onResolve: onSearchResolve,
        }}
        pagination
        metaData={{
          currentPage: (page - 1) * LIMIT + 1,
          endPage: Math.min(page * LIMIT, filtered.length),
          totalRecords: filtered.length,
          onPageChange: (offset) => setPage(Math.floor(offset / LIMIT) + 1),
        }}
        emptyStateProps={{
          svg: "solar:global-bold-duotone",
          title: "No countries yet",
          text: "Add a country to get started.",
        }}
      />

      <AnimatePresence>
        {modal && (
          <GeoModal
            title={modal.mode === "add" ? "Add Country" : "Edit Country"}
            onClose={() => setModal(null)}
            onSubmit={handleSubmit(onSave)}
            loading={saving}
          >
            <div className="flex flex-col gap-3">
              <div>
                <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                  Country Name *
                </label>
                <Input
                  type="text"
                  {...reg("name")}
                  error={errors.name?.message}
                  className={errors.name?.message ? undefined : "border-[#D0D5DD]"}
                  placeholder="e.g. Nigeria"
                />
              </div>
              <div>
                <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                  ISO Code *{" "}
                  <span className="font-normal text-[#9CA3AF]">(2 letters)</span>
                </label>
                <Input
                  type="text"
                  {...reg("code")}
                  error={errors.code?.message}
                  className={errors.code?.message ? undefined : "border-[#D0D5DD]"}
                  placeholder="e.g. NG"
                />
              </div>
            </div>
          </GeoModal>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── States ───────────────────────────────────────────────────────────────────

const StatesTab = ({ canWrite, sel }: { canWrite: boolean; sel: GeoSel }) => {
  const { countries, states, createState, updateState, deleteState } =
    useLogisticsStore();
  const { selCountry, statesLoading, onCountryChange } = sel;

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    item?: GeoState;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register: reg,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeoStateFormData>({ resolver: zodResolver(geoStateSchema) });

  const onSearchResolve = useCallback(
    (v: string | number) => setSearch(String(v)),
    [],
  );

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [countries],
  );

  const openAdd = () => {
    reset({ name: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (s: GeoState) => {
    reset({ name: s.name });
    setModal({ mode: "edit", item: s });
  };

  const onSave = async (data: GeoStateFormData) => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await createState({ countryId: selCountry, name: data.name });
        toast.success("State added");
      } else if (modal?.item) {
        await updateState(modal.item.id, { name: data.name });
        toast.success("State updated");
      }
      setModal(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !confirm(
          "Delete this state? Cities and delivery configs under it will also be deleted.",
        )
      )
        return;
      try {
        await deleteState(id);
        toast.success("Deleted");
      } catch (e: any) {
        toast.error(e?.response?.data?.error ?? "Failed");
      }
    },
    [deleteState],
  );

  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search, selCountry]);

  const filtered = useMemo(() => {
    if (!search.trim()) return states;
    const q = search.toLowerCase();
    return states.filter((s) => s.name.toLowerCase().includes(q));
  }, [states, search]);

  const pageData = useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT),
    [filtered, page],
  );

  const columns = useMemo(
    () => [
      {
        title: "Name",
        customTableBody: (r: GeoState) => (
          <span
            className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}
          >
            {r.name}
          </span>
        ),
      },
      {
        title: "",
        width: 80,
        customTableBody: (r: GeoState) =>
          canWrite ? (
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => openEdit(r)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <Icon icon="solar:pen-bold" className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            </div>
          ) : null,
      },
    ],
    [canWrite, handleDelete],
  );

  const data = useMemo(() => pageData.map((r) => [r, r]), [pageData]);

  return (
    <>
      <div className="max-w-3xl flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            type="select"
            value={selCountry}
            placeholder="Select country"
            selectOptions={countryOptions}
            onChange={(e: any) => onCountryChange((e as any).target.value)}
          />
        </div>
        {canWrite && (
          <Button
            loading={statesLoading}
            disabled={!selCountry || statesLoading}
            onClick={openAdd}
            className={cn(
              satoshi.className,
              "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add State
          </Button>
        )}
      </div>

      <Table
        columns={columns as any}
        data={data as any}
        loading={statesLoading}
        head
        search={{
          show: true,
          placeholder: "Search states…",
          onResolve: onSearchResolve,
        }}
        pagination
        metaData={{
          currentPage: (page - 1) * LIMIT + 1,
          endPage: Math.min(page * LIMIT, filtered.length),
          totalRecords: filtered.length,
          onPageChange: (offset) => setPage(Math.floor(offset / LIMIT) + 1),
        }}
        emptyStateProps={{
          svg: "solar:map-point-bold-duotone",
          title: selCountry ? "No states yet" : "Select a country",
          text: selCountry
            ? "Add a state to get started."
            : "Choose a country to see its states.",
        }}
      />

      <AnimatePresence>
        {modal && (
          <GeoModal
            title={modal.mode === "add" ? "Add State" : "Edit State"}
            onClose={() => setModal(null)}
            onSubmit={handleSubmit(onSave)}
            loading={saving}
          >
            <div>
              <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                State Name *
              </label>
              <Input
                type="text"
                {...reg("name")}
                error={errors.name?.message}
                className={errors.name?.message ? undefined : "border-[#D0D5DD]"}
                placeholder="e.g. Lagos"
              />
            </div>
          </GeoModal>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Cities ───────────────────────────────────────────────────────────────────

const CitiesTab = ({ canWrite, sel }: { canWrite: boolean; sel: GeoSel }) => {
  const { countries, states, cities, createCity, updateCity, deleteCity } =
    useLogisticsStore();
  const {
    selCountry,
    selState,
    statesLoading,
    citiesLoading,
    onCountryChange,
    onStateChange,
  } = sel;

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    item?: GeoCity;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register: reg,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeoCityFormData>({ resolver: zodResolver(geoCitySchema) });

  const onSearchResolve = useCallback(
    (v: string | number) => setSearch(String(v)),
    [],
  );

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [countries],
  );
  const stateOptions = useMemo(
    () => states.map((s) => ({ value: s.id, label: s.name })),
    [states],
  );

  const openAdd = () => {
    reset({ name: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (c: GeoCity) => {
    reset({ name: c.name });
    setModal({ mode: "edit", item: c });
  };

  const onSave = async (data: GeoCityFormData) => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await createCity({ stateId: selState, name: data.name });
        toast.success("City added");
      } else if (modal?.item) {
        await updateCity(modal.item.id, { name: data.name });
        toast.success("City updated");
      }
      setModal(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !confirm(
          "Delete this city? Delivery configs under it will also be deleted.",
        )
      )
        return;
      try {
        await deleteCity(id);
        toast.success("Deleted");
      } catch (e: any) {
        toast.error(e?.response?.data?.error ?? "Failed");
      }
    },
    [deleteCity],
  );

  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search, selState]);

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, search]);

  const pageData = useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT),
    [filtered, page],
  );

  const columns = useMemo(
    () => [
      {
        title: "Name",
        customTableBody: (r: GeoCity) => (
          <span
            className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}
          >
            {r.name}
          </span>
        ),
      },
      {
        title: "",
        width: 80,
        customTableBody: (r: GeoCity) =>
          canWrite ? (
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => openEdit(r)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <Icon icon="solar:pen-bold" className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            </div>
          ) : null,
      },
    ],
    [canWrite, handleDelete],
  );

  const data = useMemo(() => pageData.map((r) => [r, r]), [pageData]);

  return (
    <>
      <div className="max-w-3xl flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-36">
          <Input
            type="select"
            value={selCountry}
            placeholder="Country"
            selectOptions={countryOptions}
            onChange={(e: any) => onCountryChange((e as any).target.value)}
          />
        </div>
        <div className="flex-1 min-w-36">
          <Input
            type="select"
            value={selState}
            placeholder="State"
            selectOptions={stateOptions}
            disabled={!selCountry || statesLoading}
            onChange={(e: any) => onStateChange((e as any).target.value)}
          />
        </div>
        {canWrite && (
          <Button
            loading={statesLoading || citiesLoading}
            disabled={!selState || statesLoading || citiesLoading}
            onClick={openAdd}
            className={cn(
              satoshi.className,
              "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add City
          </Button>
        )}
      </div>

      <Table
        columns={columns as any}
        data={data as any}
        loading={citiesLoading}
        head
        search={{
          show: true,
          placeholder: "Search cities…",
          onResolve: onSearchResolve,
        }}
        pagination
        metaData={{
          currentPage: (page - 1) * LIMIT + 1,
          endPage: Math.min(page * LIMIT, filtered.length),
          totalRecords: filtered.length,
          onPageChange: (offset) => setPage(Math.floor(offset / LIMIT) + 1),
        }}
        emptyStateProps={{
          svg: "solar:city-bold-duotone",
          title: selState ? "No cities yet" : "Select a country and state",
          text: selState
            ? "Add a city or zone to get started."
            : "Choose a country then state to see cities.",
        }}
      />

      <AnimatePresence>
        {modal && (
          <GeoModal
            title={
              modal.mode === "add" ? "Add City / Zone" : "Edit City / Zone"
            }
            onClose={() => setModal(null)}
            onSubmit={handleSubmit(onSave)}
            loading={saving}
          >
            <div>
              <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                Name *
              </label>
              <Input
                type="text"
                {...reg("name")}
                error={errors.name?.message}
                className={errors.name?.message ? undefined : "border-[#D0D5DD]"}
                placeholder="e.g. Lagos Island"
              />
              <p className={cn(satoshi.className, "text-[0.75rem] text-[#9CA3AF] mt-1")}>
                Lagos LGA zones go here too (e.g. "Somolu/Yaba/Bariga")
              </p>
            </div>
          </GeoModal>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Delivery Prices ──────────────────────────────────────────────────────────

const DeliveryPricesTab = ({
  canWrite,
  sel,
}: {
  canWrite: boolean;
  sel: GeoSel;
}) => {
  const {
    countries,
    states,
    cities,
    deliveryConfigs,
    upsertDeliveryConfig,
    deleteDeliveryConfig,
  } = useLogisticsStore();
  const {
    selCountry,
    selState,
    selCity,
    statesLoading,
    citiesLoading,
    deliveryConfigsLoading,
    onCountryChange,
    onStateChange,
    onCityChange,
  } = sel;

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    item?: DeliveryConfig;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register: reg,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GeoDeliveryPriceFormData>({
    resolver: zodResolver(geoDeliveryPriceSchema),
  });

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [countries],
  );
  const stateOptions = useMemo(
    () => states.map((s) => ({ value: s.id, label: s.name })),
    [states],
  );
  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c.id, label: c.name })),
    [cities],
  );
  const methodOptions = METHODS.map((m) => ({
    value: m,
    label: m.charAt(0).toUpperCase() + m.slice(1),
  }));

  const openAdd = () => {
    reset({ method: "park", price: 0, estimatedDays: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (dc: DeliveryConfig) => {
    reset({ method: dc.method, price: dc.price, estimatedDays: dc.estimatedDays ?? "" });
    setModal({ mode: "edit", item: dc });
  };

  const onSave = async (data: GeoDeliveryPriceFormData) => {
    setSaving(true);
    try {
      await upsertDeliveryConfig({
        cityId: selCity,
        method: data.method,
        price: data.price,
        estimatedDays: data.estimatedDays || undefined,
      });
      toast.success("Config saved");
      setModal(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this delivery config?")) return;
      try {
        await deleteDeliveryConfig(id);
        toast.success("Deleted");
      } catch (e: any) {
        toast.error(e?.response?.data?.error ?? "Failed");
      }
    },
    [deleteDeliveryConfig],
  );

  const columns = useMemo(
    () => [
      {
        title: "Method",
        width: 110,
        customTableBody: (r: DeliveryConfig) => (
          <span
            className={cn(
              satoshi.className,
              "text-[0.875rem] font-semibold text-[#374151] capitalize",
            )}
          >
            {r.method}
          </span>
        ),
      },
      {
        title: "Price",
        width: 130,
        customTableBody: (r: DeliveryConfig) => (
          <span
            className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}
          >
            &#8358;{Number(r.price).toLocaleString()}
          </span>
        ),
      },
      {
        title: "Est. Days",
        customTableBody: (r: DeliveryConfig) => (
          <span
            className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF]")}
          >
            {r.estimatedDays ?? "—"}
          </span>
        ),
      },
      {
        title: "",
        width: 80,
        customTableBody: (r: DeliveryConfig) =>
          canWrite ? (
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => openEdit(r)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                <Icon icon="solar:pen-bold" className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </button>
            </div>
          ) : null,
      },
    ],
    [canWrite, handleDelete],
  );

  const data = useMemo(
    () => deliveryConfigs.map((r) => [r, r, r, r]),
    [deliveryConfigs],
  );
  const anyLoading = statesLoading || citiesLoading || deliveryConfigsLoading;

  return (
    <>
      <div className="max-w-3xl flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-32">
          <Input
            type="select"
            value={selCountry}
            placeholder="Country"
            selectOptions={countryOptions}
            onChange={(e: any) => onCountryChange((e as any).target.value)}
          />
        </div>
        <div className="flex-1 min-w-32">
          <Input
            type="select"
            value={selState}
            placeholder="State"
            selectOptions={stateOptions}
            disabled={!selCountry || statesLoading}
            onChange={(e: any) => onStateChange((e as any).target.value)}
          />
        </div>
        <div className="flex-1 min-w-32">
          <Input
            type="select"
            value={selCity}
            placeholder="City"
            selectOptions={cityOptions}
            disabled={!selState || citiesLoading}
            onChange={(e: any) => onCityChange((e as any).target.value)}
          />
        </div>
        {canWrite && (
          <Button
            loading={anyLoading}
            disabled={!selCity || anyLoading}
            onClick={openAdd}
            className={cn(
              satoshi.className,
              "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1f2937] text-white text-[0.875rem] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" /> Add Config
          </Button>
        )}
      </div>

      <Table
        columns={columns as any}
        data={data as any}
        loading={deliveryConfigsLoading}
        nonScrollable
        emptyStateProps={{
          svg: "solar:dollar-minimalistic-bold-duotone",
          title: selCity ? "No delivery configs yet" : "Select a city",
          text: selCity
            ? "Add a config for park, gig, or direct delivery."
            : "Choose country → state → city to see configs.",
        }}
      />

      <AnimatePresence>
        {modal && (
          <GeoModal
            title={
              modal.mode === "add"
                ? "Add Delivery Config"
                : "Edit Delivery Config"
            }
            onClose={() => setModal(null)}
            onSubmit={handleSubmit(onSave)}
            loading={saving}
          >
            <div className="flex flex-col gap-3">
              <div>
                <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                  Method *
                </label>
                <Controller
                  name="method"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="select"
                      value={field.value}
                      selectOptions={methodOptions}
                      onChange={(e: any) => field.onChange(e.target.value)}
                      error={errors.method?.message}
                      className={errors.method?.message ? undefined : "border-[#D0D5DD]"}
                    />
                  )}
                />
              </div>
              <div>
                <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                  Price (&#8358;) *
                </label>
                <Input
                  type="number"
                  {...reg("price", { valueAsNumber: true })}
                  error={errors.price?.message}
                  className={errors.price?.message ? undefined : "border-[#D0D5DD]"}
                  placeholder="e.g. 3000"
                />
              </div>
              <div>
                <label className={cn(satoshi.className, "block text-[0.875rem] font-medium text-[#374151] mb-1.5")}>
                  Estimated days{" "}
                  <span className="font-normal text-[#9CA3AF]">(optional)</span>
                </label>
                <Input
                  type="text"
                  {...reg("estimatedDays")}
                  className="border-[#D0D5DD]"
                  placeholder="e.g. 3-10 business days"
                />
              </div>
            </div>
          </GeoModal>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── GeoConfig ────────────────────────────────────────────────────────────────

const GeoConfig = () => {
  const { admin } = useAuthStore();
  const { fetchStates, fetchCities, fetchDeliveryConfigs } =
    useLogisticsStore();
  const canWrite = hasPermission(
    admin?.permissions ?? {},
    admin?.isSuper ?? false,
    "logistics",
    "write",
  );

  const [activeTab, setActiveTab] = useState<Tab>("Countries");
  const [importModal, setImportModal] = useState(false);

  // ── Lifted selection state — persists across tab switches ────────────────────
  const [selCountry, setSelCountry] = useState("");
  const [selState, setSelState] = useState("");
  const [selCity, setSelCity] = useState("");
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [deliveryConfigsLoading, setDeliveryConfigsLoading] = useState(false);

  // ── Cascade handlers — reset downstream immediately ───────────────────────────

  const onCountryChange = useCallback((id: string) => {
    setSelCountry(id);
    setSelState("");
    setSelCity("");
    setStatesLoading(!!id);
    setCitiesLoading(false);
    setDeliveryConfigsLoading(false);
    useLogisticsStore.setState({ states: [], cities: [], deliveryConfigs: [] });
  }, []);

  const onStateChange = useCallback((id: string) => {
    setSelState(id);
    setSelCity("");
    setCitiesLoading(!!id);
    setDeliveryConfigsLoading(false);
    useLogisticsStore.setState({ cities: [], deliveryConfigs: [] });
  }, []);

  const onCityChange = useCallback((id: string) => {
    setSelCity(id);
    setDeliveryConfigsLoading(!!id);
    if (!id) useLogisticsStore.setState({ deliveryConfigs: [] });
  }, []);

  // ── Debounced fetch effects (350ms) ──────────────────────────────────────────

  useEffect(() => {
    if (!selCountry) {
      setStatesLoading(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        await fetchStates(selCountry);
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selCountry, fetchStates]);

  useEffect(() => {
    if (!selState) {
      setCitiesLoading(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        await fetchCities(selState);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selState, fetchCities]);

  useEffect(() => {
    if (!selCity) {
      setDeliveryConfigsLoading(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        await fetchDeliveryConfigs(selCity);
      } finally {
        if (!cancelled) setDeliveryConfigsLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selCity, fetchDeliveryConfigs]);

  const sel: GeoSel = {
    selCountry,
    selState,
    selCity,
    statesLoading,
    citiesLoading,
    deliveryConfigsLoading,
    onCountryChange,
    onStateChange,
    onCityChange,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header — full width, matching Admin Management page pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={cn(
              poppins.className,
              "text-[1.25rem] font-bold text-[#111827]",
            )}
          >
            Geo Configuration
          </h1>
          <p
            className={cn(
              satoshi.className,
              "text-[0.875rem] text-[#9CA3AF] mt-0.5",
            )}
          >
            Manage countries, states, cities, and delivery pricing
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setImportModal(true)}
            className={cn(
              satoshi.className,
              "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6EC93E] text-white text-[0.875rem] font-semibold hover:bg-[#5cb535] transition-colors shadow-sm shadow-[#6EC93E]/20",
            )}
          >
            <Icon icon="solar:upload-minimalistic-bold" className="w-4 h-4" />
            Bulk Import
          </Button>
        )}
      </div>

      {/* Tab bar — max-w-3xl with animated pill */}
      <div className="max-w-3xl flex gap-1 p-1 bg-[#F3F4F6] rounded-xl relative">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              satoshi.className,
              "relative flex-1 py-2 rounded-lg text-[0.875rem] font-medium transition-colors z-10",
              activeTab === tab
                ? "text-[#111827]"
                : "text-[#6B7280] hover:text-[#374151]",
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="geo-tab-pill"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Tab content — full width */}
      <div>
        {activeTab === "Countries" && <CountriesTab canWrite={canWrite} />}
        {activeTab === "States" && <StatesTab canWrite={canWrite} sel={sel} />}
        {activeTab === "Cities" && <CitiesTab canWrite={canWrite} sel={sel} />}
        {activeTab === "Delivery Prices" && (
          <DeliveryPricesTab canWrite={canWrite} sel={sel} />
        )}
      </div>

      <AnimatePresence>
        {importModal && <ImportModal onClose={() => setImportModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default GeoConfig;
