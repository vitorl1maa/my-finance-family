import { create } from "zustand";

import type { Goal } from "@/src/features/goals/model/goal";

type GoalsState = {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
};

const initialGoals: Goal[] = [
  {
    id: "family-reserve",
    title: "Reserva da familia",
    targetCents: 1000000,
    savedCents: 640000,
    dueDate: null,
    syncStatus: "pending",
  },
];

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: initialGoals,
  setGoals: (goals) => set({ goals }),
}));
