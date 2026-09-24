import { ArrowRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function EmptyWalletBanner({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <View style={styles.heading}>
          <Text style={styles.title}>Sua carteira está vazia</Text>
        </View>
        <Text style={styles.message}>Adicione uma renda para começar</Text>
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
          <Text style={styles.actionText}>Adicionar renda</Text>
          <ArrowRight color={colors.text} size={15} strokeWidth={2.5} />
        </Pressable>
      </View>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Ilustração de uma carteira vazia"
        resizeMode="contain"
        source={require("../../../../assets/images/wallet.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    backgroundColor: "#E7F8C4",
    borderRadius: 18,
    flexDirection: "row",
    height: 142,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingLeft: 16,
    paddingRight: 4,
  },
  copy: { flex: 1, gap: 6 },
  heading: { alignItems: "center", flexDirection: "row", gap: 6 },
  title: { color: colors.walletDark, flexShrink: 1, fontFamily: fonts.extraBold, fontSize: 16 },
  message: { color: "#47652B", fontSize: 12, lineHeight: 15 },
  action: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  actionText: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  image: { height: 132, width: 128 },
});
