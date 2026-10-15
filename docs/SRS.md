# Software Requirements Specification (SRS)
## RouteShare — Algorithmic Carpooling & Smart Ride-Sharing Platform

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target:** Production Portfolio / Placement Grade  

---

## 1. Introduction

### 1.1 Purpose and Scope
This document specifies the software requirements for **RouteShare**, a web-based commuter carpooling platform. The system connects drivers who have planned journeys with empty vehicle seats to passengers seeking affordable travel along overlapping routes. RouteShare calculates route compatibility using waypoint detour analysis and divides journey costs proportionally.

### 1.2 Intended Audience
- Engineering interviewers, software architects, and hiring managers evaluating full-stack competency.
- Frontend, backend, and QA engineers implementing and testing system components.

### 1.3 Definitions and Terminology
- **Ride / Journey:** A planned vehicular trip published by a driver, originating at an Origin, terminating at a Destination, with scheduled departure time, available seats, and route waypoints.
- **Booking Request:** An intent registered by a passenger to reserve one or more seats on a compatible ride.
- **Detour Distance:** The additional distance (in kilometers) a driver must travel to accommodate a passenger's pickup and drop-off points compared to the direct driver route.
- **Detour Ratio:** `(Direct Route Distance + Detour Distance) / Direct Route Distance`.
- **Proportional Fare:** The cost assigned to a passenger based on their segment length relative to the overall vehicle route distance, plus a standard 5% platform service maintenance contribution.
- **RLS (Row Level Security):** Fine-grained database authorization policies enforced by PostgreSQL.

### 1.4 Business Problem & Objectives
- Traditional ride-hailing services (e.g., Uber/Lyft) treat each ride as a single-passenger taxi dispatch, increasing urban congestion, single-occupancy vehicle emissions, and per-passenger travel cost.
- Existing carpooling bulletin boards rely solely on exact string matches of city names, failing to match passengers whose pickup and drop-off locations lie directly along an intermediate highway or ring road.
- **RouteShare Objectives:**
  1. Provide geometric route matching based on coordinate proximity, waypoint insertion, and maximum detour tolerance.
  2. Implement an equitable, transparent cost-sharing formula without predatory surge pricing.
  3. Deliver a responsive, accessible, high-performance web interface designed for actual daily commuters.

---

## 2. User Roles and Permissions

Users in RouteShare possess flexible capabilities. An account is not rigidly partitioned into a driver or passenger silo; any verified user may drive one day and ride the next.

### 2.1 Passenger Role
- Discover rides matching origin, destination, departure date, and seat count.
- Filter journeys by detour tolerance, departure window, and price.
- Inspect detailed journey maps, waypoint stops, driver vehicle details, and ratings.
- Request seat reservations and view booking status transitions (Pending $\to$ Confirmed / Rejected / Cancelled).
- Cancel bookings in accordance with the cancellation policy.
- Submit post-trip reviews and ratings for completed trips.

### 2.2 Driver Role
- Register and maintain vehicle details (Make, Model, Year, License Plate, Color, Capacity).
- Publish scheduled journeys with origin, destination, intermediate waypoints, departure time, and base seat price.
- Review incoming passenger booking requests with detour impact and passenger rating.
- Accept or reject booking requests with automatic seat count recalculation.
- Cancel or complete journeys.
- Review passengers following trip completion.

### 2.3 Administrator Role
- View platform-wide operational health metrics (active rides, total bookings, seat occupancy rate).
- Moderate reported users, inappropriate listings, and flagged reviews.
- Suspend or reinstate user accounts.
- Inspect tamper-evident audit logs of administrative actions.

---

## 3. Functional Requirements

### 3.1 Authentication & Profile Management
- **FR-01: User Registration & Session Management**  
  The system shall allow users to register with an email, full name, phone number, and password. Sessions shall be securely managed via encrypted JWT cookies (Supabase Auth / Next.js Auth).
- **FR-02: Profile Customization & Role Switcher**  
  The system shall enable users to update their profile bio, contact details, avatar, and toggle seamlessly between "Passenger View" and "Driver View" without re-authenticating.
- **FR-03: Vehicle Management**  
  The system shall allow drivers to register, edit, and select active vehicles with attributes: make, model, license plate, vehicle year, and maximum passenger capacity.

### 3.2 Driver Journey Management
- **FR-04: Ride Publication**  
  Drivers shall be able to create a journey specifying Origin (lat/lng, address), Destination (lat/lng, address), optional intermediate waypoints, departure date and time, available seats (1 to 6), vehicle, and base fare per kilometer.
- **FR-05: Route Preview & Detour Allowance**  
  During ride creation, the system shall render an interactive map preview showing the planned route geometry and allow the driver to set a maximum acceptable detour limit (e.g., maximum 15 km or 25% extra distance).
- **FR-06: Ride Modification and Cancellation**  
  Drivers may edit departure time or notes if no bookings are confirmed. Drivers may cancel a ride up to 2 hours before departure; cancelling a ride shall automatically transition all associated bookings to `Cancelled` and issue in-app notifications to affected passengers.

### 3.3 Passenger Ride Discovery & Search
- **FR-07: Spatial Ride Search**  
  Passengers shall search for rides by providing pickup location, drop-off location, date of travel, and required seat count.
- **FR-08: Faceted Filtering & Sorting**  
  The system shall support sorting by: lowest price, earliest departure, shortest detour, and highest driver rating. Users shall be able to filter by departure time window (Morning, Afternoon, Evening), verified driver, and maximum allowable detour.
- **FR-09: Map-Centric Results Visualization**  
  The results page shall present a synchronized split view: a list of journey cards and an interactive Leaflet map displaying ride paths, pickup/drop-off pins, and detour indicators.

### 3.4 Route Compatibility & Matching
- **FR-10: Geometric Route Compatibility Engine**  
  The system shall compute the compatibility score $S \in [0, 100]$ of a passenger's query $(P_{orig}, P_{dest})$ against a driver's trajectory $(D_{orig}, W_1, \dots, W_k, D_{dest})$:
  1. Proximity of $P_{orig}$ to the driver's route trajectory (cross-track distance $\le R_{pickup}$, default 5 km).
  2. Proximity of $P_{dest}$ to the driver's route trajectory downstream from $P_{orig}$.
  3. Proper spatial ordering: pickup must occur strictly before drop-off along the journey path.
  4. Detour constraint: Additional distance $\Delta d \le \Delta d_{max}$.
- **FR-11: Match Explanation**  
  The system shall provide a transparent explanation for each match (e.g., *"Pickup is 1.2 km from driver's origin, adding only 6 minutes detour"*).

### 3.5 Booking Lifecycle Management
- **FR-12: Seat Reservation Request**  
  A passenger can request 1 or more seats on an eligible ride with status `Pending`. Seat availability is conditionally held.
- **FR-13: Atomic State Transitions & Concurrency**  
  The booking state machine shall enforce valid transitions:
  $$\text{Draft} \to \text{Pending} \to \{\text{Confirmed}, \text{Rejected}, \text{Cancelled}\} \to \text{Completed}$$
  Seat capacity shall be atomically validated using database locks or transactional checks to eliminate race conditions and overbooking.
- **FR-14: Driver Request Approval/Rejection**  
  Drivers shall receive instant in-app alerts for pending requests and can accept or reject each request with a single action.

### 3.6 Proportional Fare Allocation
- **FR-15: Deterministic Fare Calculator**  
  The passenger fare shall be computed via the deterministic formula:
  $$\text{Passenger Fare} = (\text{Passenger Segment Distance} \times \text{Base Rate/km}) \times (1 - \text{Shared Discount}) + \text{Platform Fee (5\%)}$$
  The driver's earned payout and platform fee must be transparently itemized prior to confirmation.

### 3.7 Notifications, Reviews & Moderation
- **FR-16: In-App Notification Center**  
  Users shall receive notifications for booking submissions, approvals, rejections, cancellations, and ride completion alerts.
- **FR-17: Mutual Ratings & Reviews**  
  Following a completed ride, both driver and passenger may leave a 1-to-5 star rating with a written review. Multiple reviews for the same booking are strictly prohibited.
- **FR-18: Incident Reporting & Admin Moderation**  
  Users may report suspicious rides or misconduct. Administrators have access to an internal dashboard to review flagged items, inspect audit trails, and suspend abusive accounts.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-01: Security & RLS**  
  All database queries shall enforce PostgreSQL Row Level Security (RLS). Service-role keys must never be exposed to the client. Inputs shall be sanitized and validated using Zod schemas on both client and server boundaries.
- **NFR-02: Accessibility (WCAG 2.1 AA)**  
  All interactive controls shall have explicit ARIA labels, minimum contrast ratio of 4.5:1 for body text, full keyboard navigability (Tab, Enter, Space, Escape), and respect `prefers-reduced-motion`.
- **NFR-03: Responsiveness & Viewport Targets**  
  The UI shall adapt seamlessly without horizontal scroll or truncated text across:
  Mobile (320px, 375px, 414px), Tablet (768px), Laptop (1024px), Desktop (1440px+).
- **NFR-04: Performance**  
  - First Contentful Paint (FCP) $\le 1.2$ s on desktop, $\le 2.0$ s on mobile.
  - Interactive map initial load $\le 800$ ms using dynamic asynchronous import.
  - Core search algorithm response $\le 150$ ms for datasets up to 1,000 active listings.
- **NFR-05: Reliability & Resilient Fallback**  
  The system shall function in demo/fixture mode if external Supabase or Map tile connections are unavailable, gracefully indicating status without throwing uncaught exceptions.
- **NFR-06: Code Quality & Strict Typing**  
  TypeScript in strict mode (`noImplicitAny: true`, `strictNullChecks: true`). 100% clean build with zero ESLint errors or unhandled promises.
- **NFR-07: Test Coverage**  
  All algorithmic functions (matching, detour, fare calculation, seat state machine) must have 100% unit test coverage via Vitest.

---

## 5. Acceptance Criteria

| ID | User Journey | Acceptance Condition |
| :--- | :--- | :--- |
| **AC-01** | Search Rides | Searching "Downtown" to "Airport" returns only rides departing on or after the selected date with $\ge$ required seats and detour $\le$ driver's limit. |
| **AC-02** | Prevent Overbooking | If a ride has 2 seats left, two simultaneous requests for 2 seats must result in at most one confirmation; the second request must be rejected with an explicit "Insufficient seats" message. |
| **AC-03** | Order Constraint | If passenger pickup is geographically downstream of passenger drop-off relative to the driver's route, matching score must equal 0 and the ride must be omitted from results. |
| **AC-04** | Cancellation Policy | Passenger cancelling $\ge 24$ hours prior to departure incurs 0% penalty. Cancelling within 2 hours flags late cancellation. |
| **AC-05** | Unauthorized Access | Attempting to access `/admin` or accept a booking belonging to another driver returns HTTP 403 Forbidden with appropriate user notification. |
