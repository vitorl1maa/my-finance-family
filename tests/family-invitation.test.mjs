import assert from "node:assert/strict";
import test from "node:test";

import { getFamilyInvitationConfirmation } from "../src/features/family/model/family-invitation.ts";

const token = "a".repeat(64);

test("prepares a confirmation only for a valid invitation token", () => {
  assert.deepEqual(getFamilyInvitationConfirmation(token, "Vitor"), {
    token,
    administratorName: "Vitor",
  });
  assert.equal(getFamilyInvitationConfirmation("not-a-token", "Vitor"), null);
});

test("uses a neutral administrator label when the invitation has no display name", () => {
  assert.deepEqual(getFamilyInvitationConfirmation(token, "  "), {
    token,
    administratorName: "administrador",
  });
});
