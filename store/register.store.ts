import { create } from "zustand";
import { api } from "@/lib/api";
import type { RegisterFormData } from "@/data";

type RegisterState = {
  submit: (data: RegisterFormData) => Promise<void>;
};

export const useRegisterStore = create<RegisterState>(() => ({
  submit: async (data) => {
    await api.post("/api/register", data);
  },
}));
