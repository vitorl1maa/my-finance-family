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

test("acceptance permits replacing an untouched bootstrap family owned only by the invitee", () => {
  assert.equal(
    isInvitationAcceptable({
      expiresAt: new Date("2026-09-22T12:01:00.000Z"),
      acceptedAt: null,
      hasFamily: true,
      now: new Date("2026-09-22T12:00:00.000Z"),
      bootstrapFamily: {
        isBootstrap: true,
        isOwner: true,
        createdByCurrentUser: true,
        hasOtherMembers: false,
        hasTransactions: false,
        hasExpenses: false,
        hasGoals: false,
        hasIncomeSources: false,
        piggyBankBalanceCents: 0,
        hasNonZeroAccountBalance: false,
        hasInvitations: false,
      },
    }),
    true,
  );
});

test("acceptance never replaces a non-bootstrap, shared, or financially used family", () => {
  const baseBootstrapFamily = {
    isBootstrap: true,
    isOwner: true,
    createdByCurrentUser: true,
    hasOtherMembers: false,
    hasTransactions: false,
    hasExpenses: false,
    hasGoals: false,
    hasIncomeSources: false,
    piggyBankBalanceCents: 0,
    hasNonZeroAccountBalance: false,
    hasInvitations: false,
  };

  for (const unsafeBootstrapFamily of [
    { ...baseBootstrapFamily, isBootstrap: false },
    { ...baseBootstrapFamily, isOwner: false },
    { ...baseBootstrapFamily, createdByCurrentUser: false },
    { ...baseBootstrapFamily, hasOtherMembers: true },
    { ...baseBootstrapFamily, hasTransactions: true },
    { ...baseBootstrapFamily, hasExpenses: true },
    { ...baseBootstrapFamily, hasGoals: true },
    { ...baseBootstrapFamily, hasIncomeSources: true },
    { ...baseBootstrapFamily, piggyBankBalanceCents: 1 },
    { ...baseBootstrapFamily, hasNonZeroAccountBalance: true },
    { ...baseBootstrapFamily, hasInvitations: true },
  ]) {
    assert.equal(
      isInvitationAcceptable({
        expiresAt: new Date("2026-09-22T12:01:00.000Z"),
        acceptedAt: null,
        hasFamily: true,
        now: new Date("2026-09-22T12:00:00.000Z"),
        bootstrapFamily: unsafeBootstrapFamily,
      }),
      false,
    );
  }
});

test("acceptance rejects an invitation at its exact 60-second expiry boundary", () => {
  assert.equal(
    isInvitationAcceptable({
      expiresAt: new Date("2026-09-22T12:01:00.000Z"),
      acceptedAt: null,
      hasFamily: false,
      now: new Date("2026-09-22T12:01:00.000Z"),
    }),
    false,
  );
});
