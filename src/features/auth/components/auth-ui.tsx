import { type Href, Link } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function AuthScreen({ children }: PropsWithChildren) {
  return (
    <ScrollView contentContainerStyle={styles.screen} contentInsetAdjustmentBehavior="automatic">
      {children}
    </ScrollView>
  );
}

export function AuthHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>$</Text>
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  error,
  icon,
  action,
  onBlur,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  error?: string;
  icon?: ReactNode;
  action?: ReactNode;
  onBlur?: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={[styles.inputShell, error && styles.inputError]}>
        {icon}
        <View style={styles.inputContent}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
            autoCorrect={false}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedLight}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            value={value}
            onBlur={onBlur}
            onChangeText={onChangeText}
          />
        </View>
        {action}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  children,
  onPress,
  disabled,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled && styles.disabled]}
    >
      <Text style={styles.primaryText}>{children}</Text>
    </Pressable>
  );
}

export function SocialButton({
  icon,
  children,
  onPress,
}: {
  icon: string;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.socialButton}>
      <Text style={styles.socialIcon}>{icon}</Text>
      <Text style={styles.socialText}>{children}</Text>
    </Pressable>
  );
}

export function AuthFooter({ children }: PropsWithChildren) {
  return <View style={styles.footer}>{children}</View>;
}

export function InlineLink({ href, children }: { href: Href; children: ReactNode }) {
  return (
    <Link href={href} style={styles.link}>
      {children}
    </Link>
  );
}

export function FormError({ message }: { message: string | null }) {
  return message ? (
    <View style={styles.formError}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;
}

export function LoadingLabel({ isLoading, label }: { isLoading: boolean; label: string }) {
  return isLoading ? (
    <ActivityIndicator color={colors.text} />
  ) : (
    <Text style={styles.primaryText}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.background, padding: 20, paddingBottom: 24 },
  header: { gap: 12, paddingTop: 12, paddingBottom: 28 },
  logo: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  logoText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 26, fontWeight: "900" },
  eyebrow: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23, maxWidth: 330 },
  fieldGroup: { gap: 8, marginBottom: 16 },
  label: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, fontWeight: "800" },
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  inputContent: { flex: 1, gap: 2 },
  input: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "700",
    padding: 0,
  },
  inputError: { borderColor: colors.negative },
  errorText: { color: colors.negative, fontSize: 12, fontWeight: "700" },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 20,
  },
  primaryText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 16, fontWeight: "900" },
  disabled: { opacity: 0.55 },
  socialButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    minHeight: 52,
  },
  socialIcon: { color: colors.text, fontSize: 18, fontWeight: "900" },
  socialText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, fontWeight: "800" },
  footer: { alignItems: "center", gap: 14, paddingTop: 24 },
  link: { color: colors.text, fontSize: 14, fontWeight: "900", textDecorationLine: "underline" },
  formError: { backgroundColor: "#FFF1F1", borderRadius: 12, marginBottom: 16, padding: 12 },
});
