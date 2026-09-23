# Social Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Google and Apple OAuth login with Supabase in the Expo app and use the Reacticx Social Button visual pattern.

**Architecture:** Isolate OAuth browser/deep-link handling in an auth repository. The auth view model starts a provider flow and the Expo callback route exchanges the returned code for a Supabase session, while the existing AuthSessionSync writes session state to Zustand.

**Tech Stack:** Expo Router, expo-web-browser, expo-linking, Supabase Auth, Zustand, React Native Reanimated.

**Spec:** `docs/superpowers/specs/2026-09-23-social-login-design.md`

## Global Constraints

- Support only `google` and `apple` providers.
- Use redirect URL `myfinancefamily://auth/callback`.
- Keep e-mail/password login intact.
- Do not store provider secrets in the repository.
- Use the Reacticx Social Button pattern in the login screen.

## Review Focus

- OAuth callback without a `code` must show feedback and not create a session.
- A canceled browser session must clear loading and leave the login form usable.
- Deep links for other paths must not trigger a session exchange.
- A duplicate callback must not start two exchanges.
- Google/Apple buttons must be disabled while a provider flow is active.

---

### Task 1: OAuth client and callback parsing

**Files:**
- Create: `src/features/auth/repository/social-auth-repository.ts`
- Create: `src/features/auth/model/social-auth.ts`
- Test: `tests/social-auth.test.mjs`

**Interfaces:**
- Produces `startSocialAuth(provider: "google" | "apple"): Promise<"success" | "cancel" | "error">`.
- Produces `exchangeSocialAuthCode(url: string): Promise<boolean>`.

- [ ] **Step 1: Write failing tests**

```js
test("reads an OAuth code only from the configured callback path", () => {
  assert.equal(getOAuthCode("myfinancefamily://auth/callback?code=abc"), "abc");
  assert.equal(getOAuthCode("myfinancefamily://settings?code=abc"), null);
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/social-auth.test.mjs`

Expected: FAIL because `getOAuthCode` does not exist.

- [ ] **Step 3: Implement callback parsing and OAuth browser flow**

```ts
const redirectTo = "myfinancefamily://auth/callback";
const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
if (result.type === "success") await supabase.auth.exchangeCodeForSession(result.url);
```

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/social-auth.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/model/social-auth.ts src/features/auth/repository/social-auth-repository.ts tests/social-auth.test.mjs
git commit -m "feat: add social OAuth client"
```

### Task 2: Auth state and Expo callback route

**Files:**
- Modify: `src/features/auth/view-model/use-auth-view-model.ts`
- Create: `app/auth/callback.tsx`
- Test: `tests/social-auth.test.mjs`

**Interfaces:**
- Consumes `startSocialAuth` and `exchangeSocialAuthCode` from Task 1.
- Produces `signInWithSocial(provider): Promise<boolean>` for the login screen.

- [ ] **Step 1: Add failing tests**

```js
test("rejects a callback URL without an OAuth code", () => {
  assert.equal(getOAuthCode("myfinancefamily://auth/callback"), null);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/social-auth.test.mjs`

Expected: FAIL until callback validation is added.

- [ ] **Step 3: Implement a guarded callback screen and view-model flow**

```tsx
const url = useURL();
useEffect(() => {
  if (!url || hasStarted.current) return;
  hasStarted.current = true;
  void exchangeSocialAuthCode(url).then((ok) => router.replace(ok ? "/" : "/(auth)/login"));
}, [router, url]);
```

- [ ] **Step 4: Verify tests and types**

Run: `node --test tests/social-auth.test.mjs && npm exec tsc -- --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/view-model/use-auth-view-model.ts app/auth/callback.tsx tests/social-auth.test.mjs
git commit -m "feat: handle social OAuth callbacks"
```

### Task 3: Reacticx Social Button and provider configuration

**Files:**
- Create: `src/shared/components/base/social-button.tsx`
- Modify: `app/(auth)/login.tsx`
- Modify: `app.json`
- Test: `tests/social-auth.test.mjs`

**Interfaces:**
- Consumes `signInWithSocial(provider)` from Task 2.
- Produces accessible social buttons for Google and Apple.

- [ ] **Step 1: Add a failing test for supported providers**

```js
test("accepts only Google and Apple social providers", () => {
  assert.equal(isSocialProvider("google"), true);
  assert.equal(isSocialProvider("apple"), true);
  assert.equal(isSocialProvider("facebook"), false);
});
```

- [ ] **Step 2: Run it to verify failure**

Run: `node --test tests/social-auth.test.mjs`

Expected: FAIL because `isSocialProvider` does not exist.

- [ ] **Step 3: Implement Reacticx-style buttons and login wiring**

```tsx
<SocialButton disabled={isLoading} provider="google" onPress={() => void signInWithSocial("google")} />
<SocialButton disabled={isLoading} provider="apple" onPress={() => void signInWithSocial("apple")} />
```

Use Reanimated press feedback and provider icons; configure the `myfinancefamily` scheme in `app.json`.

- [ ] **Step 4: Run full verification**

Run: `node --test tests/*.test.mjs && npm exec tsc -- --noEmit && npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/base/social-button.tsx app/(auth)/login.tsx app.json tests/social-auth.test.mjs
git commit -m "feat: add Reacticx social login buttons"
```

### Task 4: Supabase provider handoff

**Files:**
- Modify: `.env.example`
- Create: `docs/social-login-supabase-setup.md`

**Interfaces:**
- Documents the external configuration required by Tasks 1–3.

- [ ] **Step 1: Document exact redirect and required provider credentials**

```md
Supabase Auth > URL Configuration > Redirect URLs:
myfinancefamily://auth/callback
```

List Google OAuth Client ID/Secret and Apple Service ID, Team ID, Key ID, private key requirements without recording secret values.

- [ ] **Step 2: Verify no secret is committed**

Run: `git diff --cached -- . ':!*.example'`

Expected: no OAuth secret or private key content.

- [ ] **Step 3: Commit**

```bash
git add .env.example docs/social-login-supabase-setup.md
git commit -m "docs: explain social login provider setup"
```
