"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { DeliveryCountry, DeliveryState, DeliveryCity, DeliveryConfig, AppliedPromo } from "@/data";

type CheckoutState = {
  countries: DeliveryCountry[];
  states: DeliveryState[];
  cities: DeliveryCity[];
  deliveryConfigs: DeliveryConfig[];
  loadingStates: boolean;
  loadingCities: boolean;
  loadingConfigs: boolean;

  fetchCountries: () => Promise<void>;
  fetchStates: (countryId: string) => Promise<void>;
  fetchCities: (stateId: string) => Promise<void>;
  fetchDeliveryConfigs: (cityId: string) => Promise<void>;
  resetGeo: () => void;
  // Returns the promo data to the caller — Checkout stores it in local state (not persisted)
  applyPromo: (code: string, subtotal: number) => Promise<AppliedPromo>;
};

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  countries: [],
  states: [],
  cities: [],
  deliveryConfigs: [],
  loadingStates: false,
  loadingCities: false,
  loadingConfigs: false,

  fetchCountries: async () => {
    const res = await api.get<{ data: DeliveryCountry[] }>("/api/delivery/countries");
    set({ countries: res.data.data ?? [] });
  },

  fetchStates: async (countryId) => {
    set({ loadingStates: true, states: [], cities: [], deliveryConfigs: [] });
    try {
      const res = await api.get<{ data: DeliveryState[] }>(`/api/delivery/states/${countryId}`);
      set({ states: res.data.data ?? [] });
    } finally {
      set({ loadingStates: false });
    }
  },

  fetchCities: async (stateId) => {
    set({ loadingCities: true, cities: [], deliveryConfigs: [] });
    try {
      const res = await api.get<{ data: DeliveryCity[] }>(`/api/delivery/cities/${stateId}`);
      set({ cities: res.data.data ?? [] });
    } finally {
      set({ loadingCities: false });
    }
  },

  fetchDeliveryConfigs: async (cityId) => {
    set({ loadingConfigs: true, deliveryConfigs: [] });
    try {
      const res = await api.get<{ data: DeliveryConfig[] }>(`/api/delivery/configs/${cityId}`);
      set({ deliveryConfigs: res.data.data ?? [] });
    } finally {
      set({ loadingConfigs: false });
    }
  },

  resetGeo: () => set({ states: [], cities: [], deliveryConfigs: [] }),

  applyPromo: async (code, subtotal) => {
    const res = await api.post<{ data: AppliedPromo }>("/api/promo/validate", { code, subtotal });
    return res.data.data;
  },
}));
