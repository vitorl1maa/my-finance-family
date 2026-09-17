import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FormError } from "@/src/features/auth/components/auth-ui";
import { useAuthViewModel } from "@/src/features/auth/view-model/use-auth-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { spacing } from "@/src/shared/theme/spacing";

export default function SettingsScreen() {
  const { errorMessage, isLoading, signOut } = useAuthViewModel();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.xl }}
    >
      <Text
        style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 28, fontWeight: "900" }}
      >
        Mais
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 18,
          borderWidth: 1,
          gap: spacing.sm,
          padding: spacing.lg,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontFamily: fonts.extraBold,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          Arquitetura
        </Text>
        <Text
          style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}
        >
          Base preparada para MVVM com Zustand, repositórios SQLite e futura sincronizacao com
          Supabase.
        </Text>
      </View>

      <FormError message={errorMessage} />
      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={signOut}
        style={[styles.logoutButton, isLoading && styles.disabled]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.negative} />
        ) : (
          <Text style={styles.logoutText}>Sair da conta</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    alignItems: "center",
    borderColor: colors.negative,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 54,
  },
  disabled: { opacity: 0.55 },
  logoutText: {
    color: colors.negative,
    fontFamily: fonts.extraBold,
    fontSize: 15,
    fontWeight: "900",
  },
});
