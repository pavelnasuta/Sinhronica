# Achievements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a local-first «Достижения» tab where an athlete can create, compare, edit and delete competition results.

**Architecture:** Add a focused `achievements` domain: typed records and pure chronology helpers, a Zustand store persisted to a namespaced localStorage key, and composed feature components for header, form, cards and page controls. Wire that domain into the existing shell, local-data export and delete flow without changing remote behavior.

**Tech Stack:** React 19, TypeScript, Zustand, Zod, Tailwind/shadcn-style components, Lucide, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-achievements-design.md`

## Global Constraints

- Every achievement remains exclusively in the current browser’s localStorage; no server, account, analytics, sync, import or upload is added.
- Use `sinhronica:achievements:v1` as the only achievement storage key.
- Compare a score only with the nearest strictly earlier result of the same normalized discipline by performance date.
- Sort the timeline by performance date descending, then created timestamp descending.
- Preserve all other app localStorage keys when clearing achievement data.
- Use `public/onboarding/progress.webp` in a fixed `object-contain` mascot frame for both empty and populated achievement states.
- Verify no horizontal overflow at 320×568 and 390×844.

---

### Task 1: Achievement domain and local store

**Files:**
- Create: `src/features/achievements/achievement-types.ts`
- Create: `src/features/achievements/achievement-utils.ts`
- Create: `src/features/achievements/achievement-utils.test.ts`
- Create: `src/stores/achievements-store.ts`
- Create: `src/stores/achievements-store.test.ts`

**Interfaces:**
- Produces `Achievement`, `AchievementDraft`, `AchievementDiscipline`, `AchievementMedal`, `DISCIPLINES`, `MEDALS`.
- Produces `normalizeAchievementDraft(draft)`, `isValidPerformanceDate(date)`, `sortAchievements(records)`, `getPreviousAchievement(record, all)` and `getScoreChange(record, all)`.
- Produces `useAchievementsStore` with `achievements`, `storageStatus`, `create(draft)`, `update(id, draft)`, `remove(id)`, `clear()` and `hydrate()`.

- [ ] **Step 1: Write failing pure-domain tests**

Create tests with records deliberately added out of order. Assert that a 2026-04-10 combo record is ordered before 2026-03-05, that it compares to the 2026-03-05 combo rather than an older record added later, equal score returns `same`, and same-day results have no prior comparison.

```ts
expect(getScoreChange(aprilCombo, records)).toEqual({ direction: 'up', difference: 1.25 })
expect(getScoreChange(equalCombo, records)).toEqual({ direction: 'same', difference: 0 })
expect(getScoreChange(firstCombo, records)).toBeNull()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/features/achievements/achievement-utils.test.ts`

Expected: FAIL because achievement helpers do not exist.

- [ ] **Step 3: Implement the typed helpers**

Define literals for built-in disciplines and medals. Normalize trim-sensitive fields; require a nonempty custom discipline only for `custom`; restrict scores to finite numbers >= 0; validate performance dates against the local day. Sort copies without mutating store state. The comparison helper must filter records by matching normalized discipline key and `performedOn < current.performedOn`, then choose the greatest date.

- [ ] **Step 4: Run the focused helper tests**

Run: `npm test -- src/features/achievements/achievement-utils.test.ts`

Expected: PASS.

- [ ] **Step 5: Write a failing store persistence test**

Assert create persists to `sinhronica:achievements:v1`, hydrate restores a valid item, `update` preserves `id` and `createdAt`, and `clear` removes only the achievement key while a sentinel foreign localStorage key remains.

```ts
localStorage.setItem('foreign:key', 'keep')
useAchievementsStore.getState().clear()
expect(localStorage.getItem('sinhronica:achievements:v1')).toBeNull()
expect(localStorage.getItem('foreign:key')).toBe('keep')
```

- [ ] **Step 6: Run the store test to verify it fails**

Run: `npm test -- src/stores/achievements-store.test.ts`

Expected: FAIL because the store does not exist.

- [ ] **Step 7: Implement the persisted Zustand store**

Follow the safe-storage pattern in `ideas-store.ts`; use Zod or the same semantic helper layer to reject malformed persisted envelopes. Generate UUIDs and timestamps on creation. Persist after each mutation and report existing `StorageStatus` semantics.

- [ ] **Step 8: Run focused store tests and commit**

Run: `npm test -- src/features/achievements/achievement-utils.test.ts src/stores/achievements-store.test.ts`

Expected: PASS.

```bash
git add src/features/achievements/achievement-types.ts src/features/achievements/achievement-utils.ts src/features/achievements/achievement-utils.test.ts src/stores/achievements-store.ts src/stores/achievements-store.test.ts
git commit -m "feat: add local achievements domain"
```

### Task 2: Achievement UI components and page state

**Files:**
- Create: `src/features/achievements/AchievementForm.tsx`
- Create: `src/features/achievements/AchievementCard.tsx`
- Create: `src/features/achievements/AchievementsPage.tsx`
- Create: `src/features/achievements/AchievementsPage.test.tsx`

**Interfaces:**
- `AchievementForm({ initialValue?, onSubmit, onCancel })` emits a valid `AchievementDraft`.
- `AchievementCard({ achievement, comparison, onEdit, onDelete })` shows date, event, discipline, score, medal and optional score change.
- `AchievementsPage()` hydrates the store, opens create/edit dialogs and deletion confirmation, and owns query/filter state.

- [ ] **Step 1: Write a failing page test for the empty state and form**

Render the page with an empty achievement store. Assert the heading, the progress mascot image, and the «Добавить достижение» action exist. Open the dialog, fill a date, event, discipline, score and medal, submit, and assert the card appears.

```tsx
expect(screen.getByRole('heading', { name: 'Здесь будут твои победы' })).toBeVisible()
await user.click(screen.getByRole('button', { name: 'Добавить достижение' }))
await user.type(screen.getByLabelText('Соревнование или событие'), 'Кубок Федерации')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/features/achievements/AchievementsPage.test.tsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement the form and page**

Use the project’s `Dialog`, `AlertDialog`, `Button`, `Input` and `Label` components. Set the date input maximum from local date components. Render conditional custom-discipline input. Keep all form errors as clear text. Use `progress.webp` in an `object-contain` frame. In populated state render the compact «Твои достижения» header, three filtered summaries, search, discipline filter and timeline.

- [ ] **Step 4: Implement cards, comparison and editing controls**

Render medal labels alongside visual treatment. Use green for an increased score, red for a decreased score, and muted neutral treatment for an equal score. Expose edit and delete actions by accessible names. Delete only after confirmation.

- [ ] **Step 5: Run the page test to verify it passes**

Run: `npm test -- src/features/achievements/AchievementsPage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Extend page tests for chronology and edit/delete behavior**

Seed records in reverse entry order with different performance dates. Assert newest performance appears first, a later combo gets expected up/down copy, opening edit changes the existing card rather than duplicating it, and deletion confirmation removes only that record.

- [ ] **Step 7: Run focused UI tests and commit**

Run: `npm test -- src/features/achievements/AchievementsPage.test.tsx`

Expected: PASS.

```bash
git add src/features/achievements/AchievementForm.tsx src/features/achievements/AchievementCard.tsx src/features/achievements/AchievementsPage.tsx src/features/achievements/AchievementsPage.test.tsx
git commit -m "feat: add achievements timeline"
```

### Task 3: Navigation, application integration and local backup

**Files:**
- Modify: `src/app/routes.ts`
- Modify: `src/app/layouts/AppShell.tsx`
- Modify: `src/app/layouts/AppShell.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/lib/user-data.ts`
- Modify: `src/lib/user-data.test.ts`
- Modify: `src/features/settings/SettingsPage.tsx`
- Modify: `src/features/settings/SettingsPage.test.tsx`

**Interfaces:**
- Extends `RouteName` and `PrimaryRouteName` with `achievements`.
- Extends user backup `UserDataExport` to `version: 2` and `achievements: Achievement[]`.
- Settings export gets achievements from the store; local deletion calls achievement `clear()`.

- [ ] **Step 1: Write failing integration tests**

Update shell tests to expect a labelled «Достижения» mobile link and add a test that exported JSON has `version: 2` and the achievement records. Extend settings test setup with one achievement and assert the exported payload captures it; verify deletion clears its namespaced key while retaining a foreign localStorage key.

- [ ] **Step 2: Run integration tests to verify they fail**

Run: `npm test -- src/app/layouts/AppShell.test.tsx src/lib/user-data.test.ts src/features/settings/SettingsPage.test.tsx`

Expected: FAIL because route and export integration are absent.

- [ ] **Step 3: Wire the feature through the app**

Add `achievements` to routes, map it to Lucide `Trophy`, change mobile navigation to four equal columns, route the app to `AchievementsPage`, pass the store list to export serialization, and clear only achievement data in Settings deletion.

- [ ] **Step 4: Run integration tests to verify they pass**

Run: `npm test -- src/app/layouts/AppShell.test.tsx src/lib/user-data.test.ts src/features/settings/SettingsPage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes.ts src/app/layouts/AppShell.tsx src/app/layouts/AppShell.test.tsx src/app/App.tsx src/lib/user-data.ts src/lib/user-data.test.ts src/features/settings/SettingsPage.tsx src/features/settings/SettingsPage.test.tsx
git commit -m "feat: integrate achievements into app data"
```

### Task 4: End-to-end and responsive verification

**Files:**
- Create: `e2e/achievements.spec.ts`
- Modify: `e2e/ideas.spec.ts` only if shared fixture extraction is needed.

**Interfaces:**
- Test seeds `sinhronica:athlete-profile:v2` before navigation and uses public route labels.

- [ ] **Step 1: Write a failing Playwright flow**

At the production subpath, navigate to «Достижения», add a March combo result, then an April combo result, then a January figures result. Assert April is first, its score change references March, reload and see all entries. Edit April’s score, delete the figures record through confirmation, and assert no horizontal overflow at 320×568 and 390×844.

- [ ] **Step 2: Run the E2E test to verify it fails**

Run: `npm run test:e2e -- e2e/achievements.spec.ts`

Expected: FAIL until the route and UI are fully integrated.

- [ ] **Step 3: Make only test-discovered fixes**

Correct labels, focus behavior, layout and persistence issues found by the flow. Do not expand feature scope.

- [ ] **Step 4: Run focused E2E and visual checks**

Run: `npm run test:e2e -- e2e/achievements.spec.ts`

Expected: PASS.

Use the browser at 320×568 and 390×844 to inspect both empty and populated states. Confirm the mascot is uncropped, the fourth navigation label is readable and `scrollWidth === clientWidth`.

- [ ] **Step 5: Commit**

```bash
git add e2e/achievements.spec.ts e2e/ideas.spec.ts
git commit -m "test: cover achievements flow"
```

### Task 5: Full verification and delivery

**Files:**
- Modify only files required to repair verified failures.

- [ ] **Step 1: Run all required checks**

```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
VITE_BASE_PATH=Sinhronica npm run build
git diff --check
```

Expected: every command exits 0. Confirm generated service worker precaches `progress.webp` and all static assets needed for offline display.

- [ ] **Step 2: Request code review**

Ask a fresh reviewer to inspect the diff from `origin/main` for Critical or Important issues in local-data safety, chronology comparison, deletion scope, accessibility and mobile layout. Fix every validated Critical/Important finding, then rerun the affected checks.

- [ ] **Step 3: Merge, publish and verify production**

Fast-forward merge the reviewed feature branch into `main`, push, wait for the Pages workflow to succeed, then verify the deployed app: open `#achievements` at 390 px with a local athlete profile, add a result, confirm `object-fit: contain` mascot behavior and no overflow.

- [ ] **Step 4: Clean up the feature worktree**

After production verification, remove only this feature worktree and its merged local branch. Leave unrelated worktrees untouched.
