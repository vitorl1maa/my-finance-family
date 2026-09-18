# Expense Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Expense Registration flow with family-shared categories, a date calendar, automatic default-account assignment, BRL input handling, Supabase contracts, and local persistence compatibility.

**Architecture:** Keep the existing Expo Router, React Hook Form, Zustand, SQLite and Supabase layers. Add focused category and calendar components, move expense creation behind repository/view-model contracts, and use a Supabase RPC to resolve family and default account server-side. Preserve existing uncommitted dashboard and expense-screen work while making only scoped changes.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript, Expo Router, React Hook Form, Zustand, Expo SQLite, Supabase, `date-fns`, Node test runner, Biome.

**Spec:** `docs/superpowers/specs/2026-09-18-expense-registration-design.md`

## Global Constraints

- Categories are family-shared and initially limited to Moradia, Alimentação, Saúde and Lazer.
- The expense screen must not render an account selector; the backend resolves the family default account.
- Expense amounts remain signed integer cents, with expenses stored as negative values.
- The minimum project font size remains 12px.
- The date picker must use the existing `date-fns` dependency and must not add another calendar dependency.
- Preserve existing uncommitted changes unrelated to this plan.
- Run targeted tests, `npm exec tsc -- --noEmit`, Biome checks, and `npx expo install --check` before completion.

### Task 1: Define category and transaction persistence contracts

**Files:**
- Create: `supabase/migrations/202609180001_expense_categories.sql`
- Create: `src/features/categories/model/expense-category.ts`
- Create: `src/features/categories/repository/categories-repository.ts`
- Modify: `src/features/transactions/model/transaction.ts`
- Modify: `src/features/transactions/repository/transactions-repository.ts`
- Modify: `src/shared/database/database.ts`
- Test: `tests/expense-categories.test.mjs`

**Interfaces:**
- Produces `ExpenseCategory`, category row mapping, category ordering, and the Supabase schema/RLS/RPC contract consumed by later tasks.

- [ ] **Step 1: Write failing category model tests**

```js
test("orders active family categories in product order", () => {
  assert.deepEqual(orderExpenseCategories(input).map((item) => item.name), [
    "Moradia",
    "Alimentação",
    "Saúde",
    "Lazer",
  ]);
});
```

- [ ] **Step 2: Run `node --experimental-strip-types --test tests/expense-categories.test.mjs` and verify it fails because the model helper is missing.**
- [ ] **Step 3: Add the `ExpenseCategory` type, active-category filter, product-order helper, repository query, Supabase migration, seed data, default-account index, RLS policies, and `create_expense` RPC described in the spec.**
- [ ] **Step 4: Add SQLite migration fields for `family_id` and `category_id` while preserving existing local transaction data.**
- [ ] **Step 5: Run the category test and verify it passes.**
- [ ] **Step 6: Commit only the task files with `git add supabase src/features/categories src/features/transactions src/shared/database tests/expense-categories.test.mjs && git commit -m "feat: add family expense category contracts"`.**

### Task 2: Implement category loading and selection UI

**Files:**
- Create: `src/features/transactions/components/category-picker.tsx`
- Modify: `src/features/transactions/view-model/use-transactions-view-model.ts`
- Modify: `src/features/transactions/view/expense-new-view.tsx`
- Test: `tests/expense-category-flow.test.mjs`

**Interfaces:**
- Consumes `ExpenseCategory[]` and `listFamilyCategories` from Task 1.
- Produces `categories`, `categoriesLoading`, `categoriesError`, `reloadCategories`, and a controlled category bottom sheet.

- [ ] **Step 1: Write tests for category loading, selected value, retry state, and category selection.**
- [ ] **Step 2: Run the new tests and verify they fail before the view-model/component exists.**
- [ ] **Step 3: Add the category repository call and view-model state, using cached family categories when available.**
- [ ] **Step 4: Add a read-only category field and bottom sheet listing only active categories in the required order.**
- [ ] **Step 5: Connect the selected category ID to React Hook Form and disable save until a valid category is selected.**
- [ ] **Step 6: Run the category flow tests and Biome on changed files.**
- [ ] **Step 7: Commit with `git add src/features/transactions src/features/categories tests/expense-category-flow.test.mjs && git commit -m "feat: add family category picker"`.**

### Task 3: Implement the date calendar and remove account selection

**Files:**
- Create: `src/features/transactions/components/expense-date-picker.tsx`
- Modify: `src/features/transactions/view/expense-new-view.tsx`
- Modify: `src/features/transactions/model/transaction.ts`
- Test: `tests/expense-date-picker.test.mjs`

**Interfaces:**
- Produces a controlled calendar with `value: Date`, `visible`, `onClose`, and `onSelect(date: Date)`.
- Expense form consumes a read-only formatted date and sends a local-date-safe ISO value.

- [ ] **Step 1: Write date helper tests for current-month initialization, previous/next month navigation, and selected day rendering.**
- [ ] **Step 2: Run the tests and verify they fail before the calendar helpers exist.**
- [ ] **Step 3: Implement the calendar using `date-fns`, with Sunday-first weeks, month navigation, selected-day styling, and modal close behavior.**
- [ ] **Step 4: Replace the editable Data field with the calendar trigger and remove the Conta/Conta principal field, icon, form value, and layout slot.**
- [ ] **Step 5: Preserve Recorrência as a read-only “Não se repete” field.**
- [ ] **Step 6: Run date tests, TypeScript, and targeted Biome checks.**
- [ ] **Step 7: Commit with `git add src/features/transactions tests/expense-date-picker.test.mjs && git commit -m "feat: add expense date picker"`.**

### Task 4: Connect submission to Supabase/local persistence

**Files:**
- Modify: `src/features/transactions/view-model/use-transactions-view-model.ts`
- Modify: `src/features/transactions/repository/transactions-repository.ts`
- Modify: `src/features/transactions/store/transactions-store.ts`
- Modify: `src/features/transactions/view/expense-new-view.tsx`
- Test: `tests/create-expense.test.mjs`

**Interfaces:**
- Consumes `categoryId`, `amountCents`, `occurredAt`, and `title` from the form.
- Produces `CreateExpenseResult` and updates pending/synced transaction state without accepting account or family IDs from the UI.

- [ ] **Step 1: Write tests that assert `R$ 40,00` becomes `-4000`, the payload excludes account/family IDs, and failures preserve form data.**
- [ ] **Step 2: Run the tests and verify they fail against the current string-category submission path.**
- [ ] **Step 3: Update the repository/view-model to create a pending local transaction, call the RPC when authenticated, resolve the default account server-side, and reconcile the returned transaction.**
- [ ] **Step 4: Update the form validation and submit button states for missing category, invalid amount, missing default account, loading, and RPC errors.**
- [ ] **Step 5: Update transaction mapping so dashboard and transaction lists continue showing category names.**
- [ ] **Step 6: Run the expense submission tests and verify they pass.**
- [ ] **Step 7: Commit with `git add src/features/transactions tests/create-expense.test.mjs && git commit -m "feat: persist expenses with family category"`.**

### Task 5: Verify the integrated flow

**Files:**
- Modify only files required by verification findings.

- [ ] **Step 1: Run all focused tests:**

```bash
node --experimental-strip-types --test tests/money-input.test.mjs tests/expense-categories.test.mjs tests/expense-category-flow.test.mjs tests/expense-date-picker.test.mjs tests/create-expense.test.mjs tests/dashboard-insights.test.mjs tests/dashboard-greeting.test.mjs
```

- [ ] **Step 2: Run `npm exec tsc -- --noEmit`.**
- [ ] **Step 3: Run `npx biome check .`.**
- [ ] **Step 4: Run `npx expo install --check` and record any pre-existing dependency mismatch without changing dependencies unless required by the implementation.**
- [ ] **Step 5: Inspect `git diff`, `git status`, and the final commit list to confirm no unrelated dashboard or prior mask changes were overwritten.**
- [ ] **Step 6: Commit any verification-only fixes with `git commit -am "fix: verify expense registration flow"`.**
