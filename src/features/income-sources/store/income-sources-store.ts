import { create } from "zustand";

import type { IncomeSource } from "@/src/features/income-sources/model/income-source";

type IncomeSourcesState = {
  sources: IncomeSource[];
  addSource: (source: IncomeSource) => void;
  setSources: (sources: IncomeSource[]) => void;
};

export const useIncomeSourcesStore = create<IncomeSourcesState>((set) => ({
  sources: [],
  addSource: (source) => set((state) => ({ sources: [source, ...state.sources] })),
  setSources: (sources) => set({ sources }),
}));
