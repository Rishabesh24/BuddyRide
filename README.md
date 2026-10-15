# RouteShare — Algorithmic Carpooling & Smart Ride-Sharing Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Tests_Passing-6E9F18?logo=vitest)](https://vitest.dev/)

> **A production-grade, portfolio-worthy web platform connecting commuters along overlapping transit corridors with geometric detour matching and deterministic proportional fare allocation.**

---

## 1. Executive Summary & Product Vision

Traditional ride-hailing platforms (Uber, Lyft) treat every trip as an isolated taxi dispatch, compounding urban traffic congestion and increasing passenger fares through opaque dynamic surge algorithms. Bulletin-board carpooling solutions, conversely, rely on rudimentary city name string matching, failing to pair commuters whose pickup or drop-off points lie directly along the highway corridor.

**RouteShare** resolves this by modeling carpooling as shared highway trajectories:
1. **Geometric Trajectory Matching:** Employs spherical trigonometry (Haversine great-circle distance) and cross-track segment projections to match intermediate pickup/drop-off points.
2. **Configurable Detour Tolerance:** Eliminates disruptive detours by validating additional distance ($\Delta d \le \Delta d_{max}$) and strict spatial direction ordering.
3. **Transparent Proportional Fares:** Replaces predatory surge pricing with a deterministic formula allocating vehicle operating costs strictly proportional to segment distance traveled, with shared discounts for higher vehicle occupancy.
4. **Resilient Architecture:** Operates with zero-config local seed fixtures for instant demonstration while providing a PostgreSQL schema with Row Level Security (RLS) and stored procedures for atomic seat concurrency.

---

## 2. Core Architecture & System Context

RouteShare is architected as a modular full-stack application leveraging the Next.js App Router and PostgreSQL:

```
[Passenger Browser]         [Driver Browser]         [Admin Portal]
        │                          │                       │
        └──────────────────────────┼───────────────────────┘
                                   │ HTTPS
                                   ▼
                ┌─────────────────────────────────────┐
                │   Next.js 15 App Router Server     │
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

## 3. Key Algorithmic Implementations

### 3.1 Geometric Route Compatibility Engine (`features/matching/engine.ts`)
Given driver trajectory waypoints $W = [D_{orig}, w_1, \dots, D_{dest}]$ and passenger query $(P_{orig}, P_{dest})$:
1. **Cross-Track Distance Projection:** Projects pickup point $P_{orig}$ and drop-off point $P_{dest}$ onto driver route segments using flat-Earth projection approximations for local distances:
   $$t = \text{clamp}\left(0, 1, \frac{(\vec{P} - \vec{A}) \cdot (\vec{B} - \vec{A})}{\|\vec{B} - \vec{A}\|^2}\right)$$
2. **Spatial Ordering Validation:** Verifies that the pickup projection index $i$ occurs strictly before the drop-off projection index $j$ ($i \le j$). Reverse-direction queries are rejected with an explicit score of `0%`.
3. **Detour Calculation:**
   $$\Delta d = D_{\text{new}} - D_{\text{original}}$$
   If $\Delta d > \text{MaxDetourKm}$, the ride is rejected. Otherwise, compatibility score evaluates to:
   $$\text{Score} = \max\left(50, 98 - 45 \times \frac{\Delta d}{\text{MaxDetourKm}}\right)$$

### 3.2 Proportional Fare Allocation (`features/fare/calculator.ts`)
$$\text{Gross Fare} = \text{Segment Distance (km)} \times \text{Base Price/km} \times \text{Seats}$$
$$\text{Carpool Discount} = \min(0.25, 0.05 \times (\text{Co-Riders} - 1))$$
$$\text{Subtotal} = \max(\$2.50 \times \text{Seats}, \text{Gross Fare} \times (1 - \text{Carpool Discount}))$$
$$\text{Platform Maintenance Contribution} = \text{round}(\text{Subtotal} \times 0.05, 2)$$
$$\text{Total Passenger Charge} = \text{Subtotal} + \text{Platform Fee}$$

---

## 4. Primary User Journeys

### 1. Passenger Ride Discovery & Split Map View (`/rides`)
- Dual-pane layout on desktop: scrollable faceted results on the left, synchronized Leaflet OpenStreetMap on the right.
- Real-time filters: Price cap, time of day (Morning / Afternoon / Evening), sort by Compatibility Score, Lowest Price, Shortest Detour, or Earliest Departure.
- Responsive mobile switch between list view and map view with zero horizontal overflow.

### 2. Ride Detail & Booking Reservation (`/rides/[id]`)
- Full route timeline featuring origin, intermediate waypoints, and drop-off destinations.
- Interactive seat capacity picker with dynamic live updating fare calculation table.
- Verified driver biography, review count, rating average, and vehicle specifications (Make, Model, License Plate, Year, Color).
- Instant seat reservation submission with optimistic state updates and in-app toast alerts.

### 3. Driver Dashboard & Request Center (`/driver`)
- Live summary of scheduled journeys and passenger manifests.
- **Actionable Booking Request Queue:** Displays incoming passenger requests, detour impact in kilometers, driver earnings payout, and 1-click **Accept Passenger** / **Decline** actions.
- Automatic atomic seat decrementing upon acceptance.

### 4. Guided Ride Publishing Wizard (`/driver/publish`)
- Step-by-step guided wizard:
  1. Route coordinates, addresses, and highway waypoints with interactive map preview.
  2. Travel date, departure time, and vehicle selection.
  3. Seat capacity, base price per km, and maximum acceptable detour threshold.
  4. Real-time trip economics summary and publication.

### 5. Passenger Booking Manager (`/bookings`)
- Filter tabs for *All Reservations*, *Confirmed*, *Pending Confirmation*, and *Cancelled*.
- Pickup coordinates, departure times, driver vehicle details, and cancellation action adhering to the 2-hour policy.

### 6. Profile & Vehicle Garage (`/profile`)
- Personal commuter bio, rating stats, contact details, and vehicle registration manager.

### 7. Administrative Moderation (`/admin`)
- Platform operational metrics (active commuters, active scheduled rides, network occupancy rate %, open reports).
- Incident resolution queue with action triggers.

---

## 5. Technology Stack & Directory Structure

```
RideSharing/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Commuter Landing Page
│   ├── rides/page.tsx            # Dual-Pane Search & Interactive Map
│   ├── rides/[id]/page.tsx       # Ride Detail & Fare Calculator
│   ├── driver/page.tsx           # Driver Dashboard & Request Manager
│   ├── driver/publish/page.tsx   # Ride Publication Guided Wizard
│   ├── bookings/page.tsx         # Passenger Bookings Lifecycle Manager
│   ├── profile/page.tsx          # Profile & Vehicle Garage
│   ├── admin/page.tsx            # Operational Admin & Moderation Queue
│   ├── not-found.tsx             # Polished 404 handler
│   ├── layout.tsx                # App Shell with ToastProvider & Navbar
│   ├── globals.css               # Design Tokens & Leaflet CSS
│   └── api/                      # Next.js Route Handlers
│       ├── rides/                # Search & List Rides
│       ├── bookings/             # Booking Lifecycle (Accept, Reject, Cancel)
│       ├── notifications/        # In-App Notifications
│       └── admin/                # Stats & Safety Reports
├── components/
│   ├── ui/                       # Button, Badge, Card, Input, Modal, Timeline, Toast
│   ├── layout/                   # Navbar, Footer
│   └── map/                      # Leaflet OpenStreetMap Dynamic Client Wrapper
├── features/
│   ├── types.ts                  # TypeScript Domain Models & Contracts
│   ├── matching/                 # Haversine, Cross-Track, Detour Scoring Engine
│   └── fare/                     # Proportional Distance Fare Calculator
├── lib/
│   ├── db/repository.ts          # Resilient Dual-Mode Repository Pattern
│   ├── fixtures/rides.ts         # High-Fidelity Commuter Seed Data
│   └── utils.ts                  # Formatting Helpers (Currency, Distance, Dates)
├── supabase/
│   └── migrations/               # PostgreSQL DDL, RLS Policies, Stored Procedures
├── tests/
│   ├── unit/                     # Vitest Matching & Fare Engine Unit Tests
│   ├── test-routes.mjs           # HTTP 200 Route Verification Script
│   └── test-lifecycle.mjs        # End-to-End Booking Lifecycle Integrity Script
└── docs/                         # Complete Engineering Documentation
    ├── SRS.md                    # Software Requirements Specification
    ├── UI_UX_PLAN.md             # Design Tokens & Wireframes
    ├── HLD.md                    # High-Level Architecture & 5 Mermaid Diagrams
    ├── LLD.md                    # Low-Level Design, Domain Schemas & Math
    ├── ARCHITECTURE.md           # Dependency Boundaries
    ├── API_SPEC.md               # REST Endpoint Contracts
    ├── TEST_PLAN.md              # Quality Assurance Strategy
    ├── DECISIONS.md              # Architectural Decision Records (ADRs)
    └── ROADMAP.md                # Milestone Tracking
```

---

## 6. Getting Started & Local Reproduction

### Prerequisites
- Node.js `v20.0.0` or higher (`v24.15.0` recommended)
- `npm` `v10.0.0` or higher

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/routeshare.git
   cd routeshare
   ```

2. **Install dependencies:**
   ```bash
   npm.cmd install
   ```

3. **Run unit tests:**
   ```bash
   npm.cmd run test
   ```

4. **Run TypeScript check:**
   ```bash
   npm.cmd run typecheck
   ```

5. **Start development server:**
   ```bash
   npm.cmd run dev
   ```
   Open `http://localhost:3000` in your browser.

6. **Production build:**
   ```bash
   npm.cmd run build
   npm.cmd run start
   ```

---

## 7. Technical Interview Talking Points

During placement and senior software engineering interviews, this project serves as a concrete defense of full-stack engineering fundamentals:

1. **Monolith vs Microservices Trade-off:** Defend why seat reservation requires PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) to avoid distributed 2PC or Saga complexity for concurrent seat allocation.
2. **Algorithmic Modeling:** Explain the use of the Haversine formula, projection onto route line segments, and waypoint insertion detour bounds over simple string matching.
3. **Resilient Architecture:** Discuss the repository adapter pattern (`IRideRepository`) allowing zero-config local evaluation with realistic corridor fixtures while supporting production Supabase PostgreSQL and Row Level Security (RLS).
4. **State Machine Integrity:** Defend the booking lifecycle (`Pending` $\to$ `Confirmed` / `Rejected` / `Cancelled`) and how seat inventory remains consistent under cancellation or driver refusal.
