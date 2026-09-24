import assert from "node:assert/strict";
import test from "node:test";

import { readAvatarBytes } from "../src/features/auth/model/profile-avatar-upload.ts";

test("reads avatar bytes directly from the local file", async () => {
  const bytes = await readAvatarBytes(
    "file:///avatar.jpg",
    async () => new Uint8Array([255, 216, 255, 217]).buffer,
  );

  assert.equal(bytes.byteLength, 4);
});

test("rejects an empty local image", async () => {
  await assert.rejects(
    () => readAvatarBytes("file:///avatar.jpg", async () => new ArrayBuffer(0)),
    /Não foi possível preparar a foto selecionada/,
  );
});

test("rejects a local response that is not a JPEG image", async () => {
  const invalid = new TextEncoder().encode("File not found").buffer;

  await assert.rejects(
    () => readAvatarBytes("file:///avatar.jpg", async () => invalid),
    /Não foi possível preparar a foto selecionada/,
  );
});
