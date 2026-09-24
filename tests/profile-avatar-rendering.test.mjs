import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the initials visible behind a remote profile image", async () => {
  const component = await readFile(
    new URL("../src/features/auth/components/profile-avatar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(component, /\{avatarUrl \? \(/);
  assert.match(component, /position: "absolute"/);
});
