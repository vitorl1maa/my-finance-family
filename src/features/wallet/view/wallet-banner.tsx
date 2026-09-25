import { ArrowDownToLine, ArrowUpFromLine, Trash2 } from "lucide-react-native";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function WalletBanner({
  balanceCents,
  onReset,
  onSave,
  onWithdraw,
}: {
  balanceCents: number;
  onReset: () => void;
  onSave: () => void;
  onWithdraw: () => void;
}) {
  return (
    <ImageBackground
      accessibilityLabel="Saldo da carteira"
      imageStyle={styles.image}
      source={require("../../../../assets/images/wallet.png")}
      style={styles.card}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>SALDO DA CARTEIRA</Text>
        </View>
        <View style={styles.balanceRow}>
          <AnimatedCurrency style={styles.balance} valueInCents={balanceCents} />
          <Pressable
            accessibilityLabel="Zerar saldo da carteira"
            onPress={onReset}
            style={styles.reset}
          >
            <Trash2 color={colors.walletDark} size={16} />
          </Pressable>
        </View>
        <Text style={styles.description}>Disponível para suas despesas</Text>
        <View style={styles.actions}>
          <Action
            icon={<ArrowDownToLine color={colors.walletDark} size={16} />}
            label="Guardar"
            onPress={onSave}
          />
          <Action
            icon={<ArrowUpFromLine color={colors.walletDark} size={16} />}
            label="Resgatar"
            onPress={onWithdraw}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
      {icon}
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, height: 190, overflow: "hidden" },
  image: { opacity: 0.72, resizeMode: "cover" },
  overlay: {
    backgroundColor: "#DFF7A4C7",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  content: { alignItems: "center", flex: 1, justifyContent: "center", padding: 18 },
  heading: { alignItems: "center", flexDirection: "row", gap: 7 },
  balanceRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 3 },
  reset: {
    alignItems: "center",
    backgroundColor: "#FFFFFFB8",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  eyebrow: { color: colors.walletDark, fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.35 },
  balance: { color: colors.walletDark, fontFamily: fonts.extraBold, fontSize: 38 },
  description: { color: colors.walletDark, fontSize: 12, opacity: 0.85 },
  actions: { flexDirection: "row", gap: 10, marginTop: 13 },
  action: {
    alignItems: "center",
    backgroundColor: "#FFFFFFB8",
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  actionText: { color: colors.walletDark, fontFamily: fonts.bold, fontSize: 12 },
});
