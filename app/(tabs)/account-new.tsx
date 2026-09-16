import { Stack, useRouter } from "expo-router";

import { AccountNewView } from "@/src/features/accounts/view/account-new-view";

export default function AccountNewRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Nova conta", presentation: "modal" }} />
      <AccountNewView onBack={() => router.back()} />
    </>
  );
}
