import assert from "node:assert/strict";
import test from "node:test";

import * as familyInvitation from "../src/features/family/model/family-invitation.ts";

const { isInvitationAcceptable } = familyInvitation;

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

test("returns the remaining whole seconds before expiry and 0 after expiry", () => {
  assert.equal(typeof familyInvitation.getRemainingInvitationSeconds, "function");
  assert.equal(
    familyInvitation.getRemainingInvitationSeconds(
      "2026-09-22T12:01:00.000Z",
      new Date("2026-09-22T12:00:01.000Z"),
    ),
    59,
  );
  assert.equal(
    familyInvitation.getRemainingInvitationSeconds(
      "2026-09-22T12:01:00.000Z",
      new Date("2026-09-22T12:01:01.000Z"),
    ),
    0,
  );
});

test("maps known invitation RPC failures to actionable Portuguese messages", () => {
  assert.equal(typeof familyInvitation.getFamilyInvitationErrorMessage, "function");
  assert.equal(
    familyInvitation.getFamilyInvitationErrorMessage(new Error("invalid_or_expired_invitation")),
    "Este QR Code expirou ou já foi utilizado. Peça para gerar um novo código.",
  );
  assert.equal(
    familyInvitation.getFamilyInvitationErrorMessage(new Error("user_already_associated")),
    "Você já participa de uma família e não pode aceitar outro convite.",
  );
  assert.equal(
    familyInvitation.getFamilyInvitationErrorMessage(new Error("family_owner_required")),
    "Somente administradores podem gerar um QR Code de convite.",
  );
});

test("derives invitation progress from its 60-second lifetime", () => {
  assert.equal(typeof familyInvitation.getInvitationProgress, "function");
  assert.equal(familyInvitation.getInvitationProgress(60), 1);
  assert.equal(familyInvitation.getInvitationProgress(30), 0.5);
  assert.equal(familyInvitation.getInvitationProgress(0), 0);
});

test("accepts only normalized 64-character hexadecimal invitation tokens", () => {
  assert.equal(typeof familyInvitation.parseFamilyInvitationToken, "function");
  assert.equal(
    familyInvitation.parseFamilyInvitationToken(
      "  ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789  ",
    ),
    "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
  );
  assert.equal(familyInvitation.parseFamilyInvitationToken(""), null);
  assert.equal(familyInvitation.parseFamilyInvitationToken("convite-qualquer"), null);
  assert.equal(familyInvitation.parseFamilyInvitationToken("a".repeat(63)), null);
});
