# UI/UX Design System & Experience Plan
## RouteShare — Mobility Design Specification

**Document Version:** 1.0.0  
**Design Philosophy:** Purposeful Commuter Utility over Generic AI Clichés  
**Target Viewports:** 320px, 375px, 414px, 768px, 1024px, 1440px+  

---

## 1. Product Design Principles

1. **Utility First, Not SaaS Fluff:** Commuters care about: *Where are they picking me up? How much extra time does it add? How much am I paying? Who is the driver?* Every element on screen must directly answer a commuter's question.
2. **Restrained, Professional Mobility Aesthetic:** 
   - No purple gradients, no multi-colored pastel shadows, no decorative blobs.
   - Grounded palette: crisp slate backgrounds, deep graphite headings, high-contrast accessible typography, and a signature **Mobility Teal (`#0D9488`) / Emerald (`#059669`)** accent representing shared transit and efficiency.
3. **Information Density with Breathing Room:** Structured data (departure times, seats, route stops, price breakdown) presented in clear tabular and badge layouts with consistent 8pt spacing grid.
4. **Transparent Route Visualization:** Real interactive maps with accurate polylines, start/stop pins, and detour waypoints. Never use static fake map images or random placeholder routes.
5. **Deterministic State Feedback:** Interactive controls always show instant loading skeletons, disabled states with tooltips, clear error messages, and unambiguous confirmation toasts.

---

## 2. Design Tokens & Color Palette

### 2.1 Color Tokens
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;    /* Slate-50: Crisp warm-neutral background */
  --bg-tertiary: #F1F5F9;     /* Slate-100: Card headers and subtle grouping */
  --bg-subtle: #E2E8F0;       /* Slate-200: Dividers, borders, muted elements */

  /* Text & Typography */
  --text-primary: #0F172A;    /* Slate-900: High-contrast primary headings */
  --text-secondary: #334155;  /* Slate-700: Body paragraphs and labels */
  --text-muted: #64748B;      /* Slate-500: Timestamps, captions, subtext */
  --text-inverse: #FFFFFF;    /* Pure white on dark accents */

  /* Primary Accent: Mobility Teal */
  --accent-primary: #0D9488;  /* Teal-600: Primary CTAs, active route lines */
  --accent-hover: #0F766E;    /* Teal-700: Active hover states */
  --accent-light: #CCFBF1;    /* Teal-100: Badges, highlights, selected items */
  --accent-dark: #115E59;     /* Teal-800: Deep brand emphasis */

  /* Secondary Accent: Commuter Slate / Navy */
  --brand-navy: #1E293B;      /* Slate-800: Driver cards, badges, navbar */
  --brand-navy-light: #334155;

  /* Semantic Feedback */
  --success: #16A34A;         /* Green-600: Confirmed bookings, seat available */
  --success-bg: #DCFCE7;
  --warning: #D97706;         /* Amber-600: Pending requests, detours > 15m */
  --warning-bg: #FEF3C7;
  --danger: #DC2626;          /* Red-600: Cancelled rides, errors */
  --danger-bg: #FEE2E2;
  --info: #0284C7;            /* Sky-600: Information alerts */
  --info-bg: #E0F2FE;

  /* Borders & Shadows */
  --border-color: #E2E8F0;    /* Slate-200 */
  --border-focus: #0D9488;    /* Ring on focus-visible */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

### 2.2 Typography Scale
- **Display H1:** 36px / 1.25 / Bold (`tracking-tight`) — Landing hero & major pages
- **Page H2:** 28px / 1.3 / SemiBold — Section titles, modal headers
- **Card H3:** 20px / 1.4 / SemiBold — Journey titles, vehicle cards
- **Section Subhead:** 16px / 1.5 / Medium — Form groups, filter labels
- **Body Regular:** 14px / 1.5 / Regular — Descriptions, instructions
- **Caption / Meta:** 12px / 1.4 / Medium — Timestamps, badges, seat counter

---

## 3. Information Architecture & Navigation

```
RouteShare App Shell
├── Top Navigation Bar
│   ├── Wordmark ("RouteShare" with interconnected route icon)
│   ├── Mode Switcher Pill ("Find a Ride" | "Offer a Ride")
│   ├── Quick Links ("Search Rides", "My Bookings", "Driver Trips")
│   ├── In-App Notification Bell (unread count badge, popup center)
│   ├── User Avatar & Role Menu (Profile, Vehicle settings, Admin, Sign Out)
│   └── Mobile Hamburger Drawer (Full responsive navigation)
│
├── Main Viewport Area
│   ├── Landing Page (/)
│   ├── Search & Results (/rides?from=...&to=...&date=...)
│   ├── Ride Details (/rides/[id])
│   ├── Driver Dashboard (/driver)
│   ├── Publish Ride Wizard (/driver/publish)
│   ├── Passenger Bookings (/bookings)
│   ├── User Profile & Vehicles (/profile)
│   └── Admin Moderation (/admin)
│
└── Footer
    ├── System Status indicator (Offline/Local/Live Supabase)
    ├── Commuter Safety Policy & Terms
    └── Technology & Portfolio Architecture links
```

---

## 4. Key Component Inventory

1. **`RouteTimeline` Component:**
   - Displays a connected vertical or horizontal timeline with green origin dot, intermediate grey waypoint diamonds with detour offset minutes, and red/teal destination pin.
2. **`JourneyCard` Component:**
   - Visual card with driver avatar, name, verification badge, departure time, origin $\to$ destination, available seat counter pill (e.g. `3 seats left`), compatibility score badge (`94% match`), and calculated fare (`$14.50`).
3. **`InteractiveRouteMap` (Leaflet Wrapper):**
   - Renders OpenStreetMap tiles, custom SVG markers for pickup, drop-off, driver origin, driver destination, and smooth animated polyline highlighting passenger segment vs. full driver route.
4. **`FareBreakdownModal` Component:**
   - Transparent table displaying: Base distance, passenger segment km, rate per km, shared carpool discount (15-30%), platform contribution ($1.50), and total due.
5. **`SeatCapacityPicker` Component:**
   - Number stepper with accessible decrement/increment buttons, warning when selected seats approach maximum capacity.
6. **`NotificationPopover` Component:**
   - Interactive popover with read/unread markers, filtering (All, Bookings, System), and direct click-through to relevant ride or booking.

---

## 5. Screen-by-Screen UX Specifications

### 5.1 Landing Page (`/`)
- **Hero Section:**
  - High-impact headline: *"Share the Journey. Split the Cost. Cut the Commute."*
  - Contextual commuter search bar floating over an interactive animated route route-mesh canvas.
  - Search fields: *Pickup City/Address*, *Drop-off City/Address*, *Departure Date*, *Passengers*.
- **Live Ride Highlights:**
  - Curated active commuter corridors (e.g. San Francisco $\to$ San Jose, Seattle $\to$ Bellevue, Boston $\to$ Cambridge) with real-time seat counts and transparent prices.
- **How RouteShare Works (Passenger vs Driver):**
  - 3-step interactive tabs showing how route matching evaluates waypoint insertion, preventing annoying detours.
- **Safety & Community Guarantee:**
  - Verified profiles, mutual rating transparency, and automated seat capacity locks.

### 5.2 Search & Results Screen (`/rides`)
- **Dual-Pane Split Layout (Desktop):**
  - Left pane (45% width): Search refine bar, active filters (Price $\le \$30$, Max Detour $\le 10$ km, Morning 6AM-10AM), sort dropdown, and scrollable list of `JourneyCard` components.
  - Right pane (55% width, sticky): Full-height Leaflet interactive map with pins for all filtered rides. Clicking a card pans and zooms the map to that route polyline.
- **Mobile Responsive Behavior:**
  - Segmented toggle at bottom: `[ List View (5) ]` | `[ Map View ]`.
  - Floating bottom sheet when selecting a ride pin on map view.

### 5.3 Ride Details & Booking (`/rides/[id]`)
- Driver bio, verified phone/email badges, vehicle photo/details, luggage and pet preferences.
- Full route timeline with exact addresses and estimated arrival times at each waypoint.
- Interactive seat selector and real-time updating fare calculator breakdown.
- Immediate "Request Seat" CTA with instant optimistic UI update, transition to `Pending`, and confirmation toast.

### 5.4 Driver Dashboard (`/driver`)
- Quick glance cards: Active Rides, Upcoming Departures, Pending Requests requiring action.
- **Actionable Booking Requests Section:**
  - List of pending passenger requests with passenger name, rating, requested seats, pickup detour km, and one-click `Accept` or `Decline` buttons.
- Quick link to Publish Ride Wizard.

### 5.5 Publish Ride Wizard (`/driver/publish`)
- Step 1: Route Setup (Origin, Destination, Optional Waypoints, Interactive preview map with live distance & duration calculation).
- Step 2: Schedule & Vehicle (Date, Departure Time, Vehicle selection or instant vehicle addition).
- Step 3: Pricing & Seats (Available seats, recommended rate/km based on fuel economics, maximum acceptable detour in km/min).
- Step 4: Summary & Publish.

### 5.6 Booking Management (`/bookings`)
- Filter tabs: `Upcoming`, `Pending Confirmation`, `Completed`, `Cancelled`.
- Each booking card provides trip summary, status badge (amber for Pending, green for Confirmed, red for Cancelled), driver contact info, and clear cancellation trigger with refund/policy explanation.

### 5.7 In-App Notifications & Admin Moderation (`/admin`)
- Notification dropdown in header with real-time badge.
- Admin dashboard displaying platform statistics, reported rides table with resolve/dismiss actions, and user suspension controls.

---

## 6. Accessibility & Responsive Targets

| Screen Width | Target Device | Layout Strategy |
| :--- | :--- | :--- |
| **320px - 414px** | Mobile phones | Single-column stacked, sticky bottom navigation bar, map in dedicated tab/sheet. |
| **768px** | iPad / Tablets | Fluid 2-column cards, collapsible sidebar filter, compact header. |
| **1024px - 1440px+** | Desktop / Laptops | Split-pane search/map layout, full horizontal navigation bar, rich hover states. |

- High contrast minimum 4.5:1 ratio verified across all text tokens.
- All buttons have minimum touch target of 44x44px on mobile devices.
- Focus rings (`ring-2 ring-teal-600 ring-offset-2`) on all interactive focusable elements.
