import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

import type { DashboardInsights } from "@/src/features/dashboard/model/dashboard-insights";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

type SpendingBreakdownProps = { categories: DashboardInsights["expenseByCategory"] };
const categoryColors = [colors.accent, colors.text, "#A3A3A3", "#E5E5E5"];

export function SpendingBreakdown({ categories }: SpendingBreakdownProps) {
  if (categories.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Onde você mais gasta</Text>
        <Text style={styles.empty}>Cadastre despesas para visualizar sua distribuição.</Text>
      </View>
    );
  }

  const topCategories = categories.slice(0, 4);
  const total = topCategories.reduce((sum, item) => sum + item.amountCents, 0);
  const pieData = topCategories.map((item, index) => ({
    color: categoryColors[index % categoryColors.length],
    value: item.amountCents,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Onde você mais gasta</Text>
        <Text style={styles.period}>Este mês</Text>
      </View>
      <View style={styles.content}>
        <PieChart
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerCaption}>Total</Text>
              <Text style={styles.centerValue}>{formatCurrencyFromCents(total)}</Text>
            </View>
          )}
          data={pieData}
          donut
          innerCircleColor={colors.surface}
          innerRadius={42}
          isAnimated={false}
          radius={62}
        />
        <View style={styles.legend}>
          {topCategories.map((item, index) => (
            <View key={item.category} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: categoryColors[index] }]} />
              <View style={styles.legendCopy}>
                <View style={styles.legendMeta}>
                  <Text numberOfLines={1} style={styles.category}>
                    {item.category}
                  </Text>
                  <Text style={styles.percent}>
                    {Math.round((item.amountCents / total) * 100)}%
                  </Text>
                </View>
                <Text style={styles.value}>{formatCurrencyFromCents(item.amountCents)}</Text>
              </View>
            </View>
          ))}
        </View>
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
    padding: 16,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 15 },
  period: { color: colors.muted, fontSize: 12 },
  content: { alignItems: "center", flexDirection: "row", gap: 14, marginTop: 10 },
  centerLabel: { alignItems: "center" },
  centerCaption: { color: colors.muted, fontSize: 12 },
  centerValue: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 12, marginTop: 2 },
  legend: { flex: 1, gap: 10 },
  legendRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  dot: { borderRadius: 5, height: 9, width: 9 },
  legendCopy: { flex: 1 },
  legendMeta: { flexDirection: "row", justifyContent: "space-between" },
  category: { color: colors.text, flex: 1, fontFamily: fonts.semiBold, fontSize: 12 },
  percent: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  value: { color: colors.muted, fontSize: 12, marginTop: 2 },
  empty: { color: colors.muted, fontSize: 12, marginTop: 12 },
});
