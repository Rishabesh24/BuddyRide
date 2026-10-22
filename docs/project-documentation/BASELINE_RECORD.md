# Software Baseline Record

**Project Name:** BuddyRide (Package Identifier: `routeshare` v1.0.0)<br />
**Baseline Identifier:** BASELINE-SCM3-PRE-DOCS<br />
**Inspection Date:** 2026-10-22

---

## 1. Baseline Summary & Context

This Software Baseline Record captures the verified state of the BuddyRide repository prior to introducing formal Software Configuration Management (SCM) documentation.

This baseline serves as the formal starting reference point for SCM Review 3. It establishes that all core application source code, API controllers, database migrations, mathematical matching algorithms, design tokens, and automated test scripts were fully implemented and frozen at this starting commit.

---

## 2. Git Repository & Starting Baseline Attributes

| Attribute | Verified Value |
| :--- | :--- |
| **Repository Identity** | `BuddyRide` |
| **Origin Remote URL** | `https://github.com/Rishabesh24/BuddyRide.git` |
| **Baseline Branch** | `main` |
| **Starting Commit Full Hash** | `ae55509688a083b3739c8117c2d178067f98b8e7` |
| **Starting Commit Abbreviated** | `ae55509` |
| **Commit Author** | `Rishabesh24 <rishabesh24@gmail.com>` |
| **Commit Timestamp** | `2026-10-21 00:15:48 +0530` |
| **Commit Subject** | `Correction for TC` |
| **Working Tree State** | Clean (0 modified, 0 untracked, 0 staged files) |
| **Documentation Branch** | `docs/buddyride-project-docs` (created directly from `main` at `ae55509`) |

---

## 3. Verified Repository Contents at Baseline

At this baseline, the repository consists of the following verified functional assets:

1. **Application Shell & Views (`app/`):**
   - Landing page ([`app/page.tsx`](file:///d:/Projects/BuddyRide/app/page.tsx))
   - Dual-pane search and map page ([`app/rides/page.tsx`](file:///d:/Projects/BuddyRide/app/rides/page.tsx))
   - Ride detail and booking page ([`app/rides/[id]/page.tsx`](file:///d:/Projects/BuddyRide/app/rides/%5Bid%5D/page.tsx))
   - Driver console and ride publishing wizard ([`app/driver/page.tsx`](file:///d:/Projects/BuddyRide/app/driver/page.tsx), [`app/driver/publish/page.tsx`](file:///d:/Projects/BuddyRide/app/driver/publish/page.tsx))
   - Passenger booking manager with 4-digit start OTP display ([`app/bookings/page.tsx`](file:///d:/Projects/BuddyRide/app/bookings/page.tsx))
   - Operations & Safety administration HQ ([`app/admin/page.tsx`](file:///d:/Projects/BuddyRide/app/admin/page.tsx))
   - User profile customization and vehicle garage ([`app/profile/page.tsx`](file:///d:/Projects/BuddyRide/app/profile/page.tsx))
   - Authentication pages with 1-click evaluation chips ([`app/login/page.tsx`](file:///d:/Projects/BuddyRide/app/login/page.tsx), [`app/signup/page.tsx`](file:///d:/Projects/BuddyRide/app/signup/page.tsx))
   - Custom 404 handler ([`app/not-found.tsx`](file:///d:/Projects/BuddyRide/app/not-found.tsx))
2. **REST API Endpoints (`app/api/`):**
   - Ride listing, search, and detail routes (`rides`, `rides/search`, `rides/[id]`)
   - Booking lifecycle and state transition routes (`bookings`, `accept`, `reject`, `cancel`, `complete`, `verify-otp`)
   - Authentication routes (`login`, `signup`)
   - Vehicle fleet management (`vehicles`)
   - In-app alerts (`notifications`)
   - Administration statistics, reports, KYC, and user suspension (`admin/*`)
3. **Core Algorithmic Engines (`features/`):**
   - Geometric trajectory matching and detour scoring engine ([`features/matching/engine.ts`](file:///d:/Projects/BuddyRide/features/matching/engine.ts))
   - Proportional fare calculator with Indian mobility tiers ([`features/fare/calculator.ts`](file:///d:/Projects/BuddyRide/features/fare/calculator.ts))
   - Tamil Nadu transit hubs and geocoding utilities ([`features/locations/`](file:///d:/Projects/BuddyRide/features/locations))
   - Domain TypeScript definitions ([`features/types.ts`](file:///d:/Projects/BuddyRide/features/types.ts))
4. **Data Access & Security (`lib/` & `supabase/`):**
   - Dual-mode repository pattern adapter ([`lib/db/repository.ts`](file:///d:/Projects/BuddyRide/lib/db/repository.ts))
   - Deterministic corridor fixtures ([`lib/fixtures/rides.ts`](file:///d:/Projects/BuddyRide/lib/fixtures/rides.ts))
   - In-memory authentication provider and demo credentials ([`lib/auth.ts`](file:///d:/Projects/BuddyRide/lib/auth.ts))
   - Supabase client integration ([`lib/supabase/client.ts`](file:///d:/Projects/BuddyRide/lib/supabase/client.ts))
   - Complete PostgreSQL schema migration with RLS policies and stored procedures ([`supabase/migrations/20250101000000_init_schema.sql`](file:///d:/Projects/BuddyRide/supabase/migrations/20250101000000_init_schema.sql))
5. **Quality Assurance & Verification (`tests/`):**
   - Fare math unit tests ([`tests/unit/fare.test.ts`](file:///d:/Projects/BuddyRide/tests/unit/fare.test.ts))
   - Matching algorithm unit tests ([`tests/unit/matching.test.ts`](file:///d:/Projects/BuddyRide/tests/unit/matching.test.ts))
   - 60-test case automated manual verification suite ([`tests/test-all-modules.mjs`](file:///d:/Projects/BuddyRide/tests/test-all-modules.mjs))
   - Lifecycle integration test script ([`tests/test-lifecycle.mjs`](file:///d:/Projects/BuddyRide/tests/test-lifecycle.mjs))
   - Route smoke test script ([`tests/test-routes.mjs`](file:///d:/Projects/BuddyRide/tests/test-routes.mjs))

---

## 4. Integrity Statement

- **Non-Destructive Guarantee:** No historical commits, commit dates, or author identities were modified or re-written.
- **Tagging Policy:** In accordance with audit instructions, no Git tags were created or moved as part of this documentation baseline.
- **Application Preservation:** No application source code, API routes, database migrations, styling directives, dependencies, or environment configuration files were modified. All documentation additions are strictly confined to `docs/project-documentation/`.
