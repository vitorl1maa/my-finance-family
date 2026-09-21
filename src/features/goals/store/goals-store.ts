import { create } from "zustand";

import type { Goal } from "@/src/features/goals/model/goal";

type GoalsState = {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  setGoals: (goals: Goal[]) => void;
};

const initialGoals: Goal[] = [
  {
    id: "family-reserve",
    title: "Reserva da familia",
    category: "Segurança",
    priority: "Alta",
    targetCents: 1000000,
    savedCents: 640000,
    dueDate: "2027-03-18",
    syncStatus: "pending",
  },
];

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: initialGoals,
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  setGoals: (goals) => set({ goals }),
}));
