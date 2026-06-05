/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn, hasPermission } from "@/lib";
import { poppins, satoshi } from "@/app/layout";
import { useAuthStore, useProductStore } from "@/store";
import { Table, Button, StatusChip } from "@/components";
import type { ProductRecord, SaleStatus } from "@/data";
import { SALE_STATUS_LABELS } from "@/data";

// ─── Sale status chip ─────────────────────────────────────────────────────────

const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  open: "bg-[#6EC93E]/10 text-[#3a7a1e]",
  almost_out: "bg-amber-50 text-amber-700",
  out_of_stock: "bg-red-50 text-red-600",
  opening_soon: "bg-blue-50 text-blue-600",
  closing_soon: "bg-orange-50 text-orange-600",
  closed: "bg-[#F3F4F6] text-[#6B7280]",
  inactive: "bg-[#F3F4F6] text-[#9CA3AF]",
};

const SaleStatusChip = ({ status }: { status: SaleStatus }) => (
  <span
    className={cn(
      satoshi.className,
      "inline-flex items-center px-2 py-0.5 rounded-full text-[0.75rem] font-medium whitespace-nowrap",
      SALE_STATUS_COLORS[status],
    )}
  >
    {SALE_STATUS_LABELS[status]}
  </span>
);

// ─── Confirm delete modal ─────────────────────────────────────────────────────

const ConfirmDelete = ({
  product,
  onClose,
  onConfirm,
  loading,
}: {
  product: ProductRecord;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Icon
            icon="solar:trash-bin-trash-bold"
            className="w-5 h-5 text-red-500"
          />
        </div>
        <div>
          <p
            className={cn(
              poppins.className,
              "text-[0.9375rem] font-semibold text-[#111827]",
            )}
          >
            Delete Product
          </p>
          <p
            className={cn(satoshi.className, "text-[0.8125rem] text-[#6B7280]")}
          >
            This cannot be undone.
          </p>
        </div>
      </div>
      <p className={cn(satoshi.className, "text-[0.875rem] text-[#374151]")}>
        Delete <span className="font-semibold">"{product.title}"</span>? All
        variant groups, stock and FAQs will be permanently removed.
      </p>
      <div className="flex gap-2 justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          className={cn(satoshi.className, "px-4 py-2 text-[0.875rem]")}
        >
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={onConfirm}
          className={cn(
            satoshi.className,
            "px-4 py-2 text-[0.875rem] bg-red-500 hover:bg-red-600 text-white rounded-lg",
          )}
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const LIMIT = 50;
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Products = () => {
  const router = useRouter();
  const { admin } = useAuthStore();
  const {
    products,
    meta,
    loading,
    deleteProduct,
    toggleActive,
    fetchProducts,
  } = useProductStore();
  const canWrite = hasPermission(
    admin?.permissions ?? {},
    admin?.isSuper ?? false,
    "products",
    "write",
  );

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, deleteProduct]);

  const handleToggle = useCallback(
    async (product: ProductRecord) => {
      setTogglingId(product.id);
      try {
        await toggleActive(product.id, !product.isActive);
        toast.success(
          product.isActive ? "Product hidden" : "Product published",
        );
      } catch {
        toast.error("Failed to update product");
      } finally {
        setTogglingId(null);
      }
    },
    [toggleActive],
  );

  const columns = useMemo(
    () => [
      {
        title: "Product",
        customTableBody: (r: ProductRecord) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
              {r.baseImage ? (
                <img
                  src={r.baseImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  icon="solar:image-bold-duotone"
                  className="w-5 h-5 text-[#D1D5DB]"
                />
              )}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-semibold text-[#111827] truncate",
                )}
              >
                {r.title}
              </p>
              <p
                className={cn(
                  satoshi.className,
                  "text-[0.75rem] text-[#9CA3AF]",
                )}
              >
                {r.variantGroupCount > 0
                  ? `${r.variantGroupCount} variant group${r.variantGroupCount > 1 ? "s" : ""}`
                  : "No variants"}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: "Price",
        width: 120,
        customTableBody: (r: ProductRecord) => (
          <span
            className={cn(
              satoshi.className,
              "text-[0.875rem] font-medium text-[#374151]",
            )}
          >
            ₦{r.basePrice.toLocaleString()}
          </span>
        ),
      },
      {
        title: "Stock",
        width: 80,
        customTableBody: (r: ProductRecord) => (
          <span
            className={cn(
              satoshi.className,
              "text-[0.875rem]",
              r.totalStock === 0
                ? "text-red-500"
                : r.totalStock <= 5
                  ? "text-amber-600"
                  : "text-[#374151]",
            )}
          >
            {r.totalStock}
          </span>
        ),
      },
      {
        title: "Status",
        width: 130,
        customTableBody: (r: ProductRecord) => (
          <SaleStatusChip status={r.saleStatus} />
        ),
      },
      {
        title: "Active",
        width: 80,
        customTableBody: (r: ProductRecord) => (
          <StatusChip status={r.isActive ? "active" : "inactive"} />
        ),
      },
      {
        title: "Created",
        width: 110,
        customTableBody: (r: ProductRecord) => (
          <span
            className={cn(
              satoshi.className,
              "text-[0.8125rem] text-nowrap text-[#9CA3AF]",
            )}
          >
            {fmt(r.createdAt)}
          </span>
        ),
      },
      {
        title: "",
        width: 130,
        customTableBody: (r: ProductRecord) => (
          <div className="flex items-center gap-1.5">
            {canWrite && (
              <button
                onClick={() => handleToggle(r)}
                disabled={togglingId === r.id}
                title={
                  r.isActive ? "Hide from storefront" : "Publish to storefront"
                }
                className="flex items-center justify-center w-7 h-7 rounded-lg text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
              >
                <Icon
                  icon={togglingId === r.id ? "solar:refresh-bold" : r.isActive ? "solar:eye-closed-bold" : "solar:eye-bold"}
                  className={cn("w-3.5 h-3.5", togglingId === r.id && "animate-spin")}
                />
              </button>
            )}
            <button
              onClick={() => router.push(`/admin/products/${r.id}/edit`)}
              className={cn(
                satoshi.className,
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.8125rem] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors",
              )}
            >
              <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" />
              Edit
            </button>
            {canWrite && (
              <button
                onClick={() => setDeleteTarget(r)}
                title="Delete product"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
              >
                <Icon
                  icon="solar:trash-bin-trash-bold"
                  className="w-3.5 h-3.5"
                />
              </button>
            )}
          </div>
        ),
      },
    ],
    [canWrite, handleToggle, togglingId, router],
  );

  const data = useMemo(
    () => products.map((r) => [r, r, r, r, r, r, r]),
    [products],
  );

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
            Products
            <span
              className={cn(
                satoshi.className,
                "ml-2 text-[0.875rem] font-normal text-[#9CA3AF]",
              )}
            >
              ({meta.products.total})
            </span>
          </h1>
          <p
            className={cn(
              satoshi.className,
              "text-[0.875rem] text-[#9CA3AF] mt-0.5",
            )}
          >
            Manage your product catalogue
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => router.push("/admin/products/new")}
            className={cn(
              satoshi.className,
              "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6EC93E] text-white text-[0.875rem] font-semibold hover:bg-[#5cb535] transition-colors shadow-sm shadow-[#6EC93E]/20",
            )}
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            New Product
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white">
        <Table
          columns={columns as any}
          data={data as any}
          loading={loading}
          head
          search={{
            show: true,
            placeholder: "Search by name or description…",
            onResolve: (v) => {
              const q = String(v);
              setSearch(q);
              fetchProducts(1, q || undefined);
            },
          }}
          pagination
          metaData={{
            currentPage: (meta.products.page - 1) * LIMIT + 1,
            endPage: Math.min(meta.products.page * LIMIT, meta.products.total),
            totalRecords: meta.products.total,
            onPageChange: (offset) =>
              fetchProducts(Math.floor(offset / LIMIT) + 1, search || undefined),
          }}
          emptyStateProps={{
            svg: "solar:bag-bold-duotone",
            title: "No products yet",
            text: "Create your first product to start selling.",
          }}
        />
      </div>

      {deleteTarget && (
        <ConfirmDelete
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </>
  );
};

export default Products;
