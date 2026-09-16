import { useRouter } from "expo-router";

import { DashboardView } from "@/src/features/dashboard/view/dashboard-view";

export default function DashboardRoute() {
  const router = useRouter();

  return (
    <DashboardView
      onCreateAccount={() => router.push("/account-new")}
      onCreateExpense={() => router.push("/expense-new")}
    />
  );
}
