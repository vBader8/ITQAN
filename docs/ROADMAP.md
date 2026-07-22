# Roadmap

Sequenced so each phase ships something real and testable, rather than
scaffolding many subsystems shallowly at once. See
[docs/adr/0001-content-architecture.md](adr/0001-content-architecture.md)
for the architectural split this roadmap is built around.

## Done

- App shell, design system, i18n (English/Arabic, full RTL)
- Auth (Supabase email/password), Row Level Security throughout
- Quran reader (bookmarks, reading progress), Tafsir, Hadith (10
  collections, bookmarks, reading progress) — all read-through to vetted
  external sources, never self-hosted
- AI Assistant with hard safety guardrails (no rulings, no scripture
  quoted from memory), enforced by tests
- CI (GitHub Actions: lint, typecheck, unit tests, build), Husky +
  lint-staged + commitlint (Conventional Commits)
- RBAC foundation: `profiles.role` (`member`/`moderator`/`scholar`/`admin`)
  and a `has_role()` SQL helper — not yet enforced anywhere; lands with the
  features below that actually need it

## Next

- **Unified content addressing**: generic `content_bookmarks`/
  `content_progress` tables keyed by `(content_type, content_key)`,
  replacing the per-type Quran/Hadith tables. Proves the addressing
  pattern every future content type (including CMS-authored content) will
  use, and removes real duplication.
- **CMS v1** for one authored content type (Articles) — Draft → Review →
  Scholar Approval → Published → Archived, version history, rollback.
  Deliberately narrow scope first: get the workflow and data model right
  for one type before generalizing to Courses/Exams.
- **Structured logging** — a thin abstraction over `console` now, swap in
  a real provider (e.g. Axiom/Sentry) later without touching call sites.
- Supabase project provisioning + Vercel deployment (blocked in this
  session on tool access; see session notes).

## Later

Each of these is its own multi-week project and is intentionally not
started until the phase above lands and the product need is concrete:

- Universal search (Quran/Hadith/articles/courses, fuzzy + Arabic +
  ranking)
- Notification center (push/email/in-app/scheduled)
- Storage and cache provider abstractions (multi-provider, not just
  Supabase)
- GraphQL surface + OpenAPI docs for a public/partner API
- OAuth providers beyond email (Google/Apple/Microsoft), MFA
- Enterprise admin dashboard (analytics, moderation, feature flags,
  system health)
- Full observability stack (metrics, tracing, crash reporting)
- Native app / offline-mode groundwork

## Explicitly not planned as "universal" architecture

- Quran, Hadith, and Tafsir will **not** be routed through the CMS's
  editorial workflow. See ADR-0001.
