# ADR-0001: Content architecture — external read-through vs. authored CMS

## Status

Accepted

## Context

ITQAN's product vision spans two fundamentally different kinds of content:

1. **Fixed, canonical religious text** — Quran, Hadith, and (to a lesser
   extent) Tafsir. These have a single correct wording, maintained by
   institutions outside ITQAN, and a real cost to getting wrong.
2. **Authored educational content** — Articles, Courses, Exams, and
   (eventually) Seerah/Fiqh/Aqeedah explanations. These don't exist until
   ITQAN or its scholars write them, and benefit from an editorial
   workflow (draft → review → approval → publish → revise).

A single "universal Content Engine" that routes both kinds through the same
Draft/Review/Scholar-Approval/Published/Archived workflow was proposed.
Applied uniformly, this doesn't make sense: there is no "draft" of Surah
Al-Fatiha, and no editorial team should be in the business of "approving"
the Quran. Forcing canonical text through an approval workflow would imply
we're the source of truth for it, which is exactly the risk the current
architecture was built to avoid (see `docs/ARCHITECTURE.md` §Quran
content, §Hadith).

## Decision

Split content into two families with different architectures, unified only
at the addressing/interaction layer:

- **Read-through content** (Quran, Hadith, Tafsir): fetched live from
  vetted external sources (Quran.com, fawazahmed0/hadith-api) on every
  request, cached at the HTTP layer, never stored as our own row of truth.
  No draft/review/approval concept applies. This is already implemented.
- **Authored content** (Articles, Courses, Exams, and future
  Seerah/Fiqh/Aqeedah content): goes through a CMS with the full
  Draft → Review → Scholar Approval → Published → Archived workflow,
  version history, and rollback. Only `Published` content is ever served
  to end users. **Not yet implemented** — scoped for a dedicated pass; see
  `docs/ROADMAP.md`.

Both families share one addressing convention so bookmarks, notes, and
reading progress work identically regardless of source: a `(content_type,
content_key)` pair (e.g. `("quran_verse", "2:255")`,
`("article", "<uuid>")`). The current `quran_bookmarks`/`quran_progress`
and `hadith_bookmarks`/`hadith_progress` tables are the per-type
predecessor of this; unifying them into generic `content_bookmarks`/
`content_progress` tables is proposed as the first Next-phase item so the
CMS's authored content can plug into the same bookmark/progress UI without
a third bespoke table.

## Consequences

- Quran/Hadith/Tafsir integrity risk stays where it already is: with the
  external sources, not with us.
- The CMS (when built) only ever needs to answer "is this the latest
  Published version," never "is this actually correct Quran text" — a
  much smaller, tractable problem for an editorial workflow to own.
- Bookmarks/notes/progress UI can eventually be written once against the
  generic `content_type`/`content_key` shape and reused for every content
  type, present and future, rather than duplicated per type as it is
  today (a known, accepted cost until the Next-phase migration lands).
