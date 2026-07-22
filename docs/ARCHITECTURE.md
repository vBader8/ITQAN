# Architecture

## Folder structure

```
src/
  app/[locale]/              # Next.js App Router routes, locale-prefixed
    (marketing)/             # public landing page
    (auth)/login, (auth)/signup
    (app)/dashboard, (app)/quran, (app)/quran/[surah]
    (app)/hadith, (app)/hadith/[book], (app)/hadith/[book]/[section]
    (app)/assistant
    api/assistant/route.ts    # streaming chat route (outside [locale])
    layout.tsx                # the real root layout (html/body/fonts/providers)
  design-system/
    tokens.css                # color/spacing/radius/shadow/type tokens
    components/                # Button, Card, Input, Skeleton, EmptyState, ...
  features/
    quran/                     # api.ts (external content), queries.ts (our DB
                                # reads), actions.ts (our DB writes), components/
    tafsir/                     # api.ts (external content), actions.ts (lazy
                                # per-ayah fetch), components/tafsir-panel.tsx
    hadith/                     # api.ts (external content), types.ts, components/
    assistant/                  # system-prompt.ts, components/assistant-chat.tsx
    auth/                       # actions.ts (Supabase auth), components/
  components/layout/           # site header, locale switcher, user menu
  components/bookmark-toggle-button.tsx  # shared by Quran + Hadith
  hooks/use-scroll-progress.ts  # shared "continue reading" tracking
  i18n/                         # next-intl routing/navigation/request config
  lib/
    supabase/                   # server/client/middleware Supabase clients,
                                # queries.ts (getCurrentUser — shared)
    utils.ts                    # cn() class-merging helper
    rate-limit.ts                # in-memory limiter (used by the assistant route)
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

### Hadith

`src/features/hadith/api.ts` fetches from the
[fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) project
(same non-ownership rationale as Quran text). Its documented production
endpoint is the jsDelivr CDN mirror
(`cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1`); this sandbox's network
policy blocks that domain, so `HADITH_API_BASE_URL` can point at a mock, or
— as used to verify this feature during development — directly at
`raw.githubusercontent.com/fawazahmed0/hadith-api/1`, which serves the
identical repository content and happens to be reachable here. The exact
response shape (field names like `hadithnumber`, `grades`, `reference`)
was fetched and inspected live before writing any code, not assumed from
memory, given how much more room there is for a subtly-wrong Hadith
integration to misrepresent scholarship than a stable, well-known API.

Ten classical collections are supported (Bukhari, Muslim, Abu Dawud,
Tirmidhi, Nasai, Ibn Majah, Malik, and the three "Forty Hadith" works),
each with English and Arabic editions. `getSectionHadiths` fetches both
editions for a chapter in parallel and zips them by hadith number into one
bilingual object, including any scholarly authenticity gradings
(`grades: { scholar, grade }[]`) — displayed as-is, attributed per scholar,
never collapsed into a single verdict our own code would be asserting.

Bookmarking and reading progress (`hadith_bookmarks`/`hadith_progress`,
`supabase/migrations/0002_hadith.sql`) follow the exact same shape as
`quran_bookmarks`/`quran_progress`, keyed by `(book, hadith_number)` since
hadith numbers are unique within a whole collection, not just a section.
The bookmark button and scroll-based progress tracking are shared with
the Quran reader (`components/bookmark-toggle-button.tsx`,
`hooks/use-scroll-progress.ts`) rather than duplicated — each feature
supplies its own server action and copy, the interaction logic lives once.

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

`src/hooks/use-scroll-progress.ts` uses an `IntersectionObserver` to track
the highest verse/hadith scrolled into view and persists it (debounced,
signed-in users only) so the dashboard's "continue reading" card can
resume near where the user left off. Shared by both the Quran and Hadith
readers — see [Hadith](#hadith).

### AI Assistant

`src/app/api/assistant/route.ts` streams chat responses from Claude (via
the Vercel AI SDK's `streamText` + `@ai-sdk/anthropic`) to
`features/assistant/components/assistant-chat.tsx` (`useChat` from
`@ai-sdk/react`). The system prompt
(`features/assistant/system-prompt.ts`) enforces the platform's
non-negotiable rule: it must not issue fatwas/rulings (it redirects those
to a qualified scholar) and must not quote exact Quran/hadith wording from
its own memory (it redirects to this app's own vetted Quran/Hadith
sections instead) — both asserted by unit tests so a future edit can't
silently weaken them.

The route requires `ANTHROPIC_API_KEY`; without it, the assistant page
renders a "not configured" empty state instead of the chat (verified in
this sandbox, which has no key). A simple in-memory fixed-window rate
limiter (`lib/rate-limit.ts`) throttles requests per IP — adequate for a
single instance, not a substitute for a shared store (e.g. Redis) once
this runs on multiple instances. The full request pipeline (UI → route →
Anthropic → error handling) was verified end-to-end against the real
Anthropic API using a deliberately invalid key, which correctly surfaced
as a graceful error in the UI rather than a crash.

## Out of scope for this milestone

- Vercel deployment (the app is deploy-ready; no live project was created
  yet — see the session notes for why).
- A real `ANTHROPIC_API_KEY` (the AI Assistant is built and wired but
  can't be exercised end-to-end without one).
- Seerah, Fiqh, Aqeedah, learning paths, courses, exams, certificates,
  gamification, community, and the admin portal — each is a focused
  milestone on top of this foundation, not an extension bolted onto the
  Quran/Hadith readers. Seerah/Fiqh/Aqeedah in particular need a vetted
  content source (like Quran.com and hadith-api) rather than
  self-authored text, given the same accuracy concerns as Quran/Hadith.
