import { type Href, Link, Stack } from "expo-router";
import { Text, View } from "react-native";

import { colors } from "@/src/shared/theme/colors";

const homeHref = "/" as Href;

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Pagina nao encontrada" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta tela nao existe.</Text>

        <Link href={homeHref} style={styles.link}>
          <Text style={styles.linkText}>Voltar para o inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = {
  container: {
    backgroundColor: colors.background,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  } as const,
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  } as const,
  link: {
    marginTop: 15,
    paddingVertical: 15,
  } as const,
  linkText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "800",
  } as const,
};
