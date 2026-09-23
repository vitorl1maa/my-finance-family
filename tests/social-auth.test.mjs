import assert from "node:assert/strict";
import test from "node:test";

import * as socialAuth from "../src/features/auth/model/social-auth.ts";

test("reads an OAuth code only from the configured callback path", () => {
  assert.equal(typeof socialAuth.getOAuthCode, "function");
  assert.equal(socialAuth.getOAuthCode("myfinancefamily://auth/callback?code=abc"), "abc");
  assert.equal(socialAuth.getOAuthCode("myfinancefamily://settings?code=abc"), null);
});

test("rejects a callback URL without an OAuth code", () => {
  assert.equal(socialAuth.getOAuthCode("myfinancefamily://auth/callback"), null);
});
