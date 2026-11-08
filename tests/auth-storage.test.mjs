import assert from "node:assert/strict";
import test from "node:test";

import { createWebAuthStorage } from "../src/shared/supabase/auth-storage.ts";

test("uses a no-op auth storage while rendering on the server", async () => {
  const storage = createWebAuthStorage(undefined);

  assert.equal(await storage.getItem("session"), null);
  await assert.doesNotReject(storage.setItem("session", "value"));
  await assert.doesNotReject(storage.removeItem("session"));
});

test("persists auth sessions in browser storage", async () => {
  const values = new Map();
  const browserStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const storage = createWebAuthStorage(browserStorage);

  await storage.setItem("session", "value");
  assert.equal(await storage.getItem("session"), "value");

  await storage.removeItem("session");
  assert.equal(await storage.getItem("session"), null);
});
