"use client";
import { create } from "zustand";
import { authRequest } from "@/lib/api";
import type {
  LogisticsQueueItem,
  TripRecord,
  TripDetail,
  OutsideNigeriaOrder,
  GeoCountry,
  GeoState,
  GeoCity,
  DeliveryConfig,
  PaginationMeta,
} from "@/data";

const LIMIT = 50;

type LogisticsMeta = {
  items: PaginationMeta;
  trips: PaginationMeta;
  international: PaginationMeta;
};
const DEFAULT_META: LogisticsMeta = {
  items: { total: 0, page: 1, limit: LIMIT },
  trips: { total: 0, page: 1, limit: LIMIT },
  international: { total: 0, page: 1, limit: LIMIT },
};

type LogisticsState = {
  // Items queue
  items: LogisticsQueueItem[];
  itemsLoading: boolean;

  // Trips
  trips: TripRecord[];
  tripsLoading: boolean;
  activeTrip: TripDetail | null;
  activeTripLoading: boolean;

  // International
  international: OutsideNigeriaOrder[];
  internationalLoading: boolean;
  activeInternational: OutsideNigeriaOrder | null;

  // Geo config
  countries: GeoCountry[];
  states: GeoState[];
  cities: GeoCity[];
  deliveryConfigs: DeliveryConfig[];
  geoLoading: boolean;

  meta: LogisticsMeta;

  // Items queue actions
  fetchItems: (page: number, cityId?: string, stateId?: string) => Promise<void>;

  // Trip actions
  fetchTrips: (page: number) => Promise<void>;
  fetchTripDetail: (id: string) => Promise<void>;
  createTrip: (data: { riderName: string; riderPhone: string; riderEmail?: string; riderCompany?: string; itemIds: string[] }) => Promise<TripRecord>;
  patchTrip: (id: string, data: { riderName?: string; riderPhone?: string; riderEmail?: string; riderCompany?: string }) => Promise<void>;
  dispatchTrip: (id: string) => Promise<void>;
  setActiveTrip: (trip: TripDetail | null) => void;

  // International actions
  fetchInternational: (page: number) => Promise<void>;
  fetchInternationalDetail: (id: string) => Promise<void>;
  resolveInternational: (id: string) => Promise<void>;
  setActiveInternational: (order: OutsideNigeriaOrder | null) => void;

  // Geo actions
  fetchCountries: () => Promise<void>;
  fetchStates: (countryId?: string) => Promise<void>;
  fetchCities: (stateId?: string) => Promise<void>;
  fetchDeliveryConfigs: (cityId?: string) => Promise<void>;
  createCountry: (data: { name: string; code: string }) => Promise<void>;
  updateCountry: (id: string, data: { name?: string; code?: string }) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;
  createState: (data: { countryId: string; name: string }) => Promise<void>;
  updateState: (id: string, data: { name?: string }) => Promise<void>;
  deleteState: (id: string) => Promise<void>;
  createCity: (data: { stateId: string; name: string }) => Promise<void>;
  updateCity: (id: string, data: { name?: string }) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
  upsertDeliveryConfig: (data: { cityId: string; method: string; price: number; estimatedDays?: string }) => Promise<void>;
  updateDeliveryConfig: (id: string, data: { price?: number; estimatedDays?: string }) => Promise<void>;
  deleteDeliveryConfig: (id: string) => Promise<void>;
};

export const useLogisticsStore = create<LogisticsState>()((set, get) => ({
  items: [],
  itemsLoading: true,
  trips: [],
  tripsLoading: true,
  activeTrip: null,
  activeTripLoading: false,
  international: [],
  internationalLoading: true,
  activeInternational: null,
  countries: [],
  states: [],
  cities: [],
  deliveryConfigs: [],
  geoLoading: true,
  meta: DEFAULT_META,

  // ─── Items queue ───────────────────────────────────────────────────────────

  fetchItems: async (page, cityId, stateId) => {
    set({ itemsLoading: true });
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (cityId) params.set("cityId", cityId);
    if (stateId) params.set("stateId", stateId);
    const res = await authRequest({ url: `/api/admin/logistics/items?${params}` });
    set((s) => ({
      items: res.data.data,
      meta: { ...s.meta, items: res.data.meta },
      itemsLoading: false,
    }));
  },

  // ─── Trips ─────────────────────────────────────────────────────────────────

  fetchTrips: async (page) => {
    set({ tripsLoading: true });
    const res = await authRequest({ url: `/api/admin/logistics/trips?page=${page}&limit=${LIMIT}` });
    set((s) => ({
      trips: res.data.data,
      meta: { ...s.meta, trips: res.data.meta },
      tripsLoading: false,
    }));
  },

  fetchTripDetail: async (id) => {
    set({ activeTripLoading: true });
    const res = await authRequest({ url: `/api/admin/logistics/trips/${id}` });
    set({ activeTrip: res.data.data, activeTripLoading: false });
  },

  createTrip: async (data) => {
    const res = await authRequest({ method: "POST", url: `/api/admin/logistics/trips`, data });
    const trip: TripRecord = res.data.data;
    set((s) => ({
      trips: [trip, ...s.trips],
      meta: { ...s.meta, trips: { ...s.meta.trips, total: s.meta.trips.total + 1 } },
    }));
    return trip;
  },

  patchTrip: async (id, data) => {
    const res = await authRequest({ method: "PATCH", url: `/api/admin/logistics/trips/${id}`, data });
    const updated: TripRecord = res.data.data;
    set((s) => ({
      trips: s.trips.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      activeTrip: s.activeTrip?.id === id ? { ...s.activeTrip, ...updated } : s.activeTrip,
    }));
  },

  dispatchTrip: async (id) => {
    const res = await authRequest({ method: "POST", url: `/api/admin/logistics/trips/${id}/dispatch` });
    const updated: TripRecord = res.data.data;
    set((s) => ({
      trips: s.trips.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      activeTrip: s.activeTrip?.id === id ? { ...s.activeTrip, ...updated } : s.activeTrip,
    }));
    // Refresh items queue since dispatched items are now enroute (removed from queue)
    await get().fetchItems(1);
  },

  setActiveTrip: (trip) => set({ activeTrip: trip }),

  // ─── International ─────────────────────────────────────────────────────────

  fetchInternational: async (page) => {
    set({ internationalLoading: true });
    const res = await authRequest({ url: `/api/admin/logistics/international?page=${page}&limit=${LIMIT}` });
    set((s) => ({
      international: res.data.data,
      meta: { ...s.meta, international: res.data.meta },
      internationalLoading: false,
    }));
  },

  fetchInternationalDetail: async (id) => {
    const res = await authRequest({ url: `/api/admin/logistics/international/${id}` });
    set({ activeInternational: res.data.data });
  },

  resolveInternational: async (id) => {
    await authRequest({ method: "PATCH", url: `/api/admin/logistics/international/${id}` });
    set((s) => ({
      international: s.international.map((o) =>
        o.id === id ? { ...o, status: "resolved" as const } : o,
      ),
      activeInternational:
        s.activeInternational?.id === id
          ? { ...s.activeInternational, status: "resolved" as const }
          : s.activeInternational,
    }));
  },

  setActiveInternational: (order) => set({ activeInternational: order }),

  // ─── Geo ───────────────────────────────────────────────────────────────────

  fetchCountries: async () => {
    set({ geoLoading: true });
    const res = await authRequest({ url: `/api/admin/delivery/countries` });
    set({ countries: res.data.data, geoLoading: false });
  },

  fetchStates: async (countryId) => {
    const params = countryId ? `?countryId=${countryId}` : "";
    const res = await authRequest({ url: `/api/admin/delivery/states${params}` });
    set({ states: res.data.data });
  },

  fetchCities: async (stateId) => {
    const params = stateId ? `?stateId=${stateId}` : "";
    const res = await authRequest({ url: `/api/admin/delivery/cities${params}` });
    set({ cities: res.data.data });
  },

  fetchDeliveryConfigs: async (cityId) => {
    const params = cityId ? `?cityId=${cityId}` : "";
    const res = await authRequest({ url: `/api/admin/delivery/configs${params}` });
    set({ deliveryConfigs: res.data.data });
  },

  createCountry: async (data) => {
    const res = await authRequest({ method: "POST", url: `/api/admin/delivery/countries`, data });
    set((s) => ({ countries: [...s.countries, res.data.data] }));
  },

  updateCountry: async (id, data) => {
    const res = await authRequest({ method: "PATCH", url: `/api/admin/delivery/countries/${id}`, data });
    set((s) => ({ countries: s.countries.map((c) => (c.id === id ? res.data.data : c)) }));
  },

  deleteCountry: async (id) => {
    await authRequest({ method: "DELETE", url: `/api/admin/delivery/countries/${id}` });
    set((s) => ({ countries: s.countries.filter((c) => c.id !== id) }));
  },

  createState: async (data) => {
    const res = await authRequest({ method: "POST", url: `/api/admin/delivery/states`, data });
    set((s) => ({ states: [...s.states, res.data.data] }));
  },

  updateState: async (id, data) => {
    const res = await authRequest({ method: "PATCH", url: `/api/admin/delivery/states/${id}`, data });
    set((s) => ({ states: s.states.map((st) => (st.id === id ? res.data.data : st)) }));
  },

  deleteState: async (id) => {
    await authRequest({ method: "DELETE", url: `/api/admin/delivery/states/${id}` });
    set((s) => ({ states: s.states.filter((st) => st.id !== id) }));
  },

  createCity: async (data) => {
    const res = await authRequest({ method: "POST", url: `/api/admin/delivery/cities`, data });
    set((s) => ({ cities: [...s.cities, res.data.data] }));
  },

  updateCity: async (id, data) => {
    const res = await authRequest({ method: "PATCH", url: `/api/admin/delivery/cities/${id}`, data });
    set((s) => ({ cities: s.cities.map((c) => (c.id === id ? res.data.data : c)) }));
  },

  deleteCity: async (id) => {
    await authRequest({ method: "DELETE", url: `/api/admin/delivery/cities/${id}` });
    set((s) => ({ cities: s.cities.filter((c) => c.id !== id) }));
  },

  upsertDeliveryConfig: async (data) => {
    const res = await authRequest({ method: "POST", url: `/api/admin/delivery/configs`, data });
    const updated: DeliveryConfig = res.data.data;
    set((s) => {
      const exists = s.deliveryConfigs.find((c) => c.id === updated.id);
      return {
        deliveryConfigs: exists
          ? s.deliveryConfigs.map((c) => (c.id === updated.id ? updated : c))
          : [...s.deliveryConfigs, updated],
      };
    });
  },

  updateDeliveryConfig: async (id, data) => {
    const res = await authRequest({ method: "PATCH", url: `/api/admin/delivery/configs/${id}`, data });
    set((s) => ({ deliveryConfigs: s.deliveryConfigs.map((c) => (c.id === id ? res.data.data : c)) }));
  },

  deleteDeliveryConfig: async (id) => {
    await authRequest({ method: "DELETE", url: `/api/admin/delivery/configs/${id}` });
    set((s) => ({ deliveryConfigs: s.deliveryConfigs.filter((c) => c.id !== id) }));
  },
}));
