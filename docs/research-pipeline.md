# Orbit opportunity research pipeline

## Decision

Do not query Google from the browser for every user search. Keep a canonical opportunity catalog and search that catalog. Refresh it in the background from official sources.

For the free launch, use a curated source list and scheduled GitHub Actions rather than Vertex AI Search or Google Search grounding. Those Google services require billing or have changing quota limits. The current app includes 50 official source links; source links are not claims that every program is currently accepting applications.

## Why

- Firestore is the right home for user profiles, saved opportunities, phases, and onboarding files.
- Firestore is not a full-text search engine. Firebase documents recommend using a dedicated search service for full-text search.
- Google Custom Search JSON API is closed to new customers and is scheduled for transition on January 1, 2027.
- Google recommends Vertex AI Search for site-restricted search across up to 50 domains.

## Proposed flow

1. Maintain a source list of official career, fellowship, competition, and program pages.
2. Run a scheduled server job, not the client, to fetch each source.
3. Extract structured fields: title, organization, type, locations, deadline, eligibility, URL, description, source, and last verified time.
4. Normalize dates and locations.
5. Deduplicate by canonical URL plus organization/title hash.
6. Store canonical records in `opportunities/{opportunityId}`.
7. Index searchable text in a dedicated search index.
8. Store each user’s preferences and saved IDs under `users/{uid}`.
9. Rank results with hard filters first, then preference matches, then freshness and deadline proximity.
10. Use an AI model only to summarize, classify, and explain matches from retrieved records. Never let it invent an opportunity or URL.

## Search options

### Free first release

Use GitHub Actions to fetch public HTML, RSS feeds, and sitemaps from the curated source list once or twice per day. Normalize only fields that are present on the source page. Store the result in Firestore and search the small catalog in the browser. Add a `lastCheckedAt` field and show `check official site` when no current deadline was verified.

### Best first paid release

Use a managed search index such as Algolia or Typesense. Firestore remains the source of truth. This gives typo tolerance, facets, pagination, and fast catalog search without exposing provider keys.

### Google-backed source discovery

Use Vertex AI Search for a controlled set of official domains. Keep the source list narrow and verify every result against the canonical page before publishing it.

### AI matching

Create an embedding from the user profile plus the opportunity fields. Retrieve a small candidate set, then apply deterministic rules for deadline, location, eligibility, and type. Present the reason for a match as fields, not an opaque score.

## Required server-side pieces

- A scheduled Cloud Run job or Firebase scheduled function for ingestion.
- Secret storage for provider credentials.
- A search index and an indexing worker.
- Firestore rules for user-owned data.
- A moderation/verification queue before new sources become visible.

## Current app boundary

The app now has a multi-record catalog, direct official URLs, Firestore user data, and preference-based local ranking. The external ingestion and search-index worker should be added before claiming complete web-scale coverage.

Sources:

- https://firebase.google.com/docs/firestore/solutions/search
- https://developers.google.com/custom-search/v1/overview
- https://firebase.google.com/docs/firestore/vector-search
