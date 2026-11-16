# Profile Settings and Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a personal profile header and a local-first settings surface with data controls, sharing and feedback.

**Architecture:** Keep the three primary app routes unchanged and add a service settings route selected by the hash. A small data-management module produces versioned JSON and clears only Sinhronica keys. The settings feature owns profile editing, theme selection, sharing, confirmation and static author/contact content; `AppShell` remains a layout component.

**Tech Stack:** React, TypeScript, Zustand, Zod, Tailwind, Radix AlertDialog, Web Share API, Canvas API, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-profile-settings-sharing-design.md`

## Global Constraints

- Keep all athlete and idea data local; do not add a server, account, analytics or tracker.
- Keep gold reserved for achievements; rank chips use cyan, blue, indigo and violet with text labels.
- Preserve existing `sinhronica:*` key isolation and semantically validate the athlete profile before using it.
- Every destructive action needs a confirmation dialog and must only remove Sinhronica data.
- Share card copy is exactly: `Плыви к своим целям в своём ритме 🌊`.
- Feedback destination is exactly `https://t.me/pavelnasuta`.
- All mobile controls are at least 44 px and 390 px has no horizontal overflow.

---

### Task 1: Add rank presentation and profile-header navigation

**Files:**
- Create: `src/features/profile/sport-rank-badge.tsx`
- Create: `src/features/profile/sport-rank-badge.test.tsx`
- Modify: `src/app/routes.ts`
- Modify: `src/app/layouts/AppShell.tsx`
- Modify: `src/app/layouts/AppShell.test.tsx`

**Interfaces:**
- Consumes: `AthleteProfile` from `src/stores/athlete-profile-store.ts`.
- Produces: `SportRankBadge({ rank: AthleteProfile['sportRank'] })` and route name `'settings'` available to `App` but excluded from primary navigation.

- [ ] **Step 1: Write failing badge and header tests**

```tsx
it('maps each rank group to a readable non-gold tag', () => {
  render(<SportRankBadge rank="КМС" />)
  expect(screen.getByText('КМС')).toHaveClass('bg-violet-500')
})

it('shows profile information and a settings control instead of the logo', () => {
  render(<AppShell activeRoute="home" athleteProfile={profile} onNavigate={vi.fn()}>content</AppShell>)
  expect(screen.getByText('Алина')).toBeVisible()
  expect(screen.getByText('дельфиник')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Настройки' })).toHaveAttribute('href', '#settings')
  expect(screen.queryByRole('link', { name: /Синхроника, перейти/ })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm run test -- src/features/profile/sport-rank-badge.test.tsx src/app/layouts/AppShell.test.tsx`

Expected: FAIL because `SportRankBadge`, `athleteProfile` prop and `settings` navigation are absent.

- [ ] **Step 3: Implement the badge and header**

```tsx
const rankClass = rank === 'дельфиник'
  ? 'border-cyan-300/35 bg-cyan-400/15 text-cyan-100'
  : rank.includes('юношеский')
    ? 'border-blue-300/35 bg-blue-500/15 text-blue-100'
    : ['КМС', 'МС', 'МСМК'].includes(rank)
      ? 'border-violet-300/35 bg-violet-500/15 text-violet-100'
      : 'border-indigo-300/35 bg-indigo-500/15 text-indigo-100'
```

Pass a complete athlete profile into `AppShell`. Replace the brand link and theme control with a left-aligned name/tag block and a 44 px `Settings` icon link. Add `'settings'` to `RouteName`, but filter it out of desktop and mobile primary navigation.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm run test -- src/features/profile/sport-rank-badge.test.tsx src/app/layouts/AppShell.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/profile/sport-rank-badge.tsx src/features/profile/sport-rank-badge.test.tsx src/app/routes.ts src/app/layouts/AppShell.tsx src/app/layouts/AppShell.test.tsx
git commit -m "feat: show athlete profile in app header"
```

### Task 2: Add versioned full-data export and scoped local deletion

**Files:**
- Create: `src/lib/user-data.ts`
- Create: `src/lib/user-data.test.ts`
- Modify: `src/stores/athlete-profile-store.ts`
- Modify: `src/stores/ideas-store.ts`
- Modify: `src/stores/preferences-store.ts`

**Interfaces:**
- Consumes: `AthleteProfile`, `Idea[]`, `ThemePreference`.
- Produces: `serializeUserData({ profile, ideas, theme }): string`, `downloadUserData(payload): void`, and store `clear()` methods that remove only each store's own key.

- [ ] **Step 1: Write failing export and deletion tests**

```ts
it('serializes a versioned local backup without non-Sinhronica data', () => {
  expect(JSON.parse(serializeUserData({ profile, ideas: [], theme: 'dark' }))).toMatchObject({
    version: 1,
    profile,
    ideas: [],
    preferences: { theme: 'dark' },
  })
})

it('clears only the athlete profile key', () => {
  window.localStorage.setItem('other-product:key', 'keep')
  useAthleteProfileStore.getState().clear()
  expect(window.localStorage.getItem('other-product:key')).toBe('keep')
  expect(useAthleteProfileStore.getState().profile).toBeNull()
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm run test -- src/lib/user-data.test.ts src/stores/athlete-profile-store.test.ts`

Expected: FAIL because serializer and clear methods are missing.

- [ ] **Step 3: Implement versioned data management**

```ts
export type UserDataExport = {
  version: 1
  exportedAt: string
  profile: AthleteProfile
  ideas: Idea[]
  preferences: { theme: ThemePreference }
}

export function serializeUserData(data: Omit<UserDataExport, 'version' | 'exportedAt'>) {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2)
}
```

Export the athlete and store key constants where needed. Add `clear(): void` to athlete, ideas and preferences stores. Each removes only its specific `sinhronica:*` key and resets in-memory state. The browser download uses a JSON Blob, an object URL and a temporary `<a download="sinhronica-data.json">`.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm run test -- src/lib/user-data.test.ts src/stores/athlete-profile-store.test.ts src/stores/ideas-store.test.ts src/stores/preferences-store.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/user-data.ts src/lib/user-data.test.ts src/stores/athlete-profile-store.ts src/stores/athlete-profile-store.test.ts src/stores/ideas-store.ts src/stores/ideas-store.test.ts src/stores/preferences-store.ts src/stores/preferences-store.test.ts
git commit -m "feat: add local data backup and clearing"
```

### Task 3: Build settings feature with profile controls and account sections

**Files:**
- Create: `src/features/settings/SettingsPage.tsx`
- Create: `src/features/settings/SettingsPage.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: all three stores, `formatLocalDate`, `isValidBirthDate`, `SPORT_RANKS`, `serializeUserData`, `downloadUserData`, `SportRankBadge`.
- Produces: `SettingsPage({ onBack: () => void })`.

- [ ] **Step 1: Write failing settings interaction tests**

```tsx
it('updates the athlete profile and exposes the existing theme options', async () => {
  render(<SettingsPage onBack={vi.fn()} />)
  await user.clear(screen.getByLabelText('Как тебя зовут?'))
  await user.type(screen.getByLabelText('Как тебя зовут?'), 'Маша')
  await user.selectOptions(screen.getByLabelText('Спортивный разряд'), 'КМС')
  await user.click(screen.getByRole('button', { name: 'Сохранить профиль' }))
  expect(useAthleteProfileStore.getState().profile).toMatchObject({ name: 'Маша', sportRank: 'КМС' })
  expect(screen.getByLabelText('Тема оформления')).toHaveValue('system')
})

it('keeps data until the deletion confirmation is accepted', async () => {
  render(<SettingsPage onBack={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Удалить данные с устройства' }))
  await user.click(screen.getByRole('button', { name: 'Отмена' }))
  expect(useAthleteProfileStore.getState().profile).not.toBeNull()
  await user.click(screen.getByRole('button', { name: 'Удалить данные с устройства' }))
  await user.click(screen.getByRole('button', { name: 'Удалить мои данные' }))
  expect(useAthleteProfileStore.getState().profile).toBeNull()
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm run test -- src/features/settings/SettingsPage.test.tsx`

Expected: FAIL because `SettingsPage` is missing.

- [ ] **Step 3: Implement settings sections**

Create a single scrollable mobile-first page with: back button, profile form, theme select, data backup explanation plus export button, separate destructive confirmation dialog, author names, and a link to `https://t.me/pavelnasuta` with link text `Предложить доработку`. Task 4 adds the `ShareAppCard` to this page. On successful deletion, call `onBack`; `App` must see the null profile and display onboarding. Route `#settings` renders this page without bottom navigation.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm run test -- src/features/settings/SettingsPage.test.tsx src/app/App.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/settings/SettingsPage.tsx src/features/settings/SettingsPage.test.tsx src/app/App.tsx
git commit -m "feat: add local-first athlete settings"
```

### Task 4: Generate and share the Acqui preview card

**Files:**
- Create: `src/features/sharing/share-app.ts`
- Create: `src/features/sharing/share-app.test.ts`
- Create: `src/features/sharing/ShareAppCard.tsx`
- Modify: `src/features/settings/SettingsPage.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `public/onboarding/practice.webp`, `public/icons/sinhronica-v1-icon-512.png`, the public app URL `https://nasuta.ru/Sinhronica/`.
- Produces: `createShareImage(): Promise<File>`, `shareApplication(): Promise<'shared' | 'copied'>`, and `ShareAppCard`.

- [ ] **Step 1: Write failing share tests**

```ts
it('uses the native share sheet with an image when file sharing is supported', async () => {
  Object.assign(navigator, { share: vi.fn().mockResolvedValue(undefined), canShare: vi.fn().mockReturnValue(true) })
  await expect(shareApplication()).resolves.toBe('shared')
  expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({ files: [expect.any(File)] }))
})

it('copies the public app URL when native file sharing is unavailable', async () => {
  Object.assign(navigator, { share: undefined })
  await expect(shareApplication()).resolves.toBe('copied')
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://nasuta.ru/Sinhronica/')
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm run test -- src/features/sharing/share-app.test.ts`

Expected: FAIL because sharing helpers are missing.

- [ ] **Step 3: Implement the preview image and sharing fallback**

Load the existing Acqui `practice.webp` and the 512 px PWA icon through same-origin URLs, draw them on a 1200×630 canvas with dark blue/indigo background, `Синхроника`, `Плыви к своим целям в своём ритме 🌊`, then encode `image/png` as `sinhronica-share.png`. The share payload must include title, text, URL and `files` only when `navigator.canShare({ files })` is true. Otherwise write the URL to clipboard and return `copied`. Render a settings card with the actual Acqui illustration and an accessible primary action; announce `Ссылка скопирована` after fallback.

Add Open Graph/Twitter metadata pointing at a generated static 1200×630 preview only if a deterministic static export is created in this task; do not publish relative crawler paths.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm run test -- src/features/sharing/share-app.test.ts src/features/settings/SettingsPage.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/sharing/share-app.ts src/features/sharing/share-app.test.ts src/features/sharing/ShareAppCard.tsx src/features/settings/SettingsPage.tsx index.html
git commit -m "feat: share Sinhronica with an Acqui preview"
```

### Task 5: Browser coverage, visual QA and release

**Files:**
- Modify: `e2e/ideas.spec.ts`
- Create: `e2e/settings.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: profile seed stored at `sinhronica:athlete-profile:v2` and production subpath `/Sinhronica/`.
- Produces: browser evidence for settings, profile display, deletion guard, export and share fallback.

- [ ] **Step 1: Write failing browser settings scenario**

```ts
test('edits the profile from settings without overflowing a phone viewport', async ({ page }) => {
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Настройки' }).click()
  await page.getByLabel('Спортивный разряд').selectOption('КМС')
  await page.getByRole('button', { name: 'Сохранить профиль' }).click()
  await expect(page.getByText('КМС')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true)
})
```

- [ ] **Step 2: Run the browser scenario and confirm failure**

Run: `npm run test:e2e -- e2e/settings.spec.ts`

Expected: FAIL because settings navigation is missing.

- [ ] **Step 3: Complete E2E coverage and documentation**

Add cases for export download, cancelling and confirming deletion, share fallback copied status, feedback link and author names. Update README privacy section to describe export as a local user-initiated backup and deletion scope.

- [ ] **Step 4: Run complete verification**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
VITE_BASE_PATH=Sinhronica npm run build
git diff --check
```

Expected: all commands pass. Inspect a 390×844 settings screenshot in both themes, a tablet viewport, generated 1200×630 share image, service-worker precache entries for all local share assets, and a production deployment at `https://nasuta.ru/Sinhronica/`.

- [ ] **Step 5: Commit**

```bash
git add e2e/ideas.spec.ts e2e/settings.spec.ts README.md
git commit -m "test: cover settings and sharing workflows"
```
