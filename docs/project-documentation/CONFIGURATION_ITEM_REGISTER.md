# Configuration Item Register (CIR)

**Project Name:** BuddyRide (Package Identifier: `routeshare` v1.0.0)<br />
**Document Purpose:** SCM Configuration Identification & Item Register<br />
**Baseline Reference Commit:** `ae55509688a083b3739c8117c2d178067f98b8e7`<br />
**Date:** October 2026

---

## 1. Overview & SCM Identification Standard

This Configuration Item Register (CIR) defines and catalogs all Configuration Items (CIs) comprising the BuddyRide software product baseline. In accordance with Software Configuration Management (SCM) best practices, every item is uniquely identified, tracked by its exact repository path, classified by configuration type, and associated with a verified baseline reference and verification method.

### SCM Categories
- **C-MAN:** Package manifests, dependencies, and environment specifications
- **C-CFG:** Build, compilation, styling, and linting configuration items
- **C-DAT:** Relational database schema, migrations, and security policies
- **C-DOM:** Core mathematical algorithms, fare calculators, and domain models
- **C-DAL:** Data access layers, repository adapters, and seed fixtures
- **C-SEC:** Authentication, session management, and RBAC authorization
- **C-APP:** Presentation views, layouts, and route pages
- **C-API:** REST API controllers and state transition handlers
- **C-CMP:** Reusable UI design system components, layout, and map wrappers
- **C-TST:** Unit test suites, integration tests, and verification scripts
- **C-DOC:** Requirements, architecture specifications, and engineering documentation

---

## 2. Configuration Item Register

| CI Identifier | Configuration Item Name | Exact Repository Path | SCM Cat. | Purpose & Description | Baseline / Version Reference | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CI-MAN-01** | Root Package Manifest | `package.json` | C-MAN | Defines package name (`routeshare`), v1.0.0, scripts, and runtime/dev dependencies | v1.0.0 (commit `ae55509`) | File inspection, JSON parse validation |
| **CI-MAN-02** | Locked Dependency Tree | `package-lock.json` | C-MAN | Exact locked dependency versions, integrity hashes, and tree structure | lockfileVersion: 3 (commit `ae55509`) | `npm.cmd ci` tree integrity check |
| **CI-MAN-03** | Environment Variable Template | `.env.example` | C-MAN | Sanitized template defining required public and service credentials | Commit `ae55509` | File inspection |
| **CI-MAN-04** | Git Exclusion Specifications | `.gitignore` | C-MAN | Excludes build artifacts, `node_modules`, secret files (`.env*.local`), and logs | Commit `ae55509` | Git tracking verification |
| **CI-CFG-01** | TypeScript Configuration | `tsconfig.json` | C-CFG | Compiler configuration enforcing ES2022 target, path aliases (`@/*`), and strict mode | TypeScript 5.7.2 | `npm.cmd run typecheck` |
| **CI-CFG-02** | Next.js Application Config | `next.config.ts` | C-CFG | Next.js runtime settings and remote image domains (`unsplash.com`, `dicebear.com`) | Next.js 15.1.3 | Next.js build compilation |
| **CI-CFG-03** | Tailwind CSS Configuration | `tailwind.config.ts` | C-CFG | Custom color palettes (`commuter`, `mobility`), responsive breakpoints, animations | Tailwind 3.4.17 | CSS build compilation |
| **CI-CFG-04** | PostCSS Pipeline Config | `postcss.config.mjs` | C-CFG | Configures Tailwind CSS and Autoprefixer CSS transformations | PostCSS 8.4.49 | CSS build compilation |
| **CI-CFG-05** | ESLint Code Quality Rules | `.eslintrc.json` | C-CFG | Core web vitals and linting rules extending `next/core-web-vitals` | ESLint 9.17.0 | `npm.cmd run lint` |
| **CI-CFG-06** | Vitest Configuration | `vitest.config.ts` | C-CFG | Node test environment, root path alias resolution (`@`), globals enabled | Vitest 2.1.8 | `npm.cmd test` |
| **CI-DAT-01** | Database Schema & Migrations | `supabase/migrations/20250101000000_init_schema.sql` | C-DAT | PostgreSQL DDL for 9 tables, indexes, RLS policies, concurrency stored procedure, and triggers | PostgreSQL 15+ (commit `ae55509`) | SQL DDL syntax validation & inspection |
| **CI-DOM-01** | Geometric Matching Engine | `features/matching/engine.ts` | C-DOM | Haversine distance, cross-track projection, direction ordering check, and detour scoring | Commit `ae55509` | Vitest `matching.test.ts` (7 tests) |
| **CI-DOM-02** | Proportional Fare Calculator | `features/fare/calculator.ts` | C-DOM | Segment distance fare math, occupancy discounts, platform fee, Indian mobility tiers | Commit `ae55509` | Vitest `fare.test.ts` (5 tests) |
| **CI-DOM-03** | Transit Hubs & Corridors | `features/locations/tamil-nadu-locations.ts` | C-DOM | 18 transit hubs and coordinates across Chennai, Coimbatore, Madurai, Trichy, Salem, Pondicherry | Commit `ae55509` | TypeScript compiler check |
| **CI-DOM-04** | Geocoding Utility | `features/locations/geocoder.ts` | C-DOM | In-memory fuzzy coordinate resolver and location lookup helper | Commit `ae55509` | TypeScript compiler check |
| **CI-DOM-05** | Domain TypeScript Models | `features/types.ts` | C-DOM | Contracts for `Ride`, `Booking`, `Profile`, `Vehicle`, `MatchResult`, `SearchQuery`, etc. | Commit `ae55509` | TypeScript compiler check |
| **CI-DAL-01** | Repository Pattern Adapter | `lib/db/repository.ts` | C-DAL | `IRideRepository` interface and `LocalFixtureRepository` with in-memory persistence and cloud sync | Commit `ae55509` | Test verification suites |
| **CI-DAL-02** | Supabase Client Factory | `lib/supabase/client.ts` | C-DAL | Connection detector (`isSupabaseConfigured`) and client instances (`supabase`, `supabaseAdmin`) | Commit `ae55509` | Runtime initialization check |
| **CI-DAL-03** | Commuter Seed Fixtures | `lib/fixtures/rides.ts` | C-DAL | Deterministic seed data for rides, drivers, vehicles, and commuter profiles | Commit `ae55509` | TypeScript compiler check |
| **CI-DAL-04** | Formatters & Helpers | `lib/utils.ts` | C-DAL | Tailwind `cn()`, INR currency formatter (`₹`), distance, duration, and date formatters | Commit `ae55509` | TypeScript compiler check |
| **CI-SEC-01** | Mock Auth & Demo Credentials | `lib/auth.ts` | C-SEC | In-memory registration, password verification, demo accounts (Rider, Driver, Admin) | Commit `ae55509` | TC-M1 test cases in `test-all-modules.mjs` |
| **CI-SEC-02** | Admin Authorization Gate | `lib/admin-auth.ts` | C-SEC | Request authorization validator for sensitive administrative endpoints | Commit `ae55509` | TC-M6 test cases in `test-all-modules.mjs` |
| **CI-SEC-03** | Global Role & Auth Context | `context/role-context.tsx` | C-SEC | React `AuthProvider`, `useAuth`, session persistence, and role switching | Commit `ae55509` | React component mount & inspection |
| **CI-SEC-04** | RBAC Route Guard Component | `components/auth/role-guard.tsx` | C-SEC | Intercepts unauthorized route navigation and renders sign-in prompts or HTTP 403 screens | Commit `ae55509` | Role guard test cases |
| **CI-APP-01** | Commuter Landing View | `app/page.tsx` | C-APP | Hero section, commuter search bar, mobility tier grid, value propositions | Commit `ae55509` | Next.js build & route smoke test |
| **CI-APP-02** | Root Application Layout | `app/layout.tsx` | C-APP | Root HTML structure, Inter font, ToastProvider, and Navbar/Footer integration | Commit `ae55509` | Next.js build compilation |
| **CI-APP-03** | Global Stylesheet & Tokens | `app/globals.css` | C-APP | Tailwind directives, mobility design tokens, Leaflet map custom styles | Commit `ae55509` | PostCSS compilation |
| **CI-APP-04** | 404 Not Found Page | `app/not-found.tsx` | C-APP | Custom user-facing HTTP 404 error screen | Commit `ae55509` | Route smoke test |
| **CI-APP-05** | User Login Page | `app/login/page.tsx` | C-APP | Role selector, credential inputs, 1-click evaluation chips, authentication dispatch | Commit `ae55509` | Route smoke test |
| **CI-APP-06** | User Registration Page | `app/signup/page.tsx` | C-APP | Account registration form with name, email, phone, password, and role selector | Commit `ae55509` | Route smoke test |
| **CI-APP-07** | Dual-Pane Ride Search View | `app/rides/page.tsx` | C-APP | Faceted search filters, result cards, and synchronized Leaflet map view | Commit `ae55509` | Route smoke test |
| **CI-APP-08** | Ride Detail & Booking View | `app/rides/[id]/page.tsx` | C-APP | Route timeline, driver info, dynamic fare breakdown, and booking submission | Commit `ae55509` | Route smoke test |
| **CI-APP-09** | Driver Partner Console | `app/driver/page.tsx` | C-APP | Online dispatch toggle, earnings tracker, incoming request queue, OTP validation modal | Commit `ae55509` | Route smoke test |
| **CI-APP-10** | Ride Publishing Wizard | `app/driver/publish/page.tsx` | C-APP | Multi-step form for scheduling corridor trips, adding waypoints, and seat limits | Commit `ae55509` | Route smoke test |
| **CI-APP-11** | Passenger Bookings Manager | `app/bookings/page.tsx` | C-APP | Active and past bookings, 4-digit start OTP display, driver contact dialer, cancellation | Commit `ae55509` | Route smoke test |
| **CI-APP-12** | Admin Operations & Safety HQ | `app/admin/page.tsx` | C-APP | Platform metrics, driver KYC moderation, safety incident reports, user suspension | Commit `ae55509` | Route smoke test |
| **CI-APP-13** | User Profile & Garage View | `app/profile/page.tsx` | C-APP | Profile detail management, role-tailored stats, and driver vehicle garage | Commit `ae55509` | Route smoke test |
| **CI-API-01** | Rides Collection Controller | `app/api/rides/route.ts` | C-API | GET (list/filter rides), POST (publish new ride with validation) | Commit `ae55509` | Next.js route verification |
| **CI-API-02** | Ride Entity Controller | `app/api/rides/[id]/route.ts` | C-API | GET (retrieve ride by ID), PATCH (edit ride), DELETE (cancel ride) | Commit `ae55509` | Next.js route verification |
| **CI-API-03** | Algorithmic Ride Search API | `app/api/rides/search/route.ts` | C-API | GET query endpoint evaluating corridor compatibility and returning scored matches | Commit `ae55509` | `test-lifecycle.mjs` & M2 suite |
| **CI-API-04** | Bookings Collection Controller | `app/api/bookings/route.ts` | C-API | GET (list bookings by role/user), POST (create booking request with 4-digit OTP) | Commit `ae55509` | `test-lifecycle.mjs` & M4 suite |
| **CI-API-05** | Booking Accept Controller | `app/api/bookings/[id]/accept/route.ts` | C-API | POST endpoint to accept booking and decrement available seats | Commit `ae55509` | M4 test suite |
| **CI-API-06** | Booking Reject Controller | `app/api/bookings/[id]/reject/route.ts` | C-API | POST endpoint to reject pending booking with recorded reason | Commit `ae55509` | M4 test suite |
| **CI-API-07** | Booking Cancel Controller | `app/api/bookings/[id]/cancel/route.ts` | C-API | POST endpoint to cancel booking and restore seat inventory | Commit `ae55509` | M4 test suite |
| **CI-API-08** | Booking Complete Controller | `app/api/bookings/[id]/complete/route.ts` | C-API | POST endpoint to complete trip and credit driver earnings | Commit `ae55509` | `test-lifecycle.mjs` |
| **CI-API-09** | Start OTP Verification API | `app/api/bookings/[id]/verify-otp/route.ts` | C-API | POST endpoint to validate 4-digit start OTP and transition ride to `in_progress` | Commit `ae55509` | `test-lifecycle.mjs` & M4 suite |
| **CI-API-10** | Authentication Login API | `app/api/auth/login/route.ts` | C-API | POST endpoint verifying credentials against demo and registered accounts | Commit `ae55509` | M1 test suite |
| **CI-API-11** | Authentication Signup API | `app/api/auth/signup/route.ts` | C-API | POST endpoint registering new user profile and creating session | Commit `ae55509` | M1 test suite |
| **CI-API-12** | Driver Vehicles Controller | `app/api/vehicles/route.ts` | C-API | GET (list driver vehicles), POST (register new vehicle with capacity checks) | Commit `ae55509` | M5 test suite |
| **CI-API-13** | In-App Notifications API | `app/api/notifications/route.ts` | C-API | GET (list notifications), PATCH (mark notifications read) | Commit `ae55509` | Route smoke test |
| **CI-API-14** | Admin Statistics Controller | `app/api/admin/stats/route.ts` | C-API | GET endpoint returning platform metrics (active users, rides, occupancy rate) | Commit `ae55509` | M6 test suite |
| **CI-API-15** | Admin Reports Controller | `app/api/admin/reports/route.ts` | C-API | GET (list safety reports), POST (submit or resolve incident reports) | Commit `ae55509` | M6 test suite |
| **CI-API-16** | Admin Driver KYC Controller | `app/api/admin/kyc/route.ts` | C-API | POST endpoint to review, verify, or reject driver KYC credentials | Commit `ae55509` | M6 test suite |
| **CI-API-17** | Admin User Suspension API | `app/api/admin/users/[id]/suspend/route.ts` | C-API | POST endpoint to suspend or restore user accounts | Commit `ae55509` | M6 test suite |
| **CI-CMP-01** | Accessible UI Components | `components/ui/` | C-CMP | Directory containing `badge.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `modal.tsx`, `route-timeline.tsx`, `toast.tsx` | Commit `ae55509` | Component unit render & TS check |
| **CI-CMP-02** | Application Navigation Bar | `components/layout/navbar.tsx` | C-CMP | Responsive header with persona badges, notification menu, mobile drawer | Commit `ae55509` | Component render & TS check |
| **CI-CMP-03** | Application Footer | `components/layout/footer.tsx` | C-CMP | Footer with corridor directory, technology stack badges, and legal links | Commit `ae55509` | Component render & TS check |
| **CI-CMP-04** | Leaflet Map Wrapper | `components/map/` | C-CMP | Dynamic SSR-safe wrapper (`interactive-map.tsx`, `map-inner.tsx`) | Commit `ae55509` | Client render & TS check |
| **CI-CMP-05** | Commuter Search Bar | `components/commuter-search-bar.tsx` | C-CMP | Quick search widget with Tamil Nadu location autocomplete and vehicle selectors | Commit `ae55509` | Component render & TS check |
| **CI-TST-01** | Fare Math Unit Tests | `tests/unit/fare.test.ts` | C-TST | Vitest test suite verifying proportional fare calculations and discount caps | Commit `ae55509` | `npm.cmd test` |
| **CI-TST-02** | Matching Engine Unit Tests | `tests/unit/matching.test.ts` | C-TST | Vitest test suite verifying Haversine formula, detour limits, and direction checks | Commit `ae55509` | `npm.cmd test` |
| **CI-TST-03** | Automated Manual Test Suite | `tests/test-all-modules.mjs` | C-TST | 1,170-line script verifying 60 test cases across M1 through M6 | Commit `ae55509` | `node tests/test-all-modules.mjs` |
| **CI-TST-04** | Lifecycle Integration Script | `tests/test-lifecycle.mjs` | C-TST | Verifies full end-to-end trip lifecycle from search to OTP verification and completion | Commit `ae55509` | `node tests/test-lifecycle.mjs` |
| **CI-TST-05** | Route Verification Script | `tests/test-routes.mjs` | C-TST | Smoke test asserting HTTP 200 responses across 13 major routes | Commit `ae55509` | `node tests/test-routes.mjs` |
| **CI-DOC-01** | System Requirements Spec. | `docs/SRS.md` | C-DOC | Comprehensive IEEE 830-aligned software requirements specification | Commit `ae55509` | Document inspection |
| **CI-DOC-02** | High-Level Design Document | `docs/HLD.md` | C-DOC | High-level system architecture and Mermaid component diagrams | Commit `ae55509` | Document inspection |
| **CI-DOC-03** | Low-Level Design Document | `docs/LLD.md` | C-DOC | Detailed mathematical specifications, class structures, and schema designs | Commit `ae55509` | Document inspection |
| **CI-DOC-04** | Architecture Blueprint | `docs/ARCHITECTURE.md` | C-DOC | Architectural boundaries, dependency inversion, and directory layout | Commit `ae55509` | Document inspection |
| **CI-DOC-05** | REST API Specification | `docs/API_SPEC.md` | C-DOC | OpenAPI-style contract documentation for all REST API route handlers | Commit `ae55509` | Document inspection |
| **CI-DOC-06** | Quality Assurance Test Plan | `docs/TEST_PLAN.md` | C-DOC | Comprehensive testing strategy, test levels, and coverage matrix | Commit `ae55509` | Document inspection |
| **CI-DOC-07** | Architectural Decision Records | `docs/DECISIONS.md` | C-DOC | Formal records of technical decisions (monolith, matching math, fare model) | Commit `ae55509` | Document inspection |
| **CI-DOC-08** | Project Status & Inspection | `docs/PROJECT_STATUS.md` | C-DOC | Inception audit, environment inspection, and milestone tracking | Commit `ae55509` | Document inspection |
| **CI-DOC-09** | Feature Roadmap | `docs/ROADMAP.md` | C-DOC | Planned future enhancements (live GPS tracking, payment gateways, mobile apps) | Commit `ae55509` | Document inspection |
| **CI-DOC-10** | UI & UX Wireframe Plan | `docs/UI_UX_PLAN.md` | C-DOC | Visual design tokens, screen layouts, wireframes, and accessibility guidelines | Commit `ae55509` | Document inspection |
| **CI-DOC-11** | Project Readme | `README.md` | C-DOC | Repository guide, quickstart instructions, and technical interview talking points | Commit `ae55509` | Document inspection |

---

## 3. Maintenance & Change Management

Any modification to configuration items cataloged in this register must adhere to the change control procedure outlined in [`docs/project-documentation/CONTRIBUTING.md`](file:///d:/Projects/BuddyRide/docs/project-documentation/CONTRIBUTING.md). Updates that introduce new files, modify schema migrations, or alter compiler configurations require an update to this register and a corresponding entry in [`docs/project-documentation/CHANGELOG.md`](file:///d:/Projects/BuddyRide/docs/project-documentation/CHANGELOG.md).
