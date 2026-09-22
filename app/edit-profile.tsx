import { Stack, useRouter } from "expo-router";

import { EditProfileView } from "@/src/features/auth/view/edit-profile-view";

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EditProfileView
        onBack={() => router.back()}
        onFamilyMembers={() => router.push("/(tabs)/family-members")}
      />
    </>
  );
}
