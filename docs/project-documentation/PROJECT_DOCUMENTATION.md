# BuddyRide — Comprehensive Project Documentation

**Project Name:** BuddyRide (Package Identifier: `routeshare` v1.0.0)<br />
**System Class:** Algorithmic Carpooling & Smart Mobility Platform<br />
**Documentation Version:** 1.0.0<br />
**Date:** October 2026

---

## 1. Project Overview & Objectives

### 1.1 Overview
BuddyRide is an algorithmic, corridor-based ride-sharing and carpooling web platform designed to connect commuters travelling along overlapping urban and intercity routes. Unlike traditional ride-hailing services (e.g., Uber, Ola) that treat every trip as an isolated taxi dispatch with opaque surge pricing algorithms, BuddyRide models trips as shared commuter journeys with geometric detour validation and deterministic proportional fare allocation.

The platform is localized for Tamil Nadu transit hubs (including Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, and Puducherry) and provides authentic Indian mobility choices, ranging from solo bike taxis to high-capacity corridor shuttles.

### 1.2 Core Objectives
1. **Geometric Corridor Matching:** Match intermediate pickups and drop-offs along driver trajectories using spherical trigonometry (Haversine formula) and cross-track perpendicular line projections, eliminating rudimentary city string-matching limitations.
2. **Configurable Detour Bounding:** Prevent disruptive driver deviations by enforcing maximum detour thresholds ($\Delta d \le \Delta d_{max}$) and strict spatial travel ordering.
3. **Deterministic Proportional Fare Allocation:** Replace surge pricing with cost-sharing based strictly on passenger segment distance, with shared occupancy discounts for multiple co-riders.
4. **End-to-End Boarding Security:** Protect passenger and driver safety using a 4-digit start One-Time Password (OTP) verification protocol before trip commencement.
5. **Role-Based Portals (RBAC):** Provide distinct, dedicated portals for Passengers, Driver Partners, and Operations & Safety Administrators with verified access controls.
6. **Resilient Data Architecture:** Employ a dual-mode repository pattern allowing instant zero-config local evaluation with rich seed fixtures, while maintaining full compatibility with Supabase PostgreSQL cloud persistence.

---

## 2. Technology Stack & System Architecture

### 2.1 Technology Stack Summary

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 15.1.3 | Server & Client Components (`'use client'`), file-based routing |
| **Language & Runtime** | React, TypeScript, Node.js | React 19.0.0, TS 5.7.2, Node 24.x | Type-safe UI components, strict compiler flags (`strict: true`) |
| **Styling & Design Tokens** | Tailwind CSS, PostCSS, Autoprefixer | Tailwind 3.4.17, PostCSS 8.4.49 | Utility-first CSS, custom mobility tokens, responsive layouts |
| **UI Utilities & Icons** | Lucide React, class-variance-authority | Lucide 0.469.0, clsx 2.1.1, cva 0.7.1 | Accessible iconography and dynamic component variants |
| **Form Management** | React Hook Form, Zod | RHF 7.54.2, Zod 3.24.1 | Schema-driven form validation and runtime payload checks |
| **Geospatial & Mapping** | Leaflet, react-leaflet | Leaflet 1.9.4, react-leaflet 5.0.0 | Client-side interactive maps, polyline routes, waypoint markers |
| **Backend API Layer** | Next.js Route Handlers | Next.js 15.1.3 | REST API endpoints under `/app/api/*` |
| **Database & Client** | Supabase JS SDK, PostgreSQL | `@supabase/supabase-js` 2.47.10 | PostgreSQL 15+ relational schema, Row Level Security, RPCs |
| **Testing Framework** | Vitest | 2.1.8 | In-memory unit test runner for mathematical algorithms |

### 2.2 System Architecture Diagram

```
[Passenger Browser]         [Driver Browser]         [Admin Portal]
        │                          │                       │
        └──────────────────────────┼───────────────────────┘
                                   │ HTTPS
                                   ▼
                ┌─────────────────────────────────────┐
                │    Next.js 15 App Router Server     │
                │  - React Server & Client Components │
                │  - Tailwind CSS Design System       │
                │  - REST API Route Handlers          │
                └──────────────────┬──────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Matching Engine  │     │   Fare Engine    │     │ Repository Layer │
│ - Haversine Dist │     │ - Proportional   │     │ - Supabase Client│
│ - Cross-Track    │     │ - Occupancy Disc.│     │ - Local Adapter  │
│ - Detour Limits  │     │ - 5% Platform Fee│     │   (Zero-config)  │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                                           ▼
                                                ┌──────────────────┐
                                                │ Supabase Cloud   │
                                                │ - PostgreSQL 15  │
                                                │ - Row-Level Sec. │
                                                │ - Atomic Locks   │
                                                └──────────────────┘
```

---

## 3. Main Application Modules & Implemented Features

### 3.1 Passenger Portal & Ride Discovery
- **Landing Page (`/`):** Hero section, quick commuter search bar with Tamil Nadu location autocomplete, mobility tier catalog, and platform feature highlights.
- **Dual-Pane Search (`/rides`):** Synchronized dual-pane layout featuring scrollable search results on the left and an interactive Leaflet OpenStreetMap view on the right. Includes filtering by vehicle tier, departure time of day (morning, afternoon, evening), price cap, and detour sorting.
- **Ride Details & Booking (`/rides/[id]`):** Waypoint timeline, driver verification badges, vehicle details, live interactive fare calculator by seat count, and seat reservation submission.
- **Bookings Manager (`/bookings`):** Lifecycle tracking (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `rejected`), display of the unique 4-digit start OTP for boarding, driver phone contact, and cancellation modal with seat restoration.

### 3.2 Driver Partner Console & Publishing
- **Driver Dashboard (`/driver`):** Online/Offline dispatch availability toggle, daily earnings counter (`todayEarnings`), and actionable incoming request queue with 1-click Accept and Reject controls.
- **Boarding PIN Verification:** Live OTP entry modal on the driver console where the driver inputs the passenger's 4-digit PIN to transition the trip to `in_progress`.
- **Guided Ride Publishing Wizard (`/driver/publish`):** Multi-step publication flow enabling drivers to select transit corridors, add intermediate waypoints, configure departure time, set vehicle capacity, and define maximum acceptable detour bounds ($\text{km}$).

### 3.3 Operations & Safety Administration HQ
- **Admin Dashboard (`/admin`):** Real-time platform metrics (active users, scheduled rides, total bookings, seat occupancy percentage).
- **Driver KYC Review Queue:** Verification status management allowing administrators to review, approve, or reject commercial driver licenses with recorded feedback.
- **Safety Incident Moderation:** Dispute resolution interface to inspect flagged ride and user reports, review descriptions, and mark incidents as resolved.
- **Account Moderation:** Administrative controls to suspend and restore user accounts.

### 3.4 Authentication & Access Control (RBAC)
- **Role-Based Portals:** Workspaces strictly segregated by persona (`passenger`, `driver`, `admin`).
- **Route Guarding (`RoleGuard`):** Client-side authentication barrier intercepting unauthorized route visits and presenting appropriate login prompts or HTTP 403 Forbidden screens.
- **1-Click Evaluation Credentials:** Login screen (`/login`) equipped with preset credential chips for immediate demonstration:
  - Rider: `rider@routeshare.in` / `Password123!`
  - Driver: `driver@routeshare.in` / `Password123!`
  - Admin: `admin@routeshare.in` / `AdminSecure2026!`
- **User Registration (`/signup`):** Account registration with full name, email format validation, 10-digit Indian phone number formatting, and minimum 6-character password enforcement.

### 3.5 Core Mathematical & Algorithmic Engines
- **Geometric Matching Engine (`features/matching/engine.ts`):**
  - Evaluates driver trajectory polylines against commuter pickup and drop-off coordinates.
  - Computes cross-track projection to determine minimum distance to line segments.
  - Enforces spatial travel ordering: pickup segment index must be less than or equal to drop-off segment index ($i_{pickup} \le i_{dropoff}$). Opposite-direction queries receive an explicit score of `0%`.
  - Calculates detour penalty ($\Delta d = d_{pickup} + d_{dropoff}$) and clamps compatibility score between 50% and 98%.
- **Proportional Fare Allocation (`features/fare/calculator.ts`):**
  - Gross fare calculated as $\text{distance} \times \text{basePricePerKm} \times \text{seats}$.
  - Shared occupancy discount: 5% per additional co-rider, capped at 25%.
  - Transparent 5% platform maintenance contribution fee.
  - 6 Indian mobility tiers with specific base rates (Bike Taxi: ₹25 base / ₹7/km; Namma Auto: ₹35 base / ₹13/km; Mini: ₹60 base / ₹16/km; Sedan: ₹90 base / ₹20/km; SUV: ₹150 base / ₹26/km; Shuttle: ₹50 base / ₹8/km).

---

## 4. Database Integration & Supabase Architecture

### 4.1 Resilient Repository Pattern
Data persistence is abstracted through the `IRideRepository` interface ([`lib/db/repository.ts`](file:///d:/Projects/BuddyRide/lib/db/repository.ts)):
- **Zero-Config Local Fixture Mode:** When external Supabase credentials are not configured, the application operates seamlessly using `LocalFixtureRepository`. This in-memory store is initialized with realistic corridor seed data ([`lib/fixtures/rides.ts`](file:///d:/Projects/BuddyRide/lib/fixtures/rides.ts)), maintaining dynamic state (new rides, bookings, status transitions, notifications) across sessions via `globalThis`.
- **Supabase Cloud Mode:** When `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided in `.env.local`, the repository automatically synchronizes with remote PostgreSQL tables.

### 4.2 Database Schema & Security
The database migration script ([`supabase/migrations/20250101000000_init_schema.sql`](file:///d:/Projects/BuddyRide/supabase/migrations/20250101000000_init_schema.sql)) defines:
- **9 Core Relational Tables:** `profiles`, `vehicles`, `rides`, `ride_waypoints`, `bookings`, `reviews`, `notifications`, `reports`, and `admin_audit_logs`.
- **Relational Integrity:** Foreign key relationships with cascade deletions where appropriate and strict check constraints (e.g., vehicle capacities 1–8, positive seat counts).
- **Performance Indexes:** Covering departure time, trip status, driver ID, booking ride/passenger IDs, and unread notifications.
- **Row Level Security (RLS):** Enabled across all tables. Bookings are visible only to the passenger and driver; rides are publicly discoverable; notifications are accessible only to their recipient.
- **Atomic Concurrency Stored Procedure:** Stored function `confirm_booking(p_booking_id UUID, p_driver_id UUID)` executes row-level locking via `SELECT ... FOR UPDATE OF r`, eliminating race conditions and preventing overbooking during concurrent checkout.
- **Profile Provisioning Trigger:** Trigger `on_auth_user_created` calls `handle_new_user()` to automatically create a profile record when a new user registers in Supabase Auth.

---

## 5. Testing Strategy & Quality Assurance

### 5.1 Test Levels & Assets
1. **Unit Testing (Vitest):**
   - [`tests/unit/fare.test.ts`](file:///d:/Projects/BuddyRide/tests/unit/fare.test.ts): Verifies proportional fare math, co-rider discount tiers, 25% discount cap, zero-distance base fee rules, and multi-seat calculations.
   - [`tests/unit/matching.test.ts`](file:///d:/Projects/BuddyRide/tests/unit/matching.test.ts): Verifies Haversine distances, segment projections, corridor alignment, reverse-direction trip rejection, detour limit enforcement, and seat capacity limits.
2. **Automated Manual Verification Suite:**
   - [`tests/test-all-modules.mjs`](file:///d:/Projects/BuddyRide/tests/test-all-modules.mjs): A comprehensive 1,170-line automated test suite covering 60 manual test cases (TC-M1-01 through TC-M6-10) across Authentication (M1), Search & Matching (M2), Ride Detail & Fare (M3), Booking Lifecycle & OTP (M4), Driver Publishing (M5), and Admin Safety HQ (M6).
3. **Integration & Route Verification:**
   - [`tests/test-lifecycle.mjs`](file:///d:/Projects/BuddyRide/tests/test-lifecycle.mjs): Verifies the end-to-end flow: corridor search $\to$ booking creation $\to$ OTP generation $\to$ driver OTP verification $\to$ trip completion.
   - [`tests/test-routes.mjs`](file:///d:/Projects/BuddyRide/tests/test-routes.mjs): Automated HTTP 200 smoke test verifying accessibility across 13 major application and API routes.

---

## 6. Build, Development & Operational Commands

All commands should be executed from the project root (`d:\Projects\BuddyRide`).

> [!NOTE]
> **Windows Shell Note:** On Windows systems using PowerShell, running `npm` directly may invoke `npm.ps1`, which can be restricted by system execution policies. Use `npm.cmd` instead.

### 6.1 Dependency Installation
Before running the application or its test suites, install dependencies:
```powershell
npm.cmd install
```

### 6.2 Running the Development Server
```powershell
npm.cmd run dev
```
The application will be accessible at `http://localhost:3000`.

### 6.3 Executing Type Checking & Linting
```powershell
# Validate TypeScript strict types across all files
npm.cmd run typecheck

# Validate code style and ESLint rules
npm.cmd run lint
```

### 6.4 Running Automated Tests
```powershell
# Run Vitest unit tests (single run)
npm.cmd test

# Run Vitest in interactive watch mode
npm.cmd run test:watch

# Run the 60-test automated manual verification suite (requires dev server running)
node tests/test-all-modules.mjs

# Run the end-to-end booking and OTP lifecycle test (requires dev server running)
node tests/test-lifecycle.mjs

# Run route smoke verification (requires dev server running)
node tests/test-routes.mjs
```

### 6.5 Production Build & Execution
```powershell
# Create optimized production build
npm.cmd run build

# Start production server
npm.cmd run start
```
