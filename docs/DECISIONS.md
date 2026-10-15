# Architectural Decision Records (ADR)
## RouteShare — Key Technical & Design Decisions

---

### ADR-01: Modular Next.js App Router Monolith vs Microservices
- **Status:** Accepted
- **Context:** Carpooling systems require atomic consistency for seat allocation. Microservices with distributed databases introduce complex consensus mechanisms (2PC/Saga) and significant deployment friction.
- **Decision:** Build a modular full-stack application using Next.js App Router and PostgreSQL. Enforce domain boundaries in code (`features/`) rather than across network boundaries.
- **Consequences:** Low operational latency, atomic database locks, zero microservice networking overhead, and straightforward developer onboarding.

---

### ADR-02: Geospatial Matching Algorithm
- **Status:** Accepted
- **Context:** Relying strictly on city-name string matching fails to match commuters travelling along the same highway corridor. However, requiring paid real-time traffic APIs (Google Distance Matrix / Mapbox) introduces billing fragility and network rate limits for local testing.
- **Decision:** Implement a deterministic geometric matching engine using spherical trigonometry (Haversine formula), cross-track distance, and waypoint insertion detour analysis. Keep the engine behind a clean interface `IRouteMatchingEngine` so commercial routing APIs can be plugged in later if desired.
- **Consequences:** 100% testable, zero external API costs, instant sub-5ms in-memory calculation, fully defensible during interview discussions.

---

### ADR-03: Proportional Cost-Sharing vs Surge Pricing
- **Status:** Accepted
- **Context:** RouteShare is fundamentally a commuter carpooling platform, not a for-profit taxi company.
- **Decision:** Calculate passenger fares strictly proportional to distance travelled relative to the driver's planned route, apply a multi-passenger carpool discount, and itemize a transparent 5% platform maintenance contribution.
- **Consequences:** Fosters passenger trust, eliminates dynamic price gouging, and simplifies fare predictability.

---

### ADR-04: Resilient Data Access with Local Fixture Fallback
- **Status:** Accepted
- **Context:** Evaluators and interviewers must be able to run the application instantly without needing to configure personal Supabase database keys first.
- **Decision:** Implement a dual-mode repository adapter. If `NEXT_PUBLIC_SUPABASE_URL` is configured, it talks to live PostgreSQL; otherwise, it operates against an in-memory/localStorage seed store initialized with realistic commuter data across major metropolitan corridors.
- **Consequences:** Immediate out-of-the-box local testing with zero friction, while preserving full Supabase production capability.
