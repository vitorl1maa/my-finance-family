# Contas e Despesas Compartilhadas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement shared family accounts and expenses across Supabase, SQLite and the Expo Router app, preserving immediate offline writes and later synchronization.

**Architecture:** Supabase is the remote source of truth with `families`, `family_members`, `accounts`, `categories` and `expenses`, protected by RLS. SQLite stores the authenticated family's local projection and pending mutations; Zustand exposes that projection to screens. React Hook Form handles the two new modal forms and TanStack Query coordinates remote refresh/retry.

**Tech Stack:** Expo SDK 57, Expo Router, TypeScript, Zustand, SQLite, Supabase JS, TanStack Query, React Hook Form, Zod.

**Spec:** `docs/superpowers/specs/2026-09-16-family-finances-design.md`

## Global Constraints

- SQLite remains the immediate read source for the app.
- New local records use UUIDs and `sync_status` values `pending`, `synced` or `failed`.
- RLS permits access only to members of the same family.
- Money is stored as integer cents and displayed in BRL.
- New React components stay below 300 lines.
- Do not introduce nested `if` chains; use guard clauses and small strategy helpers.
- Avoid unnecessary `useEffect` calls and `any` types.
- Validate TypeScript, Android bundling and SQL/RLS behavior before completion.

## File Map

- Create `supabase/migrations/20260916_family_finances.sql`: tables, indexes, RLS policies, membership helper and initial-family trigger.
- Modify `src/shared/database/database.ts`: SQLite schema migration from version 1 to version 2.
- Modify `src/features/accounts/model/account.ts` and create `src/features/accounts/model/account-form.ts`: domain and form types.
- Modify `src/features/accounts/repository/accounts-repository.ts`: list and insert local accounts.
- Modify `src/features/accounts/store/accounts-store.ts` and `src/features/accounts/view-model/use-accounts-view-model.ts`: local projection and mutations.
- Modify `src/features/transactions/model/transaction.ts` and create `src/features/transactions/model/expense-form.ts`: expense domain/form types.
- Modify `src/features/transactions/repository/transactions-repository.ts`: list and insert local expenses.
- Modify `src/features/transactions/store/transactions-store.ts` and `src/features/transactions/view-model/use-transactions-view-model.ts`: local projection and mutations.
- Create `src/shared/sync/sync-service.ts`: idempotent remote sync for pending account/expense rows.
- Create `src/features/accounts/components/account-form.tsx`: account form UI and validation.
- Create `src/features/transactions/components/expense-form.tsx`: expense form UI and validation.
- Create `app/(tabs)/account-new.tsx` and `app/(tabs)/expense-new.tsx`: modal routes.
- Modify `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/accounts.tsx` and `app/(tabs)/transactions.tsx`: modal route registration and action navigation.
- Modify `src/providers/app-providers.tsx`: authenticated family bootstrap and sync lifecycle.

### Task 1: Add the Supabase schema and security policies

**Files:**
- Create: `supabase/migrations/20260916_family_finances.sql`
- Test: `supabase/tests/20260916_family_finances.sql`

**Interfaces:**
- Produces tables `families`, `family_members`, `accounts`, `categories`, `expenses`.
- Produces `is_family_member(uuid)` and the initial-family trigger.

- [ ] Write SQL assertions for table existence, constraints and the `is_family_member` helper.
- [ ] Run the assertions against a local Supabase database or SQL editor and confirm they fail before the migration exists.
- [ ] Add the migration with UUID keys, cents fields, date/recurrence checks, indexes on family/account/date and timestamp update trigger.
- [ ] Enable RLS and add select/insert/update/delete policies using `is_family_member`; restrict family-member administration to owners.
- [ ] Add the `auth.users` trigger that creates a family named `Minha família` and an owner membership using `raw_user_meta_data`.
- [ ] Re-run the SQL assertions and record that they pass.
- [ ] Commit `feat: add shared family finance schema`.

### Task 2: Extend SQLite and domain contracts

**Files:**
- Modify: `src/shared/database/database.ts`
- Modify: `src/features/accounts/model/account.ts`
- Create: `src/features/accounts/model/account-form.ts`
- Modify: `src/features/transactions/model/transaction.ts`
- Create: `src/features/transactions/model/expense-form.ts`

**Interfaces:**
- `Account` includes `familyId`, `institution`, `kind`, `openingBalanceCents`, `balanceCents`, `syncStatus`.
- `ExpenseForm` includes `description`, `amountCents`, `categoryId`, `accountId`, `expenseDate`, `recurrence`.

- [ ] Write schema/domain tests for valid account kinds, positive expense amounts, recurrence values and cents conversion.
- [ ] Run the tests and confirm the new contracts fail before implementation.
- [ ] Add SQLite migration version 2 with `family_id`, `institution`, `opening_balance_cents`, `created_by`, `sync_status` and timestamps to accounts, plus expense/category columns and indexes.
- [ ] Keep migration idempotent and preserve existing seed data for local development.
- [ ] Implement the Zod schemas and inferred TypeScript types without `any`.
- [ ] Run the schema tests and TypeScript compiler.
- [ ] Commit `feat: add local finance domain contracts`.

### Task 3: Implement local repositories, stores and sync

**Files:**
- Modify: `src/features/accounts/repository/accounts-repository.ts`
- Modify: `src/features/accounts/store/accounts-store.ts`
- Modify: `src/features/accounts/view-model/use-accounts-view-model.ts`
- Modify: `src/features/transactions/repository/transactions-repository.ts`
- Modify: `src/features/transactions/store/transactions-store.ts`
- Modify: `src/features/transactions/view-model/use-transactions-view-model.ts`
- Create: `src/shared/sync/sync-service.ts`

**Interfaces:**
- `createLocalAccount(input): Promise<Account>` inserts a UUID row with `pending` status.
- `createLocalExpense(input): Promise<Transaction>` inserts a UUID row with `pending` status and updates the related local account balance.
- `syncPendingFinanceRows(): Promise<void>` upserts pending rows and marks success/failure.

- [ ] Write repository tests for immediate local account/expense insertion and balance update.
- [ ] Run them and confirm failure before implementation.
- [ ] Implement parameterized SQLite inserts and reads; do not concatenate user input into SQL.
- [ ] Implement Zustand actions that update the visible list immediately after local writes.
- [ ] Implement Supabase upserts using the local UUID, authenticated family ID and `created_by` from the current session.
- [ ] Reconcile successful rows as `synced`, retain failures as `failed`, and use TanStack Query retry/backoff for network errors.
- [ ] Run repository tests, TypeScript and a mocked sync test for idempotent retry.
- [ ] Commit `feat: add offline finance mutations and sync`.

### Task 4: Build the account and expense form components

**Files:**
- Create: `src/features/accounts/components/account-form.tsx`
- Create: `src/features/transactions/components/expense-form.tsx`

**Interfaces:**
- Account form receives `onSubmit: (values: AccountForm) => Promise<void>` and `isSubmitting`.
- Expense form receives available accounts/categories plus `onSubmit: (values: ExpenseForm) => Promise<void>` and `isSubmitting`.

- [ ] Write component tests for required fields, cents parsing, category/account selection and submit payloads.
- [ ] Run them and confirm failure before implementation.
- [ ] Implement both forms with React Hook Form `Controller`, Zod-compatible validation messages and accessible labels.
- [ ] Use a large amount field, compact two-column selection cards where space allows, and the approved white/gray/lime visual system.
- [ ] Show an offline-safe confirmation message after local persistence; do not block submission on Supabase availability.
- [ ] Run component tests and verify each component remains below 300 lines.
- [ ] Commit `feat: add finance entry forms`.

### Task 5: Add modal routes and connect Dashboard actions

**Files:**
- Create: `app/(tabs)/account-new.tsx`
- Create: `app/(tabs)/expense-new.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/accounts.tsx`
- Modify: `app/(tabs)/transactions.tsx`

**Interfaces:**
- Routes `/account-new` and `/expense-new` render the forms in modal presentation.
- Dashboard buttons navigate with `router.push('/account-new')` and `router.push('/expense-new')`.

- [ ] Write navigation/component tests that press each Dashboard action and assert the corresponding route target.
- [ ] Run them and confirm failure before implementation.
- [ ] Register both routes with hidden tab links and modal presentation.
- [ ] Wire account and expense view-model mutations into each form and close the modal after successful local persistence.
- [ ] Add the same actions to Accounts and Transactions where their existing headers expose actions.
- [ ] Run navigation tests and Android bundle export.
- [ ] Commit `feat: add account and expense creation routes`.

### Task 6: Bootstrap family context and verify end-to-end behavior

**Files:**
- Modify: `src/providers/app-providers.tsx`
- Modify: `src/shared/query/query-client.ts`
- Create: `docs/superpowers/plans/2026-09-16-family-finances-verification.md`

**Interfaces:**
- Provider exposes the authenticated family ID to repositories and starts a sync after authentication and reconnection.

- [ ] Write an end-to-end checklist for new user bootstrap, shared member visibility, offline create, reconnect sync and cross-family denial.
- [ ] Run the checklist against the local app/Supabase environment before the provider changes and record the expected failures.
- [ ] Fetch the user's family membership after auth, seed local family context, and run `syncPendingFinanceRows` on startup/reconnect without unnecessary effects.
- [ ] Add query keys for `['family', familyId, 'accounts']` and `['family', familyId, 'expenses']`, invalidating them after successful sync.
- [ ] Validate two authenticated users in one family can see the same rows, while a different family receives no rows through RLS.
- [ ] Run `npm exec tsc -- --noEmit`, `git diff --check`, Android export and the SQL/RLS checks.
- [ ] Commit `feat: connect family finance sync lifecycle`.
