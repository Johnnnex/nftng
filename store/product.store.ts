"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authRequest } from "@/lib/api";
import type {
  ProductRecord,
  ProductDetail,
  EcommerceConfig,
  ProductFormState,
  PaginationMeta,
  EcommerceConfigData,
  ProductCreateData,
  ProductUpdateData,
} from "@/data";
import { EMPTY_PRODUCT_FORM } from "@/data";

const LIMIT = 50;

type ProductMeta = { products: PaginationMeta };
const DEFAULT_META: ProductMeta = { products: { total: 0, page: 1, limit: LIMIT } };

type ProductState = {
  // list
  products: ProductRecord[];
  meta: ProductMeta;
  loading: boolean;
  // global config
  config: EcommerceConfig | null;
  // draft form — persisted to localStorage so refreshes don't lose work
  draft: ProductFormState;
  draftProductId: string | null; // null = new product; string = editing this product id
  // original detail for edit diff tracking — NOT persisted (re-hydrated server-side each load)
  originalDetail: ProductDetail | null;

  // list actions
  fetchProducts: (page: number, search?: string) => Promise<void>;
  // config actions
  fetchConfig: () => Promise<void>;
  updateConfig: (data: EcommerceConfigData) => Promise<void>;
  // product CRUD
  createProduct: (data: ProductCreateData) => Promise<ProductDetail>;
  updateProduct: (id: string, data: ProductUpdateData) => Promise<ProductDetail>;
  deleteProduct: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  // image upload
  uploadImage: (file: File) => Promise<string>;
  // draft management
  setDraft: (patch: Partial<ProductFormState>) => void;
  setDraftProductId: (id: string | null) => void;
  setOriginalDetail: (detail: ProductDetail | null) => void;
  clearDraft: () => void;
};

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],
      meta: DEFAULT_META,
      loading: true,
      config: null,
      draft: EMPTY_PRODUCT_FORM,
      draftProductId: null,
      originalDetail: null,

      fetchProducts: async (page, search) => {
        set({ loading: true });
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
        if (search) params.set("search", search);
        const res = await authRequest({ url: `/api/admin/products?${params}` });
        set((s) => ({
          products: res.data.data,
          meta: { ...s.meta, products: res.data.meta },
          loading: false,
        }));
      },

      fetchConfig: async () => {
        const res = await authRequest({ url: "/api/admin/ecommerce-config" });
        set({ config: res.data.data });
      },

      updateConfig: async (data) => {
        const res = await authRequest({ method: "PATCH", url: "/api/admin/ecommerce-config", data });
        set({ config: res.data.data });
      },

      createProduct: async (data) => {
        const res = await authRequest({ method: "POST", url: "/api/admin/products", data });
        const product: ProductDetail = res.data.data;
        set((s) => ({
          products: [
            {
              id: product.id,
              title: product.title,
              basePrice: product.basePrice,
              baseImage: product.baseImage,
              isActive: product.isActive,
              salesOpenAt: product.salesOpenAt,
              salesCloseAt: product.salesCloseAt,
              saleStatus: product.saleStatus,
              variantGroupCount: product.variantGroups.length,
              totalStock: product.stocks.reduce((sum, r) => sum + r.quantity, 0),
              createdAt: product.createdAt,
            } satisfies ProductRecord,
            ...s.products,
          ],
          meta: { ...s.meta, products: { ...s.meta.products, total: s.meta.products.total + 1 } },
        }));
        return product;
      },

      updateProduct: async (id, data) => {
        const res = await authRequest({ method: "PATCH", url: `/api/admin/products/${id}`, data });
        const product: ProductDetail = res.data.data;
        set((s) => ({
          products: s.products.map((p) =>
            p.id !== id
              ? p
              : {
                  ...p,
                  title: product.title,
                  basePrice: product.basePrice,
                  baseImage: product.baseImage,
                  isActive: product.isActive,
                  salesOpenAt: product.salesOpenAt,
                  salesCloseAt: product.salesCloseAt,
                  saleStatus: product.saleStatus,
                  variantGroupCount: product.variantGroups.length,
                  totalStock: product.stocks.reduce((sum, r) => sum + r.quantity, 0),
                },
          ),
        }));
        return product;
      },

      deleteProduct: async (id) => {
        await authRequest({ method: "DELETE", url: `/api/admin/products/${id}` });
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          meta: { ...s.meta, products: { ...s.meta.products, total: s.meta.products.total - 1 } },
        }));
      },

      toggleActive: async (id, isActive) => {
        await authRequest({ method: "PATCH", url: `/api/admin/products/${id}`, data: { isActive } });
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, isActive } : p)),
        }));
      },

      uploadImage: async (file) => {
        const form = new FormData();
        form.append("file", file);
        const res = await authRequest({
          method: "POST",
          url: "/api/admin/products/image",
          data: form,
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.data.url as string;
      },

      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

      setDraftProductId: (id) => set({ draftProductId: id }),

      setOriginalDetail: (detail) => set({ originalDetail: detail }),

      clearDraft: () =>
        set({ draft: EMPTY_PRODUCT_FORM, draftProductId: null, originalDetail: null }),
    }),
    {
      name: "product-draft",
      // only persist the draft — list data and config are re-fetched server-side
      partialize: (s) => ({ draft: s.draft, draftProductId: s.draftProductId }),
    },
  ),
);
