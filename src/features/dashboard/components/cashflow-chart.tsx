import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { buildMonthlyCashflow } from "@/src/features/dashboard/model/dashboard-insights";
import type { Transaction } from "@/src/features/transactions/model/transaction";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

type Period = 6 | 12 | "year";

export function CashflowChart({ transactions }: { transactions: Transaction[] }) {
  const [period, setPeriod] = useState<Period>(6);
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const months = period === "year" ? 12 : period;
  const data = useMemo(
    () => buildMonthlyCashflow(transactions, referenceDate, months),
    [months, referenceDate, transactions],
  );
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);
  const selected = data[Math.min(selectedIndex, data.length - 1)];
  const totals = data.reduce(
    (total, month) => ({
      income: total.income + month.incomeCents,
      expense: total.expense + month.expenseCents,
    }),
    { income: 0, expense: 0 },
  );
  const chartData = data.flatMap((month, index) => [
    {
      value: month.incomeCents / 100,
      frontColor: colors.positive,
      label: month.label,
      onPress: () => setSelectedIndex(index),
    },
    {
      value: month.expenseCents / 100,
      frontColor: colors.text,
      onPress: () => setSelectedIndex(index),
    },
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fluxo de caixa</Text>
          <Text style={styles.subtitle}>Entradas e saídas por mês</Text>
        </View>
        <View style={styles.periods}>
          {([6, 12, "year"] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => {
                setPeriod(value);
                setSelectedIndex((value === "year" ? 12 : value) - 1);
              }}
              style={[styles.period, period === value && styles.periodActive]}
            >
              <Text style={styles.periodText}>{value === "year" ? "Ano" : `${value}m`}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {period === "year" ? (
        <View style={styles.yearControl}>
          <Pressable onPress={() => setReferenceDate(addMonths(referenceDate, -12))}>
            <ChevronLeft color={colors.muted} size={18} />
          </Pressable>
          <Text style={styles.yearText}>{format(referenceDate, "yyyy", { locale: ptBR })}</Text>
          <Pressable onPress={() => setReferenceDate(addMonths(referenceDate, 12))}>
            <ChevronRight color={colors.muted} size={18} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.metrics}>
        <Metric
          icon={ArrowDownLeft}
          label="Entradas"
          value={totals.income}
          color={colors.positive}
        />
        <Metric icon={ArrowUpRight} label="Saídas" value={totals.expense} color={colors.negative} />
        <Metric
          icon={Wallet}
          label="Saldo"
          value={totals.income - totals.expense}
          color={colors.walletDark}
        />
      </View>
      <BarChart
        barBorderRadius={4}
        barWidth={9}
        data={chartData}
        disableScroll
        hideRules
        initialSpacing={8}
        maxValue={Math.max(...chartData.map((item) => item.value), 100)}
        noOfSections={3}
        spacing={8}
        xAxisColor={colors.border}
        xAxisLabelTextStyle={styles.axis}
        xAxisThickness={1}
        yAxisTextStyle={styles.axis}
        yAxisThickness={0}
        height={126}
        width={290}
      />
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: colors.positive }]}>● Entradas</Text>
        <Text style={[styles.legendText, { color: colors.text }]}>● Saídas</Text>
      </View>
      {selected ? (
        <View style={styles.selected}>
          <Text style={styles.selectedMonth}>
            {format(selected.month, "MMMM yyyy", { locale: ptBR })}
          </Text>
          <Text style={styles.selectedText}>
            {formatCurrencyFromCents(selected.incomeCents)} entradas ·{" "}
            {formatCurrencyFromCents(selected.expenseCents)} saídas
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Wallet;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.metric}>
      <Icon color={color} size={15} />
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{formatCurrencyFromCents(value)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  periods: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    flexDirection: "row",
    padding: 2,
  },
  period: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 5 },
  periodActive: { backgroundColor: "#E0F6D5" },
  periodText: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  yearControl: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  yearText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  metrics: { flexDirection: "row", gap: 6, marginVertical: 12 },
  metric: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    padding: 7,
  },
  metricLabel: { color: colors.muted, fontSize: 9 },
  metricValue: { fontFamily: fonts.bold, fontSize: 10 },
  axis: { color: colors.muted, fontSize: 9 },
  legend: { flexDirection: "row", gap: 16, justifyContent: "center", marginTop: 7 },
  legendText: { fontFamily: fonts.bold, fontSize: 11 },
  selected: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    marginTop: 10,
    padding: 8,
  },
  selectedMonth: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: "capitalize",
  },
  selectedText: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
