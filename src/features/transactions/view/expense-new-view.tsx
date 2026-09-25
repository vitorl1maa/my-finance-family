import { ArrowRight, CreditCard, FileText, Repeat2, Tags, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CategoryPicker } from "@/src/features/transactions/components/category-picker";
import {
  ExpenseRecurrencePicker,
  type RecurrenceRule,
  recurrenceLabel,
} from "@/src/features/transactions/components/expense-recurrence-picker";
import { toExpenseIso } from "@/src/features/transactions/model/expense-date";
import type { Transaction } from "@/src/features/transactions/model/transaction";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import {
  formatBrlInput,
  formatCurrencyFromCents,
  parseBrlInputToCents,
} from "@/src/shared/utils/money";

type ExpenseForm = {
  title: string;
  amount: string;
  categoryId: string;
  recurrence: string;
  paymentMethod: "credit_card" | "debit_card" | "pix" | "cash";
};
type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
  multiline?: boolean;
  onPress?: () => void;
  selector?: boolean;
};

export function ExpenseNewView({
  onBack,
  initialTransaction,
}: {
  onBack: () => void;
  initialTransaction?: Transaction;
}) {
  const {
    categories,
    categoriesError,
    categoriesLoading,
    createExpense,
    updateExpense,
    removeExpense,
    isSaving,
    reloadCategories,
    saveError,
  } = useTransactionsViewModel();
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [recurrencePickerVisible, setRecurrencePickerVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialTransaction?.categoryId ?? "",
  );
  const [selectedDate, setSelectedDate] = useState(
    initialTransaction ? new Date(initialTransaction.occurredAt) : new Date(),
  );
  const [selectedRecurrence, setSelectedRecurrence] = useState<RecurrenceRule>(
    (initialTransaction?.recurrenceRule as RecurrenceRule) ?? "none",
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<ExpenseForm>({
    defaultValues: {
      title: initialTransaction?.title ?? "",
      amount: initialTransaction
        ? formatCurrencyFromCents(Math.abs(initialTransaction.amountCents))
        : "",
      categoryId: initialTransaction?.categoryId ?? "",
      recurrence: recurrenceLabel((initialTransaction?.recurrenceRule as RecurrenceRule) ?? "none"),
      paymentMethod: initialTransaction?.paymentMethod ?? "pix",
    },
  });
  useEffect(() => {
    if (
      categories.length > 0 &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(categories[0].id);
      setValue("categoryId", categories[0].id);
    }
  }, [categories, selectedCategoryId, setValue]);
  const onSubmit = async ({ title, categoryId, amount, paymentMethod }: ExpenseForm) => {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) return;

    try {
      if (initialTransaction) {
        await updateExpense({
          ...initialTransaction,
          title: title.trim(),
          categoryId,
          category: category.name,
          amountCents: -Math.abs(parseBrlInputToCents(amount)),
          occurredAt: toExpenseIso(selectedDate),
          recurrenceRule: selectedRecurrence,
          paymentMethod,
        });
      } else
        await createExpense({
          title,
          categoryId,
          categoryName: category.name,
          amount,
          occurredAt: toExpenseIso(selectedDate),
          recurrenceRule: selectedRecurrence,
          paymentMethod,
        });
      onBack();
    } catch {
      // The view-model exposes the error while preserving the form values.
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nova despesa</Text>
          <Text style={styles.headerSubtitle}>Registre uma nova despesa</Text>
        </View>
        <Pressable accessibilityLabel="Fechar nova despesa" onPress={onBack} style={styles.close}>
          <X color={colors.text} size={20} />
        </Pressable>
      </View>
      <Controller
        control={control}
        name="amount"
        rules={{
          validate: (value) => parseBrlInputToCents(value) > 0 || "Informe um valor válido.",
        }}
        render={({ field: { onChange, value } }) => (
          <View style={[styles.amountCard, errors.amount && styles.amountError]}>
            <Text style={styles.amountLabel}>VALOR DA DESPESA</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="R$ 0,00"
              placeholderTextColor={colors.text}
              style={styles.amountInput}
              value={value}
              onChangeText={(rawValue) => onChange(formatBrlInput(rawValue))}
            />
            <Text style={styles.amountHint}>Quanto você gastou?</Text>
            {errors.amount ? <Text style={styles.error}>{errors.amount.message}</Text> : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="title"
        rules={{ required: "Informe uma descrição." }}
        render={({ field: { onChange, value } }) => (
          <Field
            icon={<FileText color={colors.muted} size={18} />}
            label="Descrição"
            multiline
            placeholder="Ex.: Mercado, farmácia..."
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />
      <Text style={styles.detailsLabel}>Detalhes da despesa</Text>
      <View style={styles.row}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <Field
              compact
              icon={<Tags color={colors.muted} size={17} />}
              label="Categoria"
              placeholder="Selecione"
              value={categories.find((category) => category.id === value)?.name ?? "Selecione"}
              onChangeText={onChange}
              onPress={() => setCategoryPickerVisible(true)}
              selector
            />
          )}
        />
      </View>
      <Controller
        control={control}
        name="paymentMethod"
        rules={{ required: "Informe a origem do pagamento." }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.detailsLabel}>Origem do pagamento</Text>
            <View style={styles.paymentMethods}>
              {PAYMENT_METHODS.map((method) => (
                <Pressable
                  key={method.value}
                  onPress={() => onChange(method.value)}
                  style={[
                    styles.paymentMethod,
                    value === method.value && styles.paymentMethodSelected,
                  ]}
                >
                  <CreditCard
                    color={value === method.value ? colors.text : colors.muted}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      value === method.value && styles.paymentMethodTextSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.paymentMethod ? (
              <Text style={styles.error}>{errors.paymentMethod.message}</Text>
            ) : null}
          </View>
        )}
      />
      <View style={styles.row}>
        <Controller
          control={control}
          name="recurrence"
          render={({ field: { value } }) => (
            <Field
              compact
              icon={<Repeat2 color={colors.muted} size={17} />}
              label="Recorrência"
              placeholder="Selecione"
              value={value}
              onChangeText={() => undefined}
              onPress={() => setRecurrencePickerVisible(true)}
              selector
            />
          )}
        />
      </View>
      {saveError ? <Text style={styles.formError}>{saveError}</Text> : null}
      <Pressable
        disabled={isSaving || categoriesLoading}
        onPress={handleSubmit(onSubmit)}
        style={[styles.primary, (isSaving || categoriesLoading) && styles.disabled]}
      >
        <Text style={styles.primaryText}>
          {initialTransaction ? "Atualizar despesa" : "Salvar despesa"}
        </Text>
        <ArrowRight color={colors.text} size={19} strokeWidth={2.5} />
      </Pressable>
      {initialTransaction ? (
        <Pressable
          onPress={() => {
            void (async () => {
              try {
                await removeExpense(initialTransaction.id);
              } finally {
                onBack();
              }
            })();
          }}
          style={styles.delete}
        >
          <Text style={styles.deleteText}>Excluir despesa</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onBack} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
      <CategoryPicker
        categories={categories}
        errorMessage={categoriesError ?? undefined}
        loading={categoriesLoading}
        onClose={() => setCategoryPickerVisible(false)}
        onRetry={reloadCategories}
        onSelect={(category) => {
          setSelectedCategoryId(category.id);
          setValue("categoryId", category.id);
          setCategoryPickerVisible(false);
        }}
        selectedCategoryId={selectedCategoryId}
        visible={categoryPickerVisible}
      />
      <ExpenseRecurrencePicker
        date={selectedDate}
        onClose={() => setRecurrencePickerVisible(false)}
        onConfirm={(date, rule) => {
          setSelectedDate(date);
          setSelectedRecurrence(rule);
          setValue("recurrence", recurrenceLabel(rule));
          setRecurrencePickerVisible(false);
        }}
        rule={selectedRecurrence}
        visible={recurrencePickerVisible}
      />
    </ScrollView>
  );
}

const PAYMENT_METHODS = [
  { label: "Cartão de crédito", value: "credit_card" },
  { label: "Cartão de débito", value: "debit_card" },
  { label: "PIX", value: "pix" },
  { label: "Dinheiro", value: "cash" },
] as const;

function Field({
  compact,
  error,
  icon,
  label,
  multiline,
  onPress,
  onChangeText,
  placeholder,
  selector,
  value,
}: FieldProps & { compact?: boolean }) {
  return (
    <View style={[styles.fieldGroup, compact && styles.compactField]}>
      <Pressable
        onPress={onPress}
        style={[styles.field, multiline && styles.multilineField, error && styles.fieldError]}
      >
        {icon}
        <View style={styles.fieldContent}>
          <Text style={styles.label}>{label}</Text>
          {selector ? (
            <Text style={styles.input}>{value || placeholder}</Text>
          ) : (
            <TextInput
              autoCapitalize="sentences"
              placeholder={placeholder}
              placeholderTextColor={colors.mutedLight}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              style={[styles.input, multiline && styles.descriptionInput]}
              value={value}
              onChangeText={onChangeText}
            />
          )}
        </View>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: 14,
    padding: 20,
    paddingBottom: 32,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  headerSubtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  close: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  fieldGroup: {},
  compactField: { flex: 1 },
  row: { flexDirection: "row", gap: 10 },
  paymentMethods: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  paymentMethod: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  paymentMethodSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  paymentMethodText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12 },
  paymentMethodTextSelected: { color: colors.text },
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
  multilineField: { alignItems: "flex-start", minHeight: 82, paddingTop: 14 },
  label: { color: colors.mutedLight, fontSize: 12, fontWeight: "800" },
  input: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: "800",
    padding: 0,
  },
  descriptionInput: { minHeight: 52, textAlignVertical: "top" },
  detailsLabel: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12 },
  amountCard: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    minHeight: 100,
    padding: 16,
  },
  amountError: { borderColor: colors.negative, borderWidth: 2 },
  amountLabel: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12 },
  amountInput: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
    padding: 0,
  },
  amountHint: { color: "#303030", fontSize: 12, marginTop: 2 },
  error: { color: colors.negative, fontSize: 12, marginTop: 3 },
  formError: { color: colors.negative, fontSize: 12, textAlign: "center" },
  disabled: { opacity: 0.55 },
  primary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 58,
  },
  primaryText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15, fontWeight: "900" },
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
  delete: { alignItems: "center", paddingVertical: 12 },
  deleteText: { color: colors.negative, fontFamily: fonts.bold, fontSize: 13 },
});
