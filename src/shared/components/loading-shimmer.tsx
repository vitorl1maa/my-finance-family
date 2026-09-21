import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function LoadingShimmer({ rows = 3 }: { rows?: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, { duration: 1200, toValue: 1, useNativeDriver: true }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-260, 260] });

  return (
    <View accessibilityLabel="Carregando" style={styles.container}>
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton rows are static placeholders.
        <View key={`loading-row-${index}`} style={styles.row}>
          <View style={styles.icon} />
          <View style={styles.copy}>
            <View style={styles.title} />
            <View style={styles.subtitle} />
          </View>
          <View style={styles.amount} />
          <Animated.View
            pointerEvents="none"
            style={[styles.highlight, { transform: [{ translateX }] }]}
          >
            <LinearGradient
              colors={["transparent", "#FFFFFF55", "transparent"]}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: {
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderRadius: 14,
    flexDirection: "row",
    minHeight: 58,
    overflow: "hidden",
    paddingHorizontal: 12,
    position: "relative",
  },
  icon: { backgroundColor: "#E5E5E5", borderRadius: 12, height: 38, width: 38 },
  copy: { flex: 1, gap: 7, marginLeft: 12 },
  title: { backgroundColor: "#E5E5E5", borderRadius: 5, height: 12, width: "55%" },
  subtitle: { backgroundColor: "#E5E5E5", borderRadius: 5, height: 9, width: "35%" },
  amount: { backgroundColor: "#E5E5E5", borderRadius: 5, height: 12, width: 70 },
  highlight: { bottom: 0, position: "absolute", top: 0, width: 180 },
  gradient: { flex: 1 },
});
