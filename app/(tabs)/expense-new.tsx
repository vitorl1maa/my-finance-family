import { Stack, useRouter } from "expo-router";

import { ExpenseNewView } from "@/src/features/transactions/view/expense-new-view";

export default function ExpenseNewRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Nova despesa", presentation: "modal" }} />
      <ExpenseNewView onBack={() => router.back()} />
    </>
  );
}
