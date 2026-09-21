import { Eye, EyeOff, LockKeyhole, LogOut, Mail, Pencil, UserRound, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { useAuthViewModel } from "@/src/features/auth/view-model/use-auth-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function EditProfileView({ onBack }: { onBack: () => void }) {
  const session = useAuthStore((state) => state.session);
  const { errorMessage, isLoading, setError, signOut, updateProfile } = useAuthViewModel();
  const metadata = session?.user.user_metadata as
    | { first_name?: string; last_name?: string }
    | undefined;
  const initialName =
    [metadata?.first_name, metadata?.last_name].filter(Boolean).join(" ") || "Vitor e família";
  const initialEmail = session?.user.email ?? "vitor@email.com";
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!dirty) return;

    const timeout = setTimeout(() => {
      void updateProfile({ name, email, password }).then((success) => {
        if (success) {
          setPassword("");
          setDirty(false);
          setSaved(true);
        }
      });
    }, 10_000);

    return () => clearTimeout(timeout);
  }, [dirty, email, name, password, updateProfile]);

  const change = (setter: (value: string) => void) => (value: string) => {
    setSaved(false);
    setError(null);
    setDirty(true);
    setter(value);
  };

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Fechar editar perfil" onPress={onBack} style={styles.close}>
          <X color={colors.text} size={20} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Editar perfil</Text>
          <Text style={styles.subtitle}>Atualize seus dados pessoais</Text>
        </View>
      </View>

      <View style={styles.photoSection}>
        <View style={styles.avatar}>
          <UserRound color={colors.text} size={40} />
          <View style={styles.editBadge}>
            <Pencil color={colors.surface} size={16} strokeWidth={2.5} />
          </View>
        </View>
        <Text style={styles.photoLabel}>Alterar foto</Text>
      </View>

      <View style={styles.form}>
        <Field
          icon={<UserRound color={colors.muted} size={19} />}
          label="Nome"
          value={name}
          onChangeText={change(setName)}
        />
        <Field
          icon={<Mail color={colors.muted} size={19} />}
          keyboardType="email-address"
          label="Email"
          value={email}
          onChangeText={change(setEmail)}
        />
        <View style={styles.field}>
          <LockKeyhole color={colors.muted} size={19} />
          <View style={styles.fieldCopy}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              accessibilityLabel="Senha"
              autoCapitalize="none"
              onChangeText={change(setPassword)}
              placeholder="Nova senha"
              placeholderTextColor={colors.mutedLight}
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
            />
          </View>
          <Pressable
            accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onPress={() => setShowPassword((value) => !value)}
          >
            {showPassword ? (
              <EyeOff color={colors.muted} size={18} />
            ) : (
              <Eye color={colors.muted} size={18} />
            )}
          </Pressable>
        </View>
      </View>

      {isLoading ? <Text style={styles.status}>Salvando alterações...</Text> : null}
      {saved ? <Text style={styles.saved}>Alterações salvas automaticamente.</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable accessibilityRole="button" onPress={handleSignOut} style={styles.signOut}>
        <LogOut color={colors.negative} size={18} />
        <Text style={styles.signOutText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  icon,
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={styles.field}>
      {icon}
      <View style={styles.fieldCopy}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          accessibilityLabel={label}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 40, paddingTop: 58 },
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  close: { alignItems: "center", height: 32, justifyContent: "center", width: 24 },
  headerCopy: { gap: 2 },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 22 },
  subtitle: { color: colors.muted, fontSize: 12 },
  photoSection: { alignItems: "center", gap: 8, paddingVertical: 6 },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 48,
    height: 88,
    justifyContent: "center",
    position: "relative",
    width: 88,
  },
  editBadge: {
    alignItems: "center",
    backgroundColor: colors.text,
    borderColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    bottom: -1,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    transform: [{ rotate: "-45deg" }],
    width: 30,
  },
  photoLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  form: { gap: 10 },
  field: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  fieldCopy: { flex: 1, gap: 3 },
  label: { color: colors.mutedLight, fontSize: 10, fontWeight: "700" },
  input: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, padding: 0 },
  status: { color: colors.muted, fontSize: 12, textAlign: "center" },
  saved: { color: colors.positive, fontSize: 12, textAlign: "center" },
  error: { color: colors.negative, fontSize: 12, textAlign: "center" },
  signOut: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    marginTop: 4,
  },
  signOutText: { color: colors.negative, fontFamily: fonts.bold, fontSize: 14 },
});
