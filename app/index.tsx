import { Redirect } from "expo-router";

import { useAuthStore } from "@/src/features/auth/store/auth-store";

export default function IndexRoute() {
  const session = useAuthStore((state) => state.session);

  return <Redirect href={session ? "/(tabs)" : "/login"} />;
}
