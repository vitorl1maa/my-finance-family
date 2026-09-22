import { useRouter } from "expo-router";

import { FamilyMembersView } from "@/src/features/family/view/family-members-view";

export default function FamilyMembersScreen() {
  const router = useRouter();
  return <FamilyMembersView onBack={() => router.navigate("/(tabs)")} />;
}
