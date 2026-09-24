import assert from "node:assert/strict";
import test from "node:test";

import * as profileAvatar from "../src/features/auth/model/profile-avatar.ts";

const { getAvatarInitial } = profileAvatar;

test("uses the first visible character as the avatar fallback", () => {
  assert.equal(getAvatarInitial(" Vitor Lima "), "V");
  assert.equal(getAvatarInitial(""), "?");
});

test("prepares the saved profile photo for another account screen", () => {
  assert.equal(typeof profileAvatar.getProfileAvatarPresentation, "function");
  assert.deepEqual(
    profileAvatar.getProfileAvatarPresentation(
      {
        avatar_seed: "photo-v2",
        avatar_url: "https://example.com/profile.jpg",
      },
      "Vitor Lima",
    ),
    {
      avatarUrl: "https://example.com/profile.jpg",
      label: "Vitor Lima",
      token: "photo-v2",
    },
  );
});
