import { useURL } from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { exchangeSocialAuthCode } from "@/src/features/auth/repository/social-auth-repository";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export default function SocialAuthCallbackScreen() {
  const url = useURL();
  const router = useRouter();
  const hasStarted = useRef(false);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    if (!url || hasStarted.current) return;
    hasStarted.current = true;

    void exchangeSocialAuthCode(url)
      .then((success) => {
        if (!success) setError("O retorno do login social não é válido. Tente novamente.");
        router.replace(success ? "/" : "/(auth)/login");
      })
      .catch(() => {
        setError("Não foi possível concluir o login social. Tente novamente.");
        router.replace("/(auth)/login");
      });
  }, [router, setError, url]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.text} />
      <Text style={styles.text}>Concluindo seu login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: "center", backgroundColor: colors.background, flex: 1, gap: 14, justifyContent: "center" },
  text: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
});
