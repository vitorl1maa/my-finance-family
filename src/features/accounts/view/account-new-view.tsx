import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { colors } from "@/src/shared/theme/colors";

type AccountForm = {
  name: string;
  institution: string;
  balance: string;
  kind: "checking" | "savings" | "wallet";
  description: string;
  note: string;
};
type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
  keyboardType?: "default" | "decimal-pad";
};

export function AccountNewView({ onBack }: { onBack: () => void }) {
  const { createAccount } = useAccountsViewModel();
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<AccountForm>({
    defaultValues: {
      name: "",
      institution: "",
      balance: "0",
      kind: "checking",
      description: "",
      note: "",
    },
  });
  const selectedKind = watch("kind");
  const onSubmit = ({ name, kind, balance }: AccountForm) => {
    createAccount({ name, kind, balance });
    onBack();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Voltar" onPress={onBack} style={styles.back}>
          <ArrowLeft color={colors.text} size={22} />
        </Pressable>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Nova conta</Text>
        </View>
      </View>
      <View style={styles.heroIcon}>
        <WalletCards color={colors.text} size={25} strokeWidth={2.2} />
      </View>
      <Text style={styles.title}>Cadastre sua conta</Text>
      <Text style={styles.description}>
        Preencha os dados para acompanhar esta conta no My Finance Family.
      </Text>
      <Controller
        control={control}
        name="name"
        rules={{ required: "Informe o nome da conta." }}
        render={({ field: { onChange, value } }) => (
          <Field
            icon={<WalletCards color={colors.muted} size={19} />}
            label="Nome da conta"
            placeholder="Conta principal"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      <View style={styles.row}>
        <Controller
          control={control}
          name="institution"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<Building2 color={colors.muted} size={18} />}
              label="Instituição"
              placeholder="Ex.: Banco do Brasil"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="balance"
          rules={{ pattern: { value: /^\d+(?:[,.]\d{1,2})?$/, message: "Valor inválido." } }}
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<CircleDollarSign color={colors.muted} size={18} />}
              label="Saldo inicial"
              placeholder="R$ 0,00"
              value={value}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              error={errors.balance?.message}
            />
          )}
        />
      </View>
      <Text style={styles.sectionLabel}>Tipo de conta</Text>
      <View style={styles.typeRow}>
        {(["checking", "savings", "wallet"] as const).map((kind) => (
          <Pressable
            key={kind}
            onPress={() => setValue("kind", kind)}
            style={[styles.typeCard, selectedKind === kind && styles.typeSelected]}
          >
            <Text style={styles.typeText}>
              {kind === "checking"
                ? "Conta principal"
                : kind === "savings"
                  ? "Poupança"
                  : "Carteira"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<FileText color={colors.muted} size={18} />}
              label="Descrição opcional"
              placeholder="Ex.: Reserva mensal"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<Banknote color={colors.muted} size={18} />}
              label="Observação"
              placeholder="Opcional"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      <Pressable onPress={handleSubmit(onSubmit)} style={styles.primary}>
        <Text style={styles.primaryText}>Salvar conta</Text>
        <ArrowRight color={colors.text} size={19} strokeWidth={2.5} />
      </Pressable>
      <Pressable onPress={onBack} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  compact,
  error,
  icon,
  label,
  onChangeText,
  placeholder,
  value,
  keyboardType = "default",
}: FieldProps & { compact?: boolean }) {
  return (
    <View style={[styles.fieldGroup, compact && styles.compactField]}>
      <View style={[styles.field, error && styles.fieldError]}>
        {icon}
        <View style={styles.fieldContent}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            autoCapitalize="sentences"
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedLight}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flexGrow: 1, padding: 20, paddingBottom: 28 },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  back: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 24,
  },
  badgeText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 17,
    height: 54,
    justifyContent: "center",
    marginBottom: 14,
    width: 54,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginBottom: 10,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 14,
    maxWidth: 335,
  },
  fieldGroup: { marginBottom: 4 },
  compactField: { flex: 1 },
  row: { flexDirection: "row", gap: 10 },
  field: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  fieldError: { borderColor: colors.negative },
  fieldContent: { flex: 1, gap: 1 },
  label: { color: colors.mutedLight, fontSize: 11, fontWeight: "800" },
  input: { color: colors.text, fontSize: 14, fontWeight: "800", padding: 0 },
  error: { color: colors.negative, fontSize: 11, marginTop: 3 },
  sectionLabel: {
    color: colors.mutedLight,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 8,
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeCard: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  typeSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  typeText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  primary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 58,
  },
  primaryText: { color: colors.text, fontSize: 15, fontWeight: "900" },
  cancel: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 54,
  },
  cancelText: { color: colors.text, fontSize: 14, fontWeight: "900" },
});
