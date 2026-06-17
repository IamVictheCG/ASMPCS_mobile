# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Expo SDK Version

**Always read the versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo-related code.** APIs change significantly between SDK versions — do not assume prior knowledge is current.

## Commands

```bash
npx expo start              # Start dev server (Metro bundler)
npx expo start --web        # Start for web browser
npx expo start --android    # Start for Android (Expo Go or dev client)
npx expo start --ios        # Start for iOS
npx tsc --noEmit            # TypeScript checking (no test or lint scripts configured)
```

EAS Build (requires `eas-cli`):
```bash
eas build --profile development --platform android
eas build --profile preview --platform android   # Produces APK
eas build --profile production --platform android
```

## Project Architecture

**React Native / Expo SDK 56** app for the ASMPCS aviation workers' cooperative (Nigeria). Two portals — member and admin — with Supabase backend for auth and data.

### Backend & Data Layer

**Supabase** is the backend. Auth uses `supabase.auth` (email/password); member login resolves Staff ID → email via a `SECURITY DEFINER` RPC before authenticating. Session tokens are stored in `expo-secure-store` on native, in-memory on web.

Environment variables (must be set in `.env` or EAS secrets):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**API switchover pattern**: `src/api/index.ts` re-exports from `./mock`. To go live, change the import to `./real`. The `USE_MOCK` flag is exported for conditional logic. All hooks in `src/hooks/` use **React Query** (`@tanstack/react-query`) and call functions from `src/api/`.

Database schema lives in `supabase/migrations/` (001–005). TypeScript row types are hand-maintained in `src/types/database.ts` (comment at top has the `supabase gen types` command for auto-generation).

### Auth Flow

`AuthContext` (`src/context/AuthContext.tsx`) wraps the app. Key behaviors:
- **Member login**: Staff ID → RPC `get_email_by_staff_id` → `signInWithPassword`. Blocks `pending` and `suspended` members post-login.
- **Admin login**: email/password, then checks `user_metadata.role === 'admin'`.
- **Registration**: `useRegistration` hook calls `verify_member_for_registration` RPC, then `signUp`, then `link_auth_to_member` RPC. User is signed out after — must wait for admin activation.
- **Role derivation**: `app_metadata.role` on the Supabase user object.

Layout groups enforce auth: `app/(member)/_layout.tsx` redirects to `/member-login` if unauthenticated; `app/(admin)/_layout.tsx` does the same for admin.

### Routing

**expo-router v4** (file-based). Two route groups:

- `app/(member)/` — Member portal (teal/mint theme)
- `app/(admin)/` — Admin portal (crimson/red theme)

Entry flow: `app/index.tsx` (portal selector) → `app/member-login.tsx` or `app/admin-login.tsx` → respective route group.

Additional top-level screens: `member-register.tsx`, `registration-success.tsx`, `forgot-password.tsx`, `member-setup.tsx`.

TypeScript path alias: `@/*` maps to project root (configured in `tsconfig.json`).

### Navigation

Sidebar navigation is implemented as a **mobile drawer overlay** via `DrawerContext` (`src/context/DrawerContext.tsx`), not a persistent flex child. `MemberSidebar` and `AdminSidebar` render as overlays toggled by the topbar hamburger. The topbar (`AppTopbar`) sits outside ScrollView so it stays fixed.

### Styling

**Inline `style` props using design tokens are the primary approach.** NativeWind v4 is configured but rarely used because gradient colors, rgba surfaces, and shadow configs can't be expressed as Tailwind classes. Never use React Native's `StyleSheet` API.

Design token source of truth: `src/theme/tokens.ts` — exports `Colors`, `Surfaces`, `Gradients`, `BadgeColors`, `Spacing`, `Radii`, `FontSize`, `Fonts`, `Shadows`. Import from here, never hardcode values.

### Fonts

Three families loaded in `app/_layout.tsx`:
- **Playfair Display** (700Bold, 600SemiBold) — headings
- **DM Sans** (400Regular, 500Medium, 600SemiBold) — body text, UI labels
- **DM Mono** (400Regular, 500Medium) — **all financial figures, IDs, dates, references**

Use `Fonts.*` from tokens: `playfair`, `playfairSemibold`, `sans`, `sansMedium`, `sansSemibold`, `mono`, `monoMedium`.

### Gradients

CSS `linear-gradient` doesn't exist in React Native. Use `expo-linear-gradient`'s `<LinearGradient>` with `colors` from `Gradients.*` in tokens.

### Form Validation

Forms use **react-hook-form** + **zod** (v4). See `member-login.tsx` and `member-register.tsx` for patterns.

### Provider Stack

Root layout (`app/_layout.tsx`) nests providers in this order:
`SafeAreaProvider` → `AuthProvider` → `QueryClientProvider` → `DrawerProvider` → `Stack`

### Component Library (`src/components/`)

Shared UI primitives — always prefer these over custom implementations:

| Component | Purpose |
|---|---|
| `ui/Badge` | Status pills — variants: `credit, debit, pending, approved, rejected, active, inactive, repaying, overdue, disbursed` |
| `ui/Button` | Pressable buttons — variants: `primary, admin-primary, ghost, approve, reject, view, edit, danger` |
| `ui/Card` + `CardHeader` + `CardBody` | Glass-surface container with optional header and padded body (`noPad` prop for tables) |
| `ui/ProgressBar` | Thin fill bar — variants: `teal, gold, green, red` |
| `ui/SectionTitle` | Playfair heading with 3px vertical accent bar — `portal` prop switches mint vs red |
| `ui/StatCard` | Metric card with 3px top accent bar, emoji icon, DM Mono value |
| `ui/Modal` | Full-screen overlay with dark backdrop |
| `ui/Skeleton` | Loading placeholder |
| `FormInput` | Labeled `TextInput`; also exports `InfoRow` for label+value display rows |
| `Toast` | Positioned toast notification — use `useToast()` hook |
| `ScreenError` | Error state display |
| `DataTable` + `Pagination` | Horizontal-scrollable data table with typed columns |
| `FilterChips` | Horizontal scrollable pill filter bar |
| `ChartBars` | Simple proportional bar chart |
| `ActivityFeed` | Colored dot + text + timestamp feed items |
| `TransactionList` | Icon + title + amount row list |

### Visual Design Rules

- **Member portal**: teal (`#1565A8`) / mint (`#00C6D8`) accents on dark navy (`#0D2340`)
- **Admin portal**: crimson (`#8B1A1A`) / red (`#C0392B`) accents on darker navy (`#0A1E36`)
- Financial figures → DM Mono, Section headings → Playfair Display, Body text/labels/nav → DM Sans

### React Native Constraints

- `position: fixed` → not supported; topbar sits outside ScrollView, sidebar is a drawer overlay
- `backdrop-filter: blur` → approximate with dark semi-transparent `backgroundColor`
- CSS `::before`/`::after` → `position: 'absolute'` View children
- CSS Grid → `flexDirection: 'row'` with `flex: 1` or fixed widths + `gap`
