import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import type { DashboardInsights } from "@/src/features/dashboard/model/dashboard-insights";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

type CashflowChartProps = { data: DashboardInsights["weeklyCashflow"] };

export function CashflowChart({ data }: CashflowChartProps) {
  const chartData = data.flatMap((week) => [
    { value: week.incomeCents / 100, frontColor: colors.positive, label: week.label },
    { value: week.expenseCents / 100, frontColor: colors.text },
  ]);
  const maxValue = Math.max(...chartData.map((item) => item.value), 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fluxo de caixa</Text>
          <Text style={styles.subtitle}>Entradas x despesas · mês selecionado</Text>
        </View>
        <View style={styles.legend}>
          <Text style={[styles.legendText, styles.income]}>● Entradas</Text>
          <Text style={[styles.legendText, styles.expense]}>● Saídas</Text>
        </View>
      </View>
      <BarChart
        barBorderRadius={5}
        barWidth={10}
        data={chartData}
        disableScroll
        hideRules
        initialSpacing={18}
        maxValue={maxValue}
        noOfSections={3}
        spacing={12}
        xAxisColor={colors.border}
        xAxisLabelTextStyle={styles.axisLabel}
        xAxisThickness={1}
        yAxisColor={colors.border}
        yAxisTextStyle={styles.axisLabel}
        yAxisThickness={0}
        height={120}
        width={292}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  legend: { alignItems: "flex-end", gap: 3 },
  legendText: { fontFamily: fonts.bold, fontSize: 12 },
  income: { color: colors.positive },
  expense: { color: colors.text },
  axisLabel: { color: colors.muted, fontSize: 12 },
});
