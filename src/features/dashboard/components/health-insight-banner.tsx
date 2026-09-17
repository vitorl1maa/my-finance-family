import { Image, StyleSheet, Text, View } from "react-native";

import type { DashboardInsights } from "@/src/features/dashboard/model/dashboard-insights";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

type HealthInsightBannerProps = Pick<DashboardInsights, "healthMessage" | "healthStatus">;

export function HealthInsightBanner({ healthMessage, healthStatus }: HealthInsightBannerProps) {
  const isGood = healthStatus === "Boa";

  return (
    <View style={[styles.container, !isGood && styles.warning]}>
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <Text style={styles.headline}>{isGood ? "Mandou bem!" : "Fique de olho!"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isGood ? "TOP 5" : "ATENÇÃO"}</Text>
          </View>
        </View>
        <Text style={styles.message}>{healthMessage}</Text>
        <Text style={styles.caption}>ESTE MÊS</Text>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <View key={dot} style={[styles.dot, dot < 2 && styles.activeDot]} />
          ))}
        </View>
      </View>
      <Image
        source={require("../../../../assets/images/financial-streak.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    flexDirection: "row",
    minHeight: 116,
    overflow: "hidden",
    paddingLeft: 16,
  },
  warning: { backgroundColor: "#FFE18A" },
  copy: { flex: 1, gap: 5, paddingVertical: 14 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headline: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 21 },
  badge: {
    backgroundColor: colors.text,
    borderRadius: 12,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeText: { color: colors.surface, fontFamily: fonts.extraBold, fontSize: 9 },
  message: { color: "#303030", fontFamily: fonts.medium, fontSize: 11, maxWidth: 190 },
  caption: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 10, marginTop: 5 },
  dots: { flexDirection: "row", gap: 5 },
  dot: { backgroundColor: colors.surface, borderRadius: 4, height: 6, width: 6 },
  activeDot: { backgroundColor: colors.text },
  image: { height: 112, marginRight: -3, width: 116 },
});
