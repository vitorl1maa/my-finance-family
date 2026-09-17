import { type Href, Link, Stack, useRouter } from "expo-router";
import { ArrowRight, Eye, EyeClosed, LockKeyhole, Mail, WalletCards } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AuthScreen,
  Field,
  FormError,
  LoadingLabel,
  PrimaryButton,
} from "@/src/features/auth/components/auth-ui";
import { useAuthViewModel } from "@/src/features/auth/view-model/use-auth-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export default function LoginScreen() {
  const router = useRouter();
  const { errorMessage, isLoading, signInWithEmail } = useAuthViewModel();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginForm>({ defaultValues: { email: "", password: "" }, mode: "onSubmit" });

  const submitForm = async ({ email, password }: LoginForm) => {
    const signedIn = await signInWithEmail(email, password);
    if (signedIn) router.replace("/");
  };

  return (
    <AuthScreen>
      <Stack.Screen options={{ title: "Entrar" }} />
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <WalletCards color={colors.text} size={27} strokeWidth={2.1} />
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.brandName}>My Finance Family</Text>
          <Text style={styles.brandSubtitle}>Finanças em família</Text>
        </View>
      </View>
      <Text style={styles.title}>Bem-vindo de volta</Text>
      <Text style={styles.description}>
        Entre para acompanhar contas, metas e movimentações da sua família mesmo offline.
      </Text>
      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Informe seu e-mail.",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Informe um e-mail válido." },
          }}
          render={({ field: { onBlur, onChange, value } }) => (
            <Field
              error={messageFor(errors.email?.message)}
              icon={<Mail color={colors.muted} size={21} />}
              keyboardType="email-address"
              label="E-mail"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="voce@email.com"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Informe sua senha.",
            minLength: { value: 6, message: "A senha deve ter pelo menos 6 caracteres." },
          }}
          render={({ field: { onBlur, onChange, value } }) => (
            <Field
              action={
                <PasswordToggle
                  visible={passwordVisible}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                />
              }
              error={messageFor(errors.password?.message)}
              icon={<LockKeyhole color={colors.muted} size={21} />}
              label="Senha"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="••••••••"
              secureTextEntry={!passwordVisible}
              value={value}
            />
          )}
        />
      </View>
      <Link href={"/(auth)/login" as Href} style={styles.forgot}>
        Esqueci minha senha
      </Link>
      <FormError message={errorMessage} />
      <PrimaryButton disabled={isLoading} onPress={handleSubmit(submitForm)}>
        <View style={styles.buttonContent}>
          <LoadingLabel isLoading={isLoading} label="Entrar" />
          {!isLoading ? <ArrowRight color={colors.text} size={20} strokeWidth={2.4} /> : null}
        </View>
      </PrimaryButton>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/(auth)/register" as Href)}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryText}>Criar conta</Text>
      </Pressable>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>ou continue com</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.socialRow}>
        <SocialButton icon="G" label="Google" />
        <SocialButton icon="A" label="Apple" />
      </View>
      <Text style={styles.terms}>
        Ao continuar, você concorda com os Termos e a Política de Privacidade.
      </Text>
    </AuthScreen>
  );
}

type LoginForm = { email: string; password: string };

function PasswordToggle({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const Icon = visible ? EyeClosed : Eye;
  return (
    <Pressable
      accessibilityLabel={visible ? "Ocultar senha" : "Visualizar senha"}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
    >
      <Icon color={colors.muted} size={21} />
    </Pressable>
  );
}

function messageFor(message: unknown) {
  return typeof message === "string" ? message : undefined;
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => {}} style={styles.socialButton}>
      <View style={styles.socialIcon}>
        <Text style={styles.socialIconText}>{icon}</Text>
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 52 },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  brandCopy: { gap: 3 },
  brandName: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18, fontWeight: "900" },
  brandSubtitle: { color: colors.muted, fontSize: 13 },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 44,
  },
  description: { color: colors.muted, fontSize: 16, lineHeight: 21, marginTop: 15 },
  form: { gap: 4, marginTop: 80 },
  forgot: {
    alignSelf: "flex-end",
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.extraBold,
    fontWeight: "900",
    marginBottom: 16,
    marginTop: 10,
    textDecorationLine: "underline",
  },
  buttonContent: { alignItems: "center", flexDirection: "row", gap: 4, justifyContent: "center" },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 54,
  },
  secondaryText: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 15,
    fontWeight: "900",
  },
  divider: { alignItems: "center", flexDirection: "row", gap: 20, paddingVertical: 26 },
  line: { backgroundColor: colors.border, flex: 1, height: 1 },
  or: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  socialRow: { flexDirection: "row", gap: 12 },
  socialButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
  },
  socialIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  socialIconText: { color: colors.text, fontSize: 13, fontWeight: "900" },
  socialLabel: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15, fontWeight: "900" },
  terms: {
    color: colors.mutedLight,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 18,
    textAlign: "center",
  },
});
