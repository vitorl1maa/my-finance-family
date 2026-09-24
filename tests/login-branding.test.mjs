import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shows the My Finance Family mark on the login screen", async () => {
  const screen = await readFile(new URL("../app/(auth)/login.tsx", import.meta.url), "utf8");

  assert.match(screen, /import \{ Image, Pressable, StyleSheet, Text, View \} from "react-native"/);
  assert.match(screen, /source=\{require\("@\/assets\/images\/icon-pencil\.png"\)\}/);
});
