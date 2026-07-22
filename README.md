# ITQAN

A calm, premium Islamic learning platform — Quran, Tafsir, Hadith, Seerah,
Fiqh, Aqeedah, learning paths, courses, and more. This repository currently
contains the **foundation milestone**: the app shell, design system, auth,
and fully built Quran, Tafsir, and Hadith reading features that every later
feature builds on top of.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **Tailwind CSS v4** with a token-based design system (`src/design-system`)
- **Supabase** for auth and user data (Postgres + Row Level Security)
- **next-intl** for English/Arabic i18n with full RTL support
- **Quran.com API** for Quran text, tafsir, and translations (not
  self-hosted — see [Architecture](docs/ARCHITECTURE.md#quran-content))
- **fawazahmed0/hadith-api** for the ten classical hadith collections (see
  [Architecture](docs/ARCHITECTURE.md#hadith))
- **Vitest** + Testing Library for unit tests, **Playwright** for e2e

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL/anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/en` (or `/ar` based on your browser's preferred language).

### Database

Apply the migrations in `supabase/migrations/` to your Supabase project
(via the Supabase CLI, dashboard SQL editor, or the `apply_migration` MCP
tool). They create `profiles`, `quran_bookmarks`, and `quran_progress`,
each with Row Level Security scoped to the owning user, plus a trigger that
creates a `profiles` row on signup.

### Scripts

| Command            | Purpose                          |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start the dev server (Turbopack) |
| `npm run build`    | Production build                 |
| `npm run lint`     | ESLint                           |
| `npm run test`     | Unit tests (Vitest)              |
| `npm run test:e2e` | End-to-end tests (Playwright)    |

`test:e2e` includes tests that call the real Quran.com API and therefore
need outbound network access to `api.quran.com`.

## Documentation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the folder structure,
key architectural decisions, and what's intentionally out of scope for this
milestone.
