import { create } from "zustand";

import type { Goal } from "@/src/features/goals/model/goal";

type GoalsState = {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  setGoals: (goals: Goal[]) => void;
};

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  setGoals: (goals) => set({ goals }),
}));
