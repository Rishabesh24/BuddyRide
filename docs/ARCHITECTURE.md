# Repository Architecture & Dependency Boundaries
## RouteShare — Structural Blueprint

**Document Version:** 1.0.0  

---

## 1. Directory Tree & Feature-Oriented Structure

The application adopts a feature-oriented modular architecture aligned with Next.js App Router conventions:

```
RideSharing/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route grouping
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (passenger)/              # Passenger domain views
│   │   ├── rides/page.tsx        # Search & Results (split map view)
│   │   ├── rides/[id]/page.tsx   # Ride detail & booking request modal
│   │   └── bookings/page.tsx     # Passenger booking management
│   ├── (driver)/                 # Driver domain views
│   │   ├── driver/page.tsx       # Driver dashboard & request manager
│   │   └── driver/publish/page.tsx # Guided ride publishing wizard
│   ├── profile/page.tsx          # User profile & vehicle management
│   ├── admin/page.tsx            # Protected administrative moderation
│   ├── api/                      # Next.js Route Handlers
│   │   ├── auth/
│   │   ├── rides/
│   │   │   ├── route.ts          # Create & list rides
│   │   │   ├── search/route.ts   # Algorithmic ride search
│   │   │   └── [id]/route.ts     # Get ride & update/cancel
│   │   ├── bookings/
│   │   │   ├── route.ts          # Create booking request
│   │   │   └── [id]/
│   │   │       ├── accept/route.ts
│   │   │       ├── reject/route.ts
│   │   │       └── cancel/route.ts
│   │   ├── vehicles/route.ts
│   │   ├── notifications/route.ts
│   │   └── admin/
│   │       ├── stats/route.ts
│   │       └── reports/route.ts
│   ├── layout.tsx                # Root layout with Nav, Providers, Footer
│   ├── page.tsx                  # Landing page with hero & commuter search
│   ├── not-found.tsx             # Polished 404 handler
│   └── globals.css               # Tailwind CSS & design tokens
│
├── components/                   # Shared UI primitives & layouts
│   ├── ui/                       # Accessible buttons, dialogs, inputs, badges
│   ├── layout/                   # Header, Mobile Nav Drawer, Footer
│   ├── map/                      # Leaflet dynamic client wrapper & pins
│   └── feedback/                 # Toast provider, loading skeletons, error states
│
├── features/                     # Isolated Domain Business Logic
│   ├── auth/                     # Auth context, session helpers, role guards
│   ├── rides/                    # Ride validators, formatters, list helpers
│   ├── matching/                 # Haversine, cross-track, detour compatibility engine
│   ├── fare/                     # Deterministic proportional cost calculator
│   ├── bookings/                 # Seat state machine & capacity validation
│   ├── notifications/            # In-app notification state manager
│   └── admin/                    # Audit logging & moderation rules
│
├── lib/                          # Infrastructure & Shared Utilities
│   ├── db/                       # Supabase client & in-memory fixture repository
│   ├── fixtures/                 # Realistic seed data (corridors, drivers, rides)
│   ├── utils.ts                  # Tailwind clsx/cn, date/currency formatters
│   └── validation/               # Zod schemas for all client/server payloads
│
├── supabase/                     # Database Migrations & Seed Scripts
│   ├── migrations/
│   │   └── 20250101000000_init_schema.sql
│   └── seed.sql
│
├── tests/                        # Automated Tests
│   ├── unit/                     # Vitest matching, detour, fare calculation tests
│   └── e2e/                      # Playwright user journeys
│
└── docs/                         # System Documentation
```

---

## 2. Dependency Inversion & Repository Pattern

To ensure seamless operation during local development, interviews, and automated testing, data access is decoupled behind a repository interface:

```
[UI Component / Route Handler]
           │
           ▼
 [IRideRepository Interface]
     │                 │
     ▼                 ▼
[SupabaseRepo]    [LocalFixtureRepo]
 (When DB env      (When offline or
  is configured)    running mock suite)
```

- When `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided in `.env.local`, the system queries the live Supabase PostgreSQL database.
- When running without external credentials, the system seamlessly uses the typed `LocalFixtureRepo` initialized with realistic commuter routes across major travel corridors (e.g. San Francisco Bay Area, Boston Metro, Pacific Northwest).
- Zero silent failures: the UI clearly displays the active persistence mode in the header/footer status pill.
