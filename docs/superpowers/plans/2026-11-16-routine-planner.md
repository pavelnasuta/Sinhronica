# Routine Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the empty «Номера» screen with local, editable routine cards and timed structure blocks for athletes.

**Architecture:** A validated routine domain module owns record and block normalization. A Zustand store persists only valid records in local storage. The routines feature renders a list, a routine detail screen, and accessible dialogs for the card and ordered blocks; it never uses figure data or presents the manual total as official declared difficulty.

**Tech Stack:** React, TypeScript, Zustand, Vitest, React Testing Library, Playwright, existing shadcn-style UI.

**Spec:** `docs/superpowers/specs/2026-11-16-routine-planner-design.md`

## Global Constraints

- Keep all routine data in local storage; do not add a backend, account, tracking, cloud sync, audio storage, or media upload.
- Keep routine plans separate from figures and programs scoring.
- Label the manually summed element values only as «Черновая сложность».
- Add routines to manual export and scoped deletion; do not delete foreign local-storage keys.
- Preserve mobile usability at 320×568 and 390×844 without horizontal overflow.

---

### Task 1: Routine domain and local store

**Files:**
- Create: `src/features/routines/routine-types.ts`
- Create: `src/features/routines/routine-utils.ts`
- Create: `src/features/routines/routine-utils.test.ts`
- Create: `src/stores/routines-store.ts`
- Create: `src/stores/routines-store.test.ts`

**Interfaces:**
- Produces `Routine`, `RoutineDraft`, `RoutineBlock`, `RoutineBlockDraft`, `normalizeRoutineDraft`, `normalizeRoutineBlockDraft`, `formatRoutineTime`, `calculateDraftDifficulty`, and `useRoutinesStore`.
- `useRoutinesStore` exposes `routines`, `storageStatus`, `create`, `update`, `remove`, `hydrate`, and `clear`.

- [ ] **Step 1: Write failing normalization tests**

```ts
expect(normalizeRoutineDraft(validDraft)).toMatchObject({ title: 'Лазурь', activeAthleteCount: 8 })
expect(normalizeRoutineBlockDraft({ type: 'element', title: 'Гибрид', manualDifficulty: 3.2 })).toMatchObject({ manualDifficulty: 3.2 })
expect(normalizeRoutineBlockDraft({ type: 'transition', title: 'Переход', manualDifficulty: 3.2 })?.manualDifficulty).toBeUndefined()
expect(normalizeRoutineBlockDraft({ type: 'element', title: 'X', startSecond: 30, endSecond: 20 })).toBeNull()
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- src/features/routines/routine-utils.test.ts`

- [ ] **Step 3: Implement normalization and formatting**

Use a bounded `RoutineDiscipline`, `RoutineProgramType`, `RoutineContext`, and `RoutineBlockType`; normalize strings, comma-separated athlete names, optional nonnegative integers for seconds, and optional nonnegative manual difficulty only for `element` blocks. Implement `calculateDraftDifficulty` as the exact sum of manual element values and `formatRoutineTime(75)` as `1:15`.

- [ ] **Step 4: Implement the store and tests**

Persist under `sinhronica:routines:v1`. Reject corrupted arrays or semantically invalid records during hydration, use the established `ready`/`unsaved`/`recovered` status convention, and verify CRUD, block order persistence, hydrate, and scoped clear.

- [ ] **Step 5: Run focused unit tests**

Run: `npm test -- src/features/routines/routine-utils.test.ts src/stores/routines-store.test.ts`

### Task 2: Routine list and editable card UI

**Files:**
- Create: `src/features/routines/RoutineForm.tsx`
- Create: `src/features/routines/RoutineCard.tsx`
- Create: `src/features/routines/RoutineForm.test.tsx`
- Modify: `src/features/routines/RoutinesPage.tsx`
- Modify: `src/features/routines/RoutinesPage.test.tsx`

**Interfaces:**
- Consumes the Task 1 store and draft types.
- Produces list creation, detail selection, editing, and confirmed deletion flows.

- [ ] **Step 1: Write failing UI tests**

Test the empty state’s `Создать номер` action; create a card with title, context, discipline/type, age group and active count; verify title and metadata in the list; verify required-field feedback; open edit and update the title; open deletion confirmation and remove it.

- [ ] **Step 2: Run the focused page test and verify failure**

Run: `npm test -- src/features/routines/RoutinesPage.test.tsx`

- [ ] **Step 3: Implement list and card form**

Replace the placeholder screen with a hydrated routine list. Reuse the existing accessible dialog and form primitives. Keep an explicit note that the plan is local and is not an official coach card. Make edit and delete actions keyboard accessible and require a confirmation before deletion.

- [ ] **Step 4: Run focused UI tests**

Run: `npm test -- src/features/routines/RoutineForm.test.tsx src/features/routines/RoutinesPage.test.tsx`

### Task 3: Routine detail and timed structure blocks

**Files:**
- Create: `src/features/routines/RoutineDetailPage.tsx`
- Create: `src/features/routines/RoutineBlockForm.tsx`
- Create: `src/features/routines/RoutineDetailPage.test.tsx`
- Modify: `src/app/routes.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Adds a hidden detail route `#routine/<id>` or equivalent safe route-state representation with back-navigation to `#routines`.
- Consumes `RoutineBlockDraft`, routine update, `formatRoutineTime`, and `calculateDraftDifficulty`.

- [ ] **Step 1: Write failing detail tests**

Test adding `element`, `formation`, `transition`, and `note` blocks; test an element with manual difficulty contributes to `Черновая сложность`; test a non-element does not expose manual difficulty; test move-up/move-down changes render order; test block deletion requires confirmation.

- [ ] **Step 2: Run the focused detail test and verify failure**

Run: `npm test -- src/features/routines/RoutineDetailPage.test.tsx`

- [ ] **Step 3: Implement detail view and block dialog**

Render routine metadata, target duration, general note, `Черновая сложность`, and an ordered timeline. Use `м:с` display for block times. Add, edit, move, and delete blocks with buttons rather than drag-and-drop. Explicitly state that the total is manually entered and not an official declared difficulty.

- [ ] **Step 4: Run detail tests**

Run: `npm test -- src/features/routines/RoutineDetailPage.test.tsx`

### Task 4: Backup, deletion, route integration, and end-to-end verification

**Files:**
- Modify: `src/lib/user-data.ts`
- Modify: `src/lib/user-data.test.ts`
- Modify: `src/features/settings/SettingsPage.tsx`
- Modify: `src/features/settings/SettingsPage.test.tsx`
- Modify: `e2e/useful-and-routines.spec.ts` or create `e2e/routines.spec.ts`

**Interfaces:**
- Raises user-data export to version 4 and serializes `routines`.
- Settings hydrates routine records before export and clears their key in the existing full-data removal flow.

- [ ] **Step 1: Write failing export and settings tests**

Assert version 4 output contains a routine with an element block, settings hydration brings a stored routine into the backup state, and complete data removal clears only `sinhronica:routines:v1` while preserving a foreign key.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- src/lib/user-data.test.ts src/features/settings/SettingsPage.test.tsx`

- [ ] **Step 3: Implement export/delete integration**

Use the existing profile, achievements, ideas, and figure-progress export/hydration conventions; do not add restore/import.

- [ ] **Step 4: Add and run mobile E2E**

Create a routine, add timed blocks and manual difficulty, reload to prove persistence, edit and delete it, and assert no horizontal overflow at 390×844.

Run: `npm run test:e2e -- e2e/routines.spec.ts`

### Task 5: Completion gate

**Files:**
- Review all modified routine files and tests.

- [ ] **Step 1: Run the full quality gate**

Run:
```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
VITE_BASE_PATH=Sinhronica npm run build
git diff --check
```

- [ ] **Step 2: Perform manual mobile QA**

Open the list, empty state, form, populated detail, block controls, and delete confirmation at 320×568 and 390×844. Verify all controls are reachable, the bottom navigation remains usable, and no horizontal overflow appears.

- [ ] **Step 3: Review and publish**

Request independent Critical/Important review; fix valid findings; rerun the gate. Commit, fast-forward into `main`, push, wait for GitHub Pages, and verify the published routine list and detail path.
