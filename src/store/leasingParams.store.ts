import { create } from "zustand";

type LeasingSource = "dashboard" | "discover-page" | "portfolio";

interface LeasingParamsStore {
  assetId: string | null;
  source: LeasingSource | null;
  setParams: (assetId: string, source?: LeasingSource) => void;
  clear: () => void;
}

export const leasingParamsStore = create<LeasingParamsStore>((set) => ({
  assetId: null,
  source: null,
  setParams: (assetId, source = "discover-page") =>
    set({ assetId, source }),
  clear: () => set({ assetId: null, source: null }),
}));
