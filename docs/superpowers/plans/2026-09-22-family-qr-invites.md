# Family QR Invitations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow an owner to invite one unaffiliated user into a single family through a 60-second, single-use QR Code.

**Architecture:** Supabase stores only a hash of each invitation token and exposes owner-only creation plus authenticated acceptance RPCs. The app renders the token as a QR Code, counts down from 60 seconds with a progress bar, and scans it through the native camera before calling the acceptance RPC.

**Tech Stack:** Expo 57, Expo Router, React Native, Expo Camera, `react-native-qrcode-svg`, Supabase Postgres/RPC, Zustand, Biome, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-22-family-qr-invites-design.md`

## Global Constraints

- Only a `family_members.role = 'owner'` user can generate invitations.
- An invitation expires exactly 60 seconds after generation and can be accepted once.
- `family_members.user_id` must belong to at most one family.
- Do not send e-mail or persist the raw QR token in Postgres.
- Use the existing color/font tokens and the Reacticx-inspired numeric countdown over a progress bar.

## Review Focus

- An expired token must never create a membership.
- A token already consumed by another user must never be accepted again.
- A user already in any family must be blocked even with a valid invitation.
- A non-owner must not create a QR invitation.
- Camera permission denial must leave a usable manual-code entry path.

---

### Task 1: Add the invitation schema and protected RPCs

**Files:**
- Create: `supabase/migrations/202609220003_family_qr_invitations.sql`
- Test: `tests/family-invitations.test.mjs`

**Interfaces:**
- Produces: `create_family_qr_invitation() -> { token text, expires_at timestamptz }`.
- Produces: `accept_family_qr_invitation(raw_token text) -> { family_id uuid }`.

- [ ] **Step 1: Write failing SQL-contract tests**

```js
test("acceptance rejects expired, consumed, and already-associated users", () => {
  assert.equal(isInvitationAcceptable({ expiresAt: past, acceptedAt: null, hasFamily: false }), false);
  assert.equal(isInvitationAcceptable({ expiresAt: future, acceptedAt: now, hasFamily: false }), false);
  assert.equal(isInvitationAcceptable({ expiresAt: future, acceptedAt: null, hasFamily: true }), false);
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/family-invitations.test.mjs`

Expected: FAIL because `isInvitationAcceptable` does not exist.

- [ ] **Step 3: Add the model helper and migration**

```sql
create table public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id)
);
```

The migration must add a unique index on `family_members(user_id)`, generate a random token in `create_family_qr_invitation`, store `encode(digest(token, 'sha256'), 'hex')`, and atomically insert the accepting user as `member` in `accept_family_qr_invitation`.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/family-invitations.test.mjs && node --test tests/*.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/202609220003_family_qr_invitations.sql tests/family-invitations.test.mjs src/features/family/model/family-invitation.ts
git commit -m "feat: add secure family QR invitations"
```

### Task 2: Add repositories and family invitation view model

**Files:**
- Create: `src/features/family/model/family-invitation.ts`
- Create: `src/features/family/repository/family-invitations-remote-repository.ts`
- Create: `src/features/family/view-model/use-family-invitations-view-model.ts`
- Test: `tests/family-invitations.test.mjs`

**Interfaces:**
- Consumes: `create_family_qr_invitation`, `accept_family_qr_invitation`.
- Produces: `createInvitation(): Promise<{ token: string; expiresAt: string }>` and `acceptInvitation(token: string): Promise<void>`.

- [ ] **Step 1: Extend failing tests for expiry calculation**

```js
test("returns 0 after expiry and the remaining whole seconds before it", () => {
  assert.equal(getRemainingInvitationSeconds("2026-09-22T12:01:00.000Z", new Date("2026-09-22T12:00:01.000Z")), 59);
  assert.equal(getRemainingInvitationSeconds("2026-09-22T12:01:00.000Z", new Date("2026-09-22T12:01:01.000Z")), 0);
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/family-invitations.test.mjs`

Expected: FAIL because `getRemainingInvitationSeconds` does not exist.

- [ ] **Step 3: Implement exact repository calls and view-model state**

```ts
const { data, error } = await supabase.rpc("create_family_qr_invitation");
if (error) throw error;
return { token: data.token, expiresAt: data.expires_at };
```

Expose `creating`, `accepting`, `error`, `createInvitation`, and `acceptInvitation`; map expected backend errors to Portuguese copy.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/family-invitations.test.mjs && npm exec tsc -- --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/family tests/family-invitations.test.mjs
git commit -m "feat: add family invitation client flow"
```

### Task 3: Build QR generation, progress, and scanning UI

**Files:**
- Modify: `package.json`
- Modify: `app.json`
- Modify: `src/features/family/view/family-members-view.tsx`
- Create: `src/features/family/components/family-qr-invitation-drawer.tsx`
- Create: `src/features/family/components/family-qr-scanner.tsx`
- Test: `tests/family-invitations.test.mjs`

**Interfaces:**
- Consumes: `createInvitation`, `acceptInvitation`, `getRemainingInvitationSeconds`.
- Produces: owner QR drawer and authenticated member scanner flow.

- [ ] **Step 1: Add failing progress tests**

```js
test("derives progress from 60 seconds", () => {
  assert.equal(getInvitationProgress(60), 1);
  assert.equal(getInvitationProgress(30), 0.5);
  assert.equal(getInvitationProgress(0), 0);
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/family-invitations.test.mjs`

Expected: FAIL because `getInvitationProgress` does not exist.

- [ ] **Step 3: Install native dependencies and configure camera permission**

```bash
npx expo install expo-camera react-native-svg
npm install react-native-qrcode-svg
```

Add the camera permission message in `app.json`: `"Permita o acesso à câmera para escanear o convite da família."`.

- [ ] **Step 4: Implement the two flows**

Render the QR with `react-native-qrcode-svg`. Display the remaining number above a 60-second progress bar; disable acceptance after zero. Use `CameraView` barcode scanning for QR codes, stop scanning after the first result, call `acceptInvitation`, and include a TextInput fallback for manual tokens.

- [ ] **Step 5: Run validation**

Run: `node --test tests/family-invitations.test.mjs && npx biome check src app tests && npm exec tsc -- --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app.json src/features/family tests/family-invitations.test.mjs
git commit -m "feat: add QR family invitation experience"
```

### Task 4: Verify the complete invitation lifecycle

**Files:**
- Modify: `tests/family-invitations.test.mjs`
- Modify: `src/features/family/view/family-members-view.tsx`

**Interfaces:**
- Consumes: all Task 1–3 interfaces.
- Produces: user-facing success/error states for the completed flow.

- [ ] **Step 1: Add lifecycle tests**

```js
test("does not render an active invite after its 60-second lifetime", () => {
  assert.equal(getInvitationProgress(-1), 0);
  assert.equal(getRemainingInvitationSeconds(expiredAt, new Date()), 0);
});
```

- [ ] **Step 2: Run the lifecycle test to verify failure**

Run: `node --test tests/family-invitations.test.mjs`

Expected: FAIL until the expired UI state is represented.

- [ ] **Step 3: Render explicit lifecycle feedback**

Show “Código expirado” with “Gerar novo QR Code”; after a successful scan, close the scanner and show “Você entrou na família”. Do not expose invitation tokens in the family member list.

- [ ] **Step 4: Run all verification**

Run: `node --test tests/*.test.mjs && npx biome check src app tests && npm exec tsc -- --noEmit && git diff --check`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/family tests/family-invitations.test.mjs
git commit -m "test: verify QR family invitation lifecycle"
```
