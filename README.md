# orbit.

Orbit is a focused opportunity tracker for high-school students.

**Live app:** https://orbit-next-lilac.vercel.app

## Features

- Grade-aware onboarding and opportunity ranking
- 50 official high-school programs and competitions
- Search, filtering, board phases, and direct official links
- Step-by-step program creation with source URL validation
- Avatar customization saved to Firebase
- Interactive 3D opportunity scene with node summaries
- Firebase Authentication and Firestore persistence

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` with the Firebase client configuration used by `lib/firebase.ts`.

## Verify

```bash
npm run build
```

## Data note

Program links point to official organization pages. Eligibility, deadlines, and availability change by cycle, so users should confirm details on the linked source page.
