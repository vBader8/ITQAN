# Architecture

## Folder structure

```
src/
  app/[locale]/              # Next.js App Router routes, locale-prefixed
    (marketing)/             # public landing page
    (auth)/login, (auth)/signup
    (app)/dashboard, (app)/quran, (app)/quran/[surah]
    layout.tsx                # the real root layout (html/body/fonts/providers)
  design-system/
    tokens.css                # color/spacing/radius/shadow/type tokens
    components/                # Button, Card, Input, Skeleton, EmptyState, ...
  features/
    quran/                     # api.ts (external content), queries.ts (our DB
                                # reads), actions.ts (our DB writes), components/
    tafsir/                     # api.ts (external content), actions.ts (lazy
                                # per-ayah fetch), components/tafsir-panel.tsx
    auth/                       # actions.ts (Supabase auth), components/
  components/layout/           # site header, locale switcher, user menu
  i18n/                         # next-intl routing/navigation/request config
  lib/
    supabase/                   # server/client/middleware Supabase clients
    utils.ts                    # cn() class-merging helper
  messages/en.json, ar.json     # translation catalogs
supabase/migrations/            # SQL schema + RLS policies
tests/unit/, tests/e2e/
```

Routes, components, and data access are organized **by feature**
(`features/quran`, `features/auth`), not by technical layer — each
feature owns its API/query/action/component code. `design-system/` holds
only generic, feature-agnostic UI primitives.

## Key decisions

### Quran content

Quran text and translations are fetched from the
[Quran.com API](https://api-docs.quran.com/) at request time (with a
24h cache) rather than seeded into our own database. The Uthmani script is
sacred text — we should not own transcription risk for it, and quran.com
already maintains a vetted, versioned source. Our database only stores
user-generated data: profile, bookmarks, and reading progress.

`src/features/quran/api.ts` validates every response against a Zod schema
and throws `QuranApiError` on a bad status or unexpected shape, so a schema
drift in the upstream API fails loudly instead of silently rendering wrong
verses. The base URL is configurable via `QURAN_API_BASE_URL` (used in this
repo to point at a local mock during development, since this sandbox's
outbound network is restricted to an allowlist that excludes
`api.quran.com`).

### Tafsir

Tafsir (commentary) follows the exact same pattern as Quran text:
`src/features/tafsir/api.ts` fetches from the Quran.com tafsir endpoint,
validates the response with Zod, and throws `TafsirApiError` on failure.
It defaults to Tafsir Ibn Kathir (abridged, English) via a single named
constant (`DEFAULT_TAFSIR_RESOURCE_ID`) — swap it in one place, or extend
`getTafsir` to accept a resource id, once multiple tafsirs are needed.

Unlike verse text/translation (fetched once per surah on the server),
tafsir is fetched **lazily per ayah** on demand — it's much longer than a
translation, and most readers won't expand it for every verse. The reader
exposes a "Tafsir" toggle per ayah (`features/tafsir/components/
tafsir-panel.tsx`) backed by a server action (`getTafsirAction`), with its
own loading skeleton and inline retry on failure, mirroring the bookmark
button's error handling.

### i18n and RTL

English and Arabic are supported from the start via `next-intl`, with
`localePrefix: "always"` (`/en/...`, `/ar/...`). The `<html dir>` attribute
switches per locale, and layout code uses logical CSS properties
(`ps-*`/`pe-*`/`start-*`/`end-*`, `rtl:`/`ltr:` variants) instead of
`left`/`right` so the UI mirrors correctly. Quran verse text is always
rendered `dir="rtl"` regardless of UI locale, since Arabic script is
inherently RTL independent of the interface language.

Mixed-direction content (e.g. "1. Al-Fatihah" — a Latin/numeral heading
inside an Arabic-locale page) needs an explicit `dir="ltr"` wrapper, or the
browser's bidi algorithm will reorder it visually. See
`app/[locale]/(app)/quran/[surah]/page.tsx` for an example.

### Design system

`src/design-system/tokens.css` defines the only source of color, spacing,
radius, shadow, and type-scale values, as CSS custom properties consumed by
Tailwind's `@theme inline` block in `globals.css`. Components never
hardcode colors or spacing — they use the generated Tailwind utilities
(`bg-primary`, `rounded-lg`, `shadow-sm`, etc.), which resolve through the
tokens and automatically respect light/dark mode
(`prefers-color-scheme` + a `data-theme` override for manual toggling).

Component primitives (`design-system/components/`) are hand-built on Radix
UI + CVA rather than generated via the `shadcn` CLI, because this sandbox's
network policy blocks `ui.shadcn.com`. They follow the same conventions
shadcn/ui uses (so migrating to the CLI later is a non-event).

### Auth

Supabase email/password auth via `@supabase/ssr`. `src/proxy.ts` (Next 16
renamed `middleware.ts` → `proxy.ts`) refreshes the session cookie and
handles locale routing on every request. A Postgres trigger
(`on_auth_user_created` in `supabase/migrations/0001_init.sql`) creates a
matching `profiles` row whenever a new `auth.users` row appears.

### Reading progress

`src/features/quran/hooks/use-reading-progress.ts` uses an
`IntersectionObserver` to track the highest verse scrolled into view and
persists it (debounced, signed-in users only) so the dashboard's "continue
reading" card can resume near where the user left off.

## Out of scope for this milestone

- Vercel deployment (the app is deploy-ready; no live project was created
  yet — see the session notes for why).
- Tafsir, Hadith, Seerah, Fiqh, Aqeedah, learning paths, AI assistant,
  courses, exams, certificates, gamification, community, and the admin
  portal — each is a focused milestone on top of this foundation, not an
  extension bolted onto the Quran reader.
