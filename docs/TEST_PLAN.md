# Test Plan & Verification Strategy
## RouteShare — Quality Assurance & Testing Specification

**Document Version:** 1.0.0  
**Testing Frameworks:** Vitest (Unit & Algorithm Tests), Playwright (E2E Browser Tests)  

---

## 1. Test Strategy Overview

The testing strategy covers:
1. **Algorithmic Correctness:** The matching, detour, and proportional fare calculations must be 100% deterministic, robust against floating point errors, zero distances, and invalid coordinate ranges.
2. **State Machine Integrity:** The booking lifecycle (`Draft` $\to$ `Pending` $\to$ `Confirmed`/`Rejected`/`Cancelled`) must be strictly verified against race conditions and invalid transitions.
3. **End-to-End User Journeys:** Validated via browser automation across mobile (375px) and desktop (1440px).

---

## 2. Unit Test Matrix (Vitest)

| Test File | Test Case Description | Expected Result |
| :--- | :--- | :--- |
| `matching.test.ts` | Perfectly aligned corridor (direct route overlap) | Compatibility score $\ge 90\%$, detour $\approx 0$ km |
| `matching.test.ts` | Passenger pickup downstream of drop-off (wrong direction) | Incompatible, Score = 0, rejected |
| `matching.test.ts` | Detour exceeds driver's configured `maxDetourKm` | Incompatible, Score = 0, rejected |
| `matching.test.ts` | Ride with 0 available seats remaining | Omitted from search or marked Sold Out |
| `matching.test.ts` | Cross-track distance calculation with valid lat/long | Accurate Haversine distance within 0.1% tolerance |
| `fare.test.ts` | Proportional fare calculation for 50km segment at $0.18/km | Base = $9.00, 5% fee = $0.45, Total = $9.45 |
| `fare.test.ts` | Multi-passenger carpool discount application | 2 passengers $\to$ 10% discount; maximum capped at 25% |
| `fare.test.ts` | Zero distance or negative rate inputs | Throws or gracefully returns minimum base charge |
| `booking.test.ts` | Atomic confirmation decrements available seats | Available seats decreases by `seatsBooked` |
| `booking.test.ts` | Driver rejecting does not alter seat count | Booking status `rejected`, seats unchanged |
| `booking.test.ts` | Double confirmation attempt on last available seat | First succeeds, second errors with `SEAT_CONFLICT` |

---

## 3. End-to-End Test Matrix (Playwright)

1. **Passenger Search Journey:**
   - User inputs "San Francisco" to "San Jose", selects date $\to$ clicks "Search".
   - Verifies cards render with driver names, departure times, and prices.
   - Verifies interactive Leaflet map renders route polylines and markers.
2. **Booking Flow & Optimistic UI:**
   - Passenger selects a journey $\to$ reviews fare breakdown $\to$ clicks "Request 1 Seat".
   - Verifies instant confirmation toast, status shows "Pending Confirmation".
3. **Driver Approval Flow:**
   - Driver navigates to Driver Dashboard $\to$ views incoming pending request $\to$ clicks "Accept".
   - Verifies seat count decrements, passenger booking status transitions to "Confirmed".
4. **Publish Journey Wizard:**
   - Driver completes 4-step wizard with origin, destination, vehicle, rate $\to$ publishes.
   - Verifies new ride appears immediately in driver's upcoming trips and search results.
5. **Responsive Viewport Verification:**
   - Executes at 375px width: verifies hamburger navigation, tabbed map/list switch, touch targets $\ge 44$px.

---

## 4. Verification Protocol

Before declaring any milestone complete, run:
```bash
npm.cmd run lint
npm.cmd run typecheck (or tsc --noEmit)
npm.cmd run test (vitest)
npm.cmd run build
```
