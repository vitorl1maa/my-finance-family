import { BlurView } from "expo-blur";
import { QrCode } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import QRCodeStyled from "react-native-qrcode-styled";
import { colors } from "@/src/shared/theme/colors";

type ReacticxQrCodeProps = {
  value: string;
};

/** Adapted from Reacticx's QR Code component for the family invitation flow. */
export const ReacticxQrCode = memo(function ReacticxQrCode({ value }: ReacticxQrCodeProps) {
  const progress = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["#F2F2F2", colors.background]),
    borderRadius: interpolate(progress.value, [0, 1], [100, 24]),
    height: interpolate(progress.value, [0, 1], [52, 246]),
    width: interpolate(progress.value, [0, 1], [210, 246]),
  }));
  const compactStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const codeStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [12, 0]) }],
  }));

  return (
    <Pressable
      accessibilityLabel="Mostrar ou ocultar QR Code do convite"
      onPress={() => {
        progress.value = withSpring(progress.value > 0.5 ? 0 : 1, {
          damping: 28,
          mass: 0.2,
          stiffness: 150,
        });
      }}
    >
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View style={[styles.compact, compactStyle]}>
          <QrCode color={colors.text} size={22} />
          <Text style={styles.compactText}>Mostrar QR Code</Text>
        </Animated.View>
        <Animated.View style={[styles.code, codeStyle]}>
          <QRCodeStyled
            color={colors.text}
            data={value}
            innerEyesOptions={{ color: colors.text }}
            outerEyesOptions={{ color: colors.text }}
            padding={12}
            pieceBorderRadius={3}
            pieceCornerType="rounded"
            size={210}
          />
        </Animated.View>
        <BlurView intensity={1} pointerEvents="none" style={StyleSheet.absoluteFill} tint="systemChromeMaterialLight" />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  compact: { alignItems: "center", flexDirection: "row", gap: 8, position: "absolute" },
  compactText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  code: { alignItems: "center", justifyContent: "center", position: "absolute" },
});
