# API Specification & Endpoint Contracts
## RouteShare — REST API Documentation

**Document Version:** 1.0.0  
**Base URL:** `/api`  
**Content-Type:** `application/json`  

---

## 1. Authentication & Session

### `POST /api/auth/login`
- **Description:** Authenticates a user with email and password.
- **Request Body:**
  ```json
  {
    "email": "driver.alex@routeshare.io",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "u-101",
        "email": "driver.alex@routeshare.io",
        "fullName": "Alex Mercer",
        "role": "user",
        "avatarUrl": "/avatars/alex.jpg",
        "ratingAverage": 4.9
      },
      "token": "jwt_token_sample"
    }
  }
  ```

---

## 2. Ride Management & Search

### `GET /api/rides/search`
- **Description:** Searches for compatible journeys using origin, destination, date, and seat count.
- **Query Parameters:**
  - `originLat` (number, required): Pickup latitude (e.g., `37.7749`)
  - `originLng` (number, required): Pickup longitude (e.g., `-122.4194`)
  - `originAddress` (string, optional): Human-readable origin
  - `destLat` (number, required): Drop-off latitude (e.g., `37.3382`)
  - `destLng` (number, required): Drop-off longitude (e.g., `-121.8863`)
  - `destAddress` (string, optional): Human-readable destination
  - `date` (string YYYY-MM-DD, required): Travel date
  - `seats` (number, optional, default: 1): Required seats
  - `maxDetourKm` (number, optional): Maximum tolerable detour km
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalMatches": 2,
      "results": [
        {
          "rideId": "ride-sf-sjc-01",
          "ride": {
            "id": "ride-sf-sjc-01",
            "driver": {
              "id": "u-101",
              "fullName": "Alex Mercer",
              "ratingAverage": 4.95,
              "ratingCount": 42
            },
            "vehicle": {
              "make": "Toyota",
              "model": "Prius Prime",
              "color": "Silver Metallic",
              "licensePlate": "7XYZ892"
            },
            "origin": { "address": "Market St & 4th St, San Francisco", "latitude": 37.7858, "longitude": -122.4065 },
            "destination": { "address": "San Pedro Square, San Jose", "latitude": 37.3364, "longitude": -121.8938 },
            "departureTime": "2026-10-16T08:00:00Z",
            "availableSeats": 3,
            "totalSeats": 4,
            "basePricePerKm": 0.18
          },
          "compatibilityScore": 96,
          "totalDetourKm": 2.4,
          "detourTimeMinutes": 5,
          "passengerDistanceKm": 68.2,
          "estimatedFare": 12.28,
          "platformFee": 0.61,
          "explanation": "Pickup is directly along US-101 S; adds only 2.4 km detour (5 mins)."
        }
      ]
    }
  }
  ```

### `POST /api/rides`
- **Description:** Publishes a new scheduled journey as a driver.
- **Authentication:** Required (User role).
- **Request Body:**
  ```json
  {
    "vehicleId": "v-201",
    "origin": { "address": "Downtown Transit Center", "latitude": 37.7749, "longitude": -122.4194, "city": "San Francisco" },
    "destination": { "address": "Innovation Hub", "latitude": 37.3382, "longitude": -121.8863, "city": "San Jose" },
    "waypoints": [],
    "departureTime": "2026-10-17T07:30:00Z",
    "totalSeats": 3,
    "basePricePerKm": 0.16,
    "maxDetourKm": 12.0,
    "notes": "Non-smoking, commute to tech campus, trunk space for 1 backpack."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": { "id": "ride-sf-sjc-02", "status": "scheduled", "availableSeats": 3 }
  }
  ```

---

## 3. Booking Lifecycle Management

### `POST /api/bookings`
- **Description:** Submits a seat reservation request.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "rideId": "ride-sf-sjc-01",
    "seatsBooked": 1,
    "pickupLocation": { "address": "Caltrain 4th & King", "latitude": 37.7766, "longitude": -122.3949 },
    "dropoffLocation": { "address": "Palo Alto Caltrain", "latitude": 37.4431, "longitude": -122.1649 },
    "segmentDistanceKm": 51.5
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "bookingId": "b-901",
      "status": "pending",
      "fareAmount": 9.27,
      "platformFee": 0.46,
      "totalPaid": 9.73
    }
  }
  ```

### `POST /api/bookings/[id]/accept`
- **Description:** Driver accepts a pending booking; atomically decrements available seats.
- **Authentication:** Required (Driver of the ride).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "bookingId": "b-901", "status": "confirmed", "remainingSeats": 2 }
  }
  ```

### `POST /api/bookings/[id]/reject`
- **Description:** Driver rejects a pending booking request.
- **Authentication:** Required (Driver of the ride).
- **Response (200 OK):**
  ```json
  { "success": true, "data": { "bookingId": "b-901", "status": "rejected" } }
  ```

### `POST /api/bookings/[id]/cancel`
- **Description:** Cancels a pending or confirmed booking.
- **Authentication:** Required (Passenger or Ride Driver).
- **Request Body:**
  ```json
  { "reason": "Meeting rescheduled" }
  ```
- **Response (200 OK):**
  ```json
  { "success": true, "data": { "bookingId": "b-901", "status": "cancelled" } }
  ```

---

## 4. Notifications & Administration

### `GET /api/notifications`
- **Description:** Retrieves notification feed for the authenticated user.
- **Response (200 OK):** Array of notifications with status `read` / `unread`.

### `GET /api/admin/stats`
- **Description:** Retrieves administrative platform metrics.
- **Authentication:** Required (Admin role).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "activeUsers": 1420,
      "activeRides": 84,
      "totalBookings": 3120,
      "occupancyRatePercent": 78.4,
      "flaggedReportsCount": 2
    }
  }
  ```
