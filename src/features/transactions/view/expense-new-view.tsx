import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  FileText,
  ReceiptText,
  Repeat2,
  Tags,
  WalletCards,
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { colors } from "@/src/shared/theme/colors";

type ExpenseForm = {
  title: string;
  amount: string;
  category: string;
  account: string;
  date: string;
  recurrence: string;
};
type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
};

export function ExpenseNewView({ onBack }: { onBack: () => void }) {
  const { createExpense } = useTransactionsViewModel();
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ExpenseForm>({
    defaultValues: {
      title: "",
      amount: "",
      category: "Alimentação",
      account: "Conta principal",
      date: "Hoje, 16/09/2026",
      recurrence: "Não se repete",
    },
  });
  const onSubmit = ({ title, category, amount }: ExpenseForm) => {
    createExpense({ title, category, amount });
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
          <Text style={styles.badgeText}>Despesa</Text>
        </View>
      </View>
      <View style={styles.heroIcon}>
        <ReceiptText color={colors.text} size={25} strokeWidth={2.2} />
      </View>
      <Text style={styles.title}>Cadastre uma despesa</Text>
      <Text style={styles.description}>
        Registre seus gastos para acompanhar o orçamento da família.
      </Text>
      <Controller
        control={control}
        name="title"
        rules={{ required: "Informe uma descrição." }}
        render={({ field: { onChange, value } }) => (
          <Field
            icon={<FileText color={colors.muted} size={18} />}
            label="Descrição"
            placeholder="Ex.: Mercado"
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="amount"
        rules={{
          required: "Informe o valor.",
          pattern: { value: /^\d+(?:[,.]\d{1,2})?$/, message: "Informe um valor válido." },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={[styles.amountCard, errors.amount && styles.amountError]}>
            <View style={styles.amountHeader}>
              <CircleDollarSign color={colors.muted} size={18} />
              <Text style={styles.amountLabel}>Valor</Text>
            </View>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="R$ 0,00"
              placeholderTextColor={colors.mutedLight}
              style={styles.amountInput}
              value={value}
              onChangeText={onChange}
            />
            <Text style={styles.amountHint}>Valor da despesa</Text>
            {errors.amount ? <Text style={styles.error}>{errors.amount.message}</Text> : null}
          </View>
        )}
      />
      <View style={styles.row}>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<Tags color={colors.muted} size={17} />}
              label="Categoria"
              placeholder="Ex.: Alimentação"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="account"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<WalletCards color={colors.muted} size={17} />}
              label="Conta"
              placeholder="Conta principal"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      <View style={styles.row}>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<CalendarDays color={colors.muted} size={17} />}
              label="Data"
              placeholder="Hoje"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="recurrence"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<Repeat2 color={colors.muted} size={17} />}
              label="Recorrência"
              placeholder="Não se repete"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      <Pressable onPress={handleSubmit(onSubmit)} style={styles.primary}>
        <Text style={styles.primaryText}>Salvar despesa</Text>
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
}: FieldProps & { compact?: boolean }) {
  return (
    <View style={[styles.fieldGroup, compact && styles.compactField]}>
      <View style={[styles.field, error && styles.fieldError]}>
        {icon}
        <View style={styles.fieldContent}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            autoCapitalize="sentences"
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
    maxWidth: 320,
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
  amountCard: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
    minHeight: 82,
    padding: 12,
  },
  amountError: { borderColor: colors.negative },
  amountHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  amountLabel: { color: colors.mutedLight, fontSize: 11, fontWeight: "800" },
  amountInput: { color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 4, padding: 0 },
  amountHint: { color: colors.mutedLight, fontSize: 10, position: "absolute", right: 13, top: 36 },
  error: { color: colors.negative, fontSize: 11, marginTop: 3 },
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
