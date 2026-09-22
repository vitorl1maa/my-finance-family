import assert from "node:assert/strict";
import test from "node:test";

import { isInvitationAcceptable } from "../src/features/family/model/family-invitation.ts";

test("acceptance rejects expired, consumed, and already-associated users", () => {
  const past = new Date("1970-01-01T00:00:00.000Z");
  const now = new Date("2026-09-22T12:00:00.000Z");
  const future = new Date("2099-09-22T12:01:00.000Z");

  assert.equal(
    isInvitationAcceptable({ expiresAt: past, acceptedAt: null, hasFamily: false }),
    false,
  );
  assert.equal(
    isInvitationAcceptable({ expiresAt: future, acceptedAt: now, hasFamily: false }),
    false,
  );
  assert.equal(
    isInvitationAcceptable({ expiresAt: future, acceptedAt: null, hasFamily: true }),
    false,
  );
});

test("acceptance permits an unused, unexpired invitation for an unaffiliated user", () => {
  assert.equal(
    isInvitationAcceptable({
      expiresAt: new Date("2099-09-22T12:01:00.000Z"),
      acceptedAt: null,
      hasFamily: false,
    }),
    true,
  );
});
