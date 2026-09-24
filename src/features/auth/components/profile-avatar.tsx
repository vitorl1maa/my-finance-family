import { Image } from "expo-image";
import { Text, View } from "react-native";

import { getAvatarInitial } from "@/src/features/auth/model/profile-avatar";
import { colors } from "@/src/shared/theme/colors";

type ProfileAvatarProps = {
  avatarUrl?: string;
  label?: string;
  size: number;
  token: string;
};

export function ProfileAvatar({ avatarUrl, label, size, token }: ProfileAvatarProps) {
  return (
    <View
      accessibilityLabel={avatarUrl ? "Foto de perfil" : "Avatar padrão"}
      style={{
        alignItems: "center",
        backgroundColor: colors.accent,
        borderRadius: size / 2,
        height: size,
        justifyContent: "center",
        overflow: "hidden",
        width: size,
      }}
    >
      <Text style={{ color: colors.text, fontSize: size * 0.42, fontWeight: "800" }}>
        {getAvatarInitial(label ?? token)}
      </Text>
      {avatarUrl ? (
        <Image
          accessibilityLabel="Foto de perfil"
          contentFit="cover"
          source={{ uri: avatarUrl }}
          style={{
            borderRadius: size / 2,
            height: size,
            position: "absolute",
            width: size,
          }}
        />
      ) : null}
    </View>
  );
}
