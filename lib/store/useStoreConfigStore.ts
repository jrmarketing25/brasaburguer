import { create } from "zustand";
import { StoreConfig } from "@/types/store";
import { defaultStoreConfig } from "@/lib/config/store.config";

interface StoreConfigState {
  config: StoreConfig;
  setConfig: (config: StoreConfig) => void;
  updateConfig: (partial: Partial<StoreConfig>) => void;
}

export const useStoreConfigStore = create<StoreConfigState>((set) => ({
  config: defaultStoreConfig,
  setConfig: (config) => set({ config }),
  updateConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),
}));
