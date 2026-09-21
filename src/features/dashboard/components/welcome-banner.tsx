import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function WelcomeBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.message}>Vamos cuidar do seu dinheiro.</Text>
      </View>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Ilustração de boas-vindas"
        resizeMode="contain"
        source={require("../../../../assets/images/welcome.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    backgroundColor: "#FFF0C2",
    borderRadius: 18,
    flexDirection: "row",
    height: 116,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingLeft: 16,
    paddingRight: 8,
  },
  copy: { flex: 1, gap: 5 },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 20 },
  message: { color: "#5B4212", fontFamily: fonts.bold, fontSize: 12 },
  image: { height: 112, width: 113 },
});
