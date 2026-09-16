import { type Href, Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeClosed,
  LockKeyhole,
  Mail,
  UserRound,
  UserRoundPlus,
} from "lucide-react-native";
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
import type { RegisterProfile } from "@/src/features/auth/model/auth";
import { useAuthViewModel } from "@/src/features/auth/view-model/use-auth-view-model";
import { colors } from "@/src/shared/theme/colors";

type RegisterForm = RegisterProfile & { email: string; password: string; confirmPassword: string };

const requiredMessage = "Este campo é obrigatório.";
const passwordRequirements = [
  { label: "8 caracteres", test: (value: string) => value.length >= 8 },
  { label: "1 letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { label: "1 caractere especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { errorMessage, isLoading, signUpWithEmail } = useAuthViewModel();
  const [step, setStep] = useState<1 | 2>(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
    watch,
  } = useForm<RegisterForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });
  const password = watch("password");
  const togglePassword = () => setPasswordVisible((visible) => !visible);
  const toggleConfirmPassword = () => setConfirmPasswordVisible((visible) => !visible);

  const goToNextStep = async () => {
    const isValid = await trigger(["firstName", "lastName"]);
    if (isValid) setStep(2);
  };

  const submitForm = async (values: RegisterForm) => {
    const signedUp = await signUpWithEmail(values.email, values.password, {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: "",
    });
    if (signedUp) router.replace("/");
  };

  const renderField = (
    name: keyof RegisterForm,
    props: {
      label: string;
      placeholder: string;
      icon: React.ReactNode;
      keyboardType?: "default" | "email-address" | "phone-pad";
      secureTextEntry?: boolean;
      action?: React.ReactNode;
    },
  ) => (
    <Controller
      control={control}
      name={name}
      rules={fieldRules[name]}
      render={({ field: { onChange, onBlur, value } }) => (
        <Field
          {...props}
          error={messageFor(errors[name]?.message)}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      )}
    />
  );

  return (
    <AuthScreen>
      <Stack.Screen options={{ title: "Criar conta" }} />
      <Pressable
        accessibilityRole="button"
        onPress={() => (step === 2 ? setStep(1) : router.replace("/(auth)/login" as Href))}
        style={styles.back}
      >
        <ArrowLeft color={colors.text} size={25} strokeWidth={2.2} />
      </Pressable>
      <View style={styles.topRow}>
        <View style={styles.brandMark}>
          <UserRoundPlus color={colors.text} size={26} strokeWidth={2.1} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Cadastro · {step}/2</Text>
        </View>
      </View>
      <Text style={styles.title}>Crie sua conta</Text>
      <Text style={styles.description}>
        Informe seus dados para criar seu perfil e acessar o My Finance Family.
      </Text>
      <View style={styles.form}>
        {step === 1 ? (
          <>
            {renderField("firstName", {
              icon: <UserRound color={colors.muted} size={21} />,
              label: "Nome",
              placeholder: "Seu nome",
            })}
            {renderField("lastName", {
              icon: <UserRound color={colors.muted} size={21} />,
              label: "Sobrenome",
              placeholder: "Seu sobrenome",
            })}
          </>
        ) : (
          <>
            {renderField("email", {
              icon: <Mail color={colors.muted} size={21} />,
              keyboardType: "email-address",
              label: "E-mail",
              placeholder: "voce@exemplo.com",
            })}
            {renderField("password", {
              action: <PasswordToggle visible={passwordVisible} onPress={togglePassword} />,
              icon: <LockKeyhole color={colors.muted} size={21} />,
              label: "Senha",
              placeholder: "••••••••",
              secureTextEntry: !passwordVisible,
            })}
            <PasswordRequirements value={password} />
            {renderField("confirmPassword", {
              action: (
                <PasswordToggle visible={confirmPasswordVisible} onPress={toggleConfirmPassword} />
              ),
              icon: <LockKeyhole color={colors.muted} size={21} />,
              label: "Confirmar senha",
              placeholder: "••••••••",
              secureTextEntry: !confirmPasswordVisible,
            })}
          </>
        )}
      </View>
      <FormError message={errorMessage} />
      <PrimaryButton
        disabled={isLoading}
        onPress={step === 1 ? goToNextStep : handleSubmit(submitForm)}
      >
        <View style={styles.buttonContent}>
          <LoadingLabel isLoading={isLoading} label={step === 1 ? "Continuar" : "Criar conta"} />
          {!isLoading ? <ArrowRight color={colors.text} size={20} strokeWidth={2.4} /> : null}
        </View>
      </PrimaryButton>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/(auth)/login" as Href)}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryText}>Já tenho conta</Text>
      </Pressable>
    </AuthScreen>
  );
}

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

function PasswordRequirements({ value }: { value: string }) {
  return (
    <View style={styles.requirements}>
      {passwordRequirements.map(({ label, test }) => (
        <Text key={label} style={[styles.requirement, test(value) && styles.requirementMet]}>
          {test(value) ? "✓" : "○"} {label}
        </Text>
      ))}
    </View>
  );
}

const fieldRules = {
  firstName: { required: requiredMessage },
  lastName: { required: requiredMessage },
  phone: {
    required: requiredMessage,
    minLength: { value: 10, message: "Informe um telefone válido." },
  },
  email: {
    required: requiredMessage,
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Informe um e-mail válido." },
  },
  password: {
    required: requiredMessage,
    validate: {
      minLength: (value: string) =>
        value.length >= 8 || "A senha deve ter pelo menos 8 caracteres.",
      lowercase: (value: string) =>
        /[a-z]/.test(value) || "A senha deve conter uma letra minúscula.",
      special: (value: string) =>
        /[^A-Za-z0-9]/.test(value) || "A senha deve conter um caractere especial.",
    },
  },
  confirmPassword: {
    required: requiredMessage,
    validate: (value: string, formValues: RegisterForm) =>
      value === formValues.password || "As senhas precisam ser iguais.",
  },
} satisfies Record<keyof RegisterForm, object>;

function messageFor(message: unknown) {
  return typeof message === "string" ? message : undefined;
}

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 42,
    justifyContent: "center",
    marginVertical: 40,
    width: 42,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 24,
  },
  badgeText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 34,
  },
  description: { color: colors.muted, fontSize: 16, lineHeight: 21 },
  form: { gap: 4, marginTop: 80 },
  buttonContent: { alignItems: "center", flexDirection: "row", gap: 16, justifyContent: "center" },
  requirements: { gap: 3, marginBottom: 10, marginTop: -5, paddingLeft: 4 },
  requirement: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  requirementMet: { color: colors.positive },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 54,
  },
  secondaryText: { color: colors.text, fontSize: 15, fontWeight: "900" },
});
