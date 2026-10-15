# High-Level System Design (HLD)
## RouteShare — Algorithmic Carpooling & Smart Ride-Sharing Platform

**Document Version:** 1.0.0  
**Architectural Style:** Modular Full-Stack Web Application (Next.js App Router + PostgreSQL)  

---

## 1. System Overview & Architectural Style

RouteShare is architected as a modular, unified full-stack system using the Next.js App Router paradigm backed by PostgreSQL (via Supabase).

### Why Modular Monolith over Microservices?
For a commuter ride-sharing platform at this scale:
1. **Transaction Integrity:** Booking a seat requires atomic verification against ride seat capacity. In a distributed microservice setup (e.g. separate Ride Service and Booking Service with distributed 2PC or Saga), latency and race conditions multiply. A unified schema with PostgreSQL row-level locks guarantees atomic seat reservation.
2. **Simplified Operational Footprint:** No Kubernetes cluster orchestration, Kafka broker maintenance, or RPC serialization overhead.
3. **Domain Isolation:** Boundaries are enforced logically inside the codebase via feature modules (`features/rides`, `features/matching`, `features/bookings`, `features/fare`, `features/notifications`, `features/admin`) and typed repository adapters.

---

## 2. System Context Diagram (C4 Level 1)

```mermaid
graph TD
    Passenger["👤 Passenger<br/>(Finds, compares, and books shared rides)"]
    Driver["🚗 Driver<br/>(Publishes journeys, accepts bookings)"]
    Admin["🛡️ Administrator<br/>(Moderates reports, monitors health)"]

    subgraph RouteShare["RouteShare System"]
        WebPlatform["RouteShare Web Application<br/>(Next.js App Router, SSR, Route Handlers)"]
    end

    subgraph ExternalServices["External Infrastructure"]
        OSM["OpenStreetMap & Leaflet<br/>(Tile server & Polyline geometry)"]
        Supabase["Supabase Cloud / PostgreSQL<br/>(Auth, RLS, Persistent relational data)"]
    end

    Passenger -->|HTTPS / Browses, Searches, Books| WebPlatform
    Driver -->|HTTPS / Publishes rides, Manages requests| WebPlatform
    Admin -->|HTTPS / Moderates, Audits| WebPlatform

    WebPlatform -->|Geo Tiles & Map rendering| OSM
    WebPlatform -->|Relational Queries & Auth JWT| Supabase
```

---

## 3. Container & Component Architecture (C4 Level 2)

```mermaid
graph TB
    subgraph ClientBrowser["Client Browser (React 19 / Next.js Client Layer)"]
        UI["Design System & Page Shell<br/>(Tailwind CSS, Lucide, Radix Primitives)"]
        ClientState["Client State & Forms<br/>(React Hook Form, Zod, Toast Context)"]
        MapClient["Leaflet Map Component<br/>(Dynamic Client-only Import)"]
    end

    subgraph NextServer["Next.js Application Server (Vercel / Node.js)"]
        AppRouter["App Router & SSR Pages<br/>(Server Components & Dynamic Layouts)"]
        
        subgraph APILayer["API Route Handlers (/api/*)"]
            AuthRoutes["/api/auth/*"]
            RideRoutes["/api/rides/*"]
            BookingRoutes["/api/bookings/*"]
            AdminRoutes["/api/admin/*"]
        end

        subgraph CoreEngines["Domain Services & Engines"]
            MatchingEngine["Route Compatibility Engine<br/>(Haversine, Waypoint insertion, Detour scoring)"]
            FareEngine["Fare Allocation Calculator<br/>(Proportional distance, Cost sharing)"]
            BookingMachine["Booking State Machine<br/>(Concurrency lock, Capacity check)"]
            NotificationService["In-App Notification Dispatcher"]
        end

        subgraph DataAccess["Data Access Layer"]
            RepoAdapter["Repository Layer / DB Client<br/>(Supabase Client & Local Mock Adapter)"]
        end
    end

    subgraph DatabaseLayer["Data Persistence"]
        Postgres["Supabase PostgreSQL<br/>(RLS, Schema constraints, Audit logs)"]
    end

    UI --> AppRouter
    ClientState --> APILayer
    MapClient --> UI

    AppRouter --> APILayer
    RideRoutes --> MatchingEngine
    RideRoutes --> RepoAdapter
    BookingRoutes --> BookingMachine
    BookingRoutes --> FareEngine
    BookingRoutes --> NotificationService
    AdminRoutes --> RepoAdapter

    RepoAdapter --> Postgres
```

---

## 4. Major Request & Response Flows

### 4.1 Ride Search and Algorithmic Matching Flow

```mermaid
sequenceDiagram
    autonumber
    actor Passenger as Passenger (Browser)
    participant API as /api/rides/search
    participant Engine as MatchingEngine
    participant DB as PostgreSQL / DB Repo

    Passenger->>API: GET /api/rides/search?origLat=..&origLng=..&destLat=..&destLng=..&date=..&seats=1
    API->>DB: Query rides departing on date with available_seats >= 1 & status = 'scheduled'
    DB-->>API: Return candidate rides (with route coordinates & waypoints)
    
    loop For each candidate ride
        API->>Engine: evaluateCompatibility(passengerQuery, rideTrajectory)
        Engine->>Engine: Calculate distance from P_orig to Driver Route (Cross-track)
        Engine->>Engine: Calculate distance from P_dest to Driver Route
        Engine->>Engine: Verify spatial ordering (P_orig index < P_dest index)
        Engine->>Engine: Compute detour distance (D_detour = D_new - D_original)
        alt Detour exceeds driver max_detour_km OR Ordering invalid
            Engine-->>API: Match Rejected (Compatibility = 0)
        else Detour within limits
            Engine->>Engine: Compute Compatibility Score [60 - 99%]
            Engine->>Engine: Compute Proportional Estimated Fare
            Engine-->>API: Match Accepted (Score, Detour km, Estimated Fare, Explanation)
        end
    end

    API-->>Passenger: HTTP 200 JSON (List of sorted compatible journeys with explanations)
```

### 4.2 Booking Lifecycle State Machine Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: Passenger selects ride
    Draft --> Pending: Passenger submits seat request
    
    Pending --> Confirmed: Driver accepts request (seats decremented)
    Pending --> Rejected: Driver rejects request OR Capacity exceeded
    Pending --> Cancelled: Passenger cancels before driver decision
    
    Confirmed --> Cancelled: Passenger cancels (>2h notice) OR Driver cancels ride
    Confirmed --> Completed: Trip completed by driver
    
    Rejected --> [*]
    Cancelled --> [*]
    Completed --> Reviewed: Passenger/Driver submits rating
    Reviewed --> [*]
```

---

## 5. Security & Trust Boundaries

1. **Authentication Boundary:** Supabase Auth issues cryptographically signed JWT session cookies. The Next.js middleware and route handlers verify claims prior to executing business operations.
2. **Row Level Security (RLS) Enforcement:**
   - Even if client code is manipulated, PostgreSQL RLS policies prevent a user from reading private contact info of unconfirmed bookings, modifying another driver's ride, or forging admin privileges.
3. **Server-Side Fare & Capacity Enforcement:**
   - The browser never submits the price or seat availability count. The server recalculates passenger fare and checks remaining seats atomically inside a database transaction.
4. **Input Sanitization & Schema Validation:**
   - Every incoming payload passes through strict Zod schemas before touching any domain logic.

---

## 6. Deployment Architecture

```mermaid
graph LR
    subgraph Edge["Global CDN Edge (Vercel Edge Network)"]
        EdgeDNS["DNS / SSL Termination"]
        StaticAssets["Static HTML, CSS, Bundles, Leaflet Assets"]
    end

    subgraph Compute["Serverless Compute Region (us-east-1)"]
        NextServerless["Next.js Node.js Serverless Functions<br/>(SSR, Route Handlers)"]
    end

    subgraph CloudDB["Managed Database (Supabase Cloud)"]
        PostgresInstance["PostgreSQL 15+<br/>Connection Pooling (PgBouncer)<br/>Row Level Security"]
    end

    EdgeDNS --> StaticAssets
    EdgeDNS --> NextServerless
    NextServerless --> PostgresInstance
```

---

## 7. Scalability & Architectural Trade-offs

| Architectural Decision | Chosen Alternative | Alternative Rejected | Justification |
| :--- | :--- | :--- | :--- |
| **Geospatial Matching** | In-Memory Haversine & Cross-Track Waypoint Insertion | PostGIS `ST_Distance` on every query | Next.js serverless functions can evaluate 50 candidate trajectories in $<10$ ms in memory without incurring heavy database CPU locks. PostGIS can be introduced seamlessly as data volume scales. |
| **Data Access Pattern** | Repository Pattern with Local Fixture Fallback | Hardcoded Direct Supabase Calls | Allows instant, flawless local zero-configuration demonstration for interviewers while fully supporting persistent Supabase credentials. |
| **Routing Provider** | Geometry Interpolation + Leaflet Polylines | Paid Google Maps / Mapbox Matrix API | Eliminates fragile API credit dependencies and unexpected billings while providing accurate, interactive route lines and reliable testing. |
