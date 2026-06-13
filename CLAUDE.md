# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Expo SDK Version

**Always read the versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo-related code.** APIs change significantly between SDK versions — do not assume prior knowledge is current.

## Commands

```bash
npx expo start          # Start dev server (Metro bundler)
npx expo start --web    # Start for web (Expo Go or browser)
npx expo start --android
npx expo start --ios
```

There are no test or lint scripts configured. TypeScript checking:
```bash
npx tsc --noEmit
```

## Project Architecture

This is a **React Native / Expo SDK 56** app for the ASMPCS aviation workers' cooperative (Nigeria). It is a static UI shell with placeholder data — no auth, no API calls.

### Routing

Uses **expo-router v4** (file-based). Two separate layout trees via route groups:

- `app/(member)/` — Member portal (teal/mint accent theme, 240px sidebar)
- `app/(admin)/` — Admin portal (crimson/red accent theme, 248px sidebar)

Each group has its own `_layout.tsx` that renders `<Sidebar> + <LinearGradient><Slot /></LinearGradient>` in a `flexDirection: 'row'` view — this is how the persistent sidebar is achieved without `position: fixed`.

Entry flow: `app/index.tsx` → portal selector → `app/member-login.tsx` or `app/admin-login.tsx` → respective route group.

### Styling

**NativeWind v4** (`className` props) is configured but **inline `style` props using token values are the primary approach** for most components, because gradient colors, rgba surfaces, and shadow configs can't be expressed cleanly as Tailwind classes. Never use React Native's `StyleSheet` API.

Design token source of truth: `src/theme/tokens.ts` — exports `Colors`, `Surfaces`, `Gradients`, `BadgeColors`, `Spacing`, `Radii`, `FontSize`, `Fonts`, `Shadows`. Import from here rather than hardcoding values.

### Fonts

Three families loaded via `useFonts` in `app/_layout.tsx`:
- **Playfair Display** (700Bold, 600SemiBold) — headings and large display text
- **DM Sans** (400Regular, 500Medium, 600SemiBold) — body text and UI labels  
- **DM Mono** (400Regular, 500Medium) — **all financial figures, IDs, dates, references**

Font family names to use: `Fonts.playfair`, `Fonts.playfairSemibold`, `Fonts.sans`, `Fonts.sansMedium`, `Fonts.sansSemibold`, `Fonts.mono`, `Fonts.monoMedium`.

### Gradients

CSS `linear-gradient` doesn't exist in React Native. Use `expo-linear-gradient`'s `<LinearGradient>` with `colors` from `Gradients.*` in tokens. All background gradients, button gradients, and accent bars use this.

### Component Library (`src/components/`)

Shared UI primitives — always prefer these over custom inline implementations:

| Component | Purpose |
|---|---|
| `ui/Badge` | Status pills — variants: `credit, debit, pending, approved, rejected, active, inactive, repaying, overdue, disbursed` |
| `ui/Button` | Pressable buttons — variants: `primary, admin-primary, ghost, approve, reject, view, edit, danger` |
| `ui/Card` + `CardHeader` + `CardBody` | Glass-surface container with optional header and padded body (`noPad` prop for tables) |
| `ui/ProgressBar` | Thin fill bar — variants: `teal, gold, green, red` |
| `ui/SectionTitle` | Playfair heading with 3px vertical accent bar — `portal` prop switches mint (member) vs red (admin) |
| `ui/StatCard` | Metric card with 3px top accent bar, emoji icon, DM Mono value |
| `ui/Modal` | Full-screen overlay with dark backdrop |
| `FormInput` | Labeled `TextInput`; also exports `InfoRow` for label+value display rows |
| `ChartBars` | Simple proportional bar chart using View heights |
| `ActivityFeed` | Colored dot + text + timestamp feed items |
| `TransactionList` | Icon + title + amount row list |
| `FilterChips` | Horizontal scrollable pill filter bar |
| `DataTable` + `Pagination` | Horizontal-scrollable data table with typed columns |

### Navigation Components (`src/navigation/`)

- `AppTopbar` — top bar with title/subtitle; `portal="admin"` switches background; `notifDot` prop adds indicator dot; `roleBadge` shows a crimson admin role pill
- `MemberSidebar` — 240px dark sidebar; uses `usePathname()` for active state; mint left border on active item
- `AdminSidebar` — 248px darker sidebar; crimson left border on active item; red badge variant for pending counts

### Placeholder Data (`src/data/`)

- `src/data/member.ts` — `MEMBER`, `MEMBER_STATS`, `CONTRIBUTION_BARS`, `TRANSACTIONS`, `STATEMENT_ROWS`, `NOTIFICATIONS`, `COMMODITIES`, `COMMODITY_FILTERS`, `DIVIDEND_HISTORY`
- `src/data/admin.ts` — `ADMIN_STATS`, `ADMIN_QUICK_STATS`, `COLLECTION_BARS`, `ACTIVITY_FEED`, `RECENT_DECISIONS`, `LOAN_PIPELINE`, `PENDING_LOANS`, `LOAN_HISTORY`, `GUARANTOR_STATS`, `PENDING_GUARANTORS`, `MEMBERS`, `CONTRIBUTION_STATS`

### Visual Design Rules

- **Member portal**: teal (`#1565A8`) / mint (`#00C6D8`) accents on dark navy (`#0D2340`) background
- **Admin portal**: crimson (`#8B1A1A`) / red (`#C0392B`) accents on darker navy (`#0A1E36`) background  
- Financial figures (amounts, IDs, dates, reference numbers) → DM Mono font always
- Section headings → Playfair Display
- Body text, labels, nav → DM Sans

### Web Patterns That Don't Work in React Native

- `position: fixed` → persistent flex child in `flexDirection: 'row'` parent
- `position: sticky` → not supported; topbar must sit outside ScrollView to stay fixed
- `backdrop-filter: blur` → approximate with dark semi-transparent `backgroundColor`
- CSS `::before`/`::after` pseudo-elements → `position: 'absolute'` View children
- CSS Grid → `flexDirection: 'row'` with `flex: 1` or fixed widths + `gap`
