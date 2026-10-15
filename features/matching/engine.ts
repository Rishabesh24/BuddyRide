// Route Compatibility & Geometric Matching Engine
import { GeoCoordinate, MatchResult, Ride, SearchQuery } from '../types';
import { calculateProportionalFare } from '../fare/calculator';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great-Circle Distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  coord1: GeoCoordinate,
  coord2: GeoCoordinate
): number {
  if (
    coord1.latitude === coord2.latitude &&
    coord1.longitude === coord2.longitude
  ) {
    return 0;
  }

  const toRad = (degree: number) => (degree * Math.PI) / 180;

  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);
  const deltaLat = toRad(coord2.latitude - coord1.latitude);
  const deltaLng = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Projects a point onto a line segment between A and B, returning minimum distance in km
 */
export function distanceToSegment(
  p: GeoCoordinate,
  a: GeoCoordinate,
  b: GeoCoordinate
): number {
  const l2 = calculateHaversineDistance(a, b);
  if (l2 === 0) return calculateHaversineDistance(p, a);

  // Approximate flat projection for local segments (< 500km)
  const x = (p.longitude - a.longitude) * Math.cos(((a.latitude + b.latitude) / 2) * Math.PI / 180);
  const y = p.latitude - a.latitude;
  const dx = (b.longitude - a.longitude) * Math.cos(((a.latitude + b.latitude) / 2) * Math.PI / 180);
  const dy = b.latitude - a.latitude;

  const t = Math.max(0, Math.min(1, (x * dx + y * dy) / (dx * dx + dy * dy)));
  
  const proj: GeoCoordinate = {
    latitude: a.latitude + t * (b.latitude - a.latitude),
    longitude: a.longitude + t * (b.longitude - a.longitude),
  };

  return calculateHaversineDistance(p, proj);
}

/**
 * Evaluates route compatibility for a passenger query against a driver's scheduled journey.
 */
export function evaluateRideCompatibility(
  query: SearchQuery,
  ride: Ride
): MatchResult {
  const pOrig: GeoCoordinate = { latitude: query.originLat, longitude: query.originLng };
  const pDest: GeoCoordinate = { latitude: query.destLat, longitude: query.destLng };

  // 1. Build driver polyline trajectory
  const trajectory: GeoCoordinate[] = [
    { latitude: ride.origin.latitude, longitude: ride.origin.longitude },
    ...ride.waypoints
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((w) => ({ latitude: w.latitude, longitude: w.longitude })),
    { latitude: ride.destination.latitude, longitude: ride.destination.longitude },
  ];

  // 2. Direct passenger segment distance
  const passengerDistanceKm = calculateHaversineDistance(pOrig, pDest);

  // 3. Find closest segment index for pickup and dropoff
  let pickupMinDist = Infinity;
  let pickupSegmentIndex = 0;

  for (let i = 0; i < trajectory.length - 1; i++) {
    const d = distanceToSegment(pOrig, trajectory[i], trajectory[i + 1]);
    if (d < pickupMinDist) {
      pickupMinDist = d;
      pickupSegmentIndex = i;
    }
  }

  let dropoffMinDist = Infinity;
  let dropoffSegmentIndex = 0;

  for (let i = 0; i < trajectory.length - 1; i++) {
    const d = distanceToSegment(pDest, trajectory[i], trajectory[i + 1]);
    if (d < dropoffMinDist) {
      dropoffMinDist = d;
      dropoffSegmentIndex = i;
    }
  }

  // 4. Direction & Ordering Check:
  // Pickup must be at or before dropoff segment. If in the same segment, verify projection progression.
  let isOrderingValid = pickupSegmentIndex <= dropoffSegmentIndex;

  if (pickupSegmentIndex === dropoffSegmentIndex) {
    const segStart = trajectory[pickupSegmentIndex];
    const dOrigFromStart = calculateHaversineDistance(segStart, pOrig);
    const dDestFromStart = calculateHaversineDistance(segStart, pDest);
    if (dOrigFromStart >= dDestFromStart) {
      isOrderingValid = false;
    }
  }

  // 5. Calculate Detour Distance:
  // Original distance of driver's route
  let originalDistance = 0;
  for (let i = 0; i < trajectory.length - 1; i++) {
    originalDistance += calculateHaversineDistance(trajectory[i], trajectory[i + 1]);
  }

  // Detour is approximated by the deviation required to divert to pOrig and pDest
  const pickupDetourKm = Math.round(pickupMinDist * 1.8 * 10) / 10;
  const dropoffDetourKm = Math.round(dropoffMinDist * 1.8 * 10) / 10;
  const totalDetourKm = Math.round((pickupDetourKm + dropoffDetourKm) * 10) / 10;
  const detourTimeMinutes = Math.max(1, Math.round(totalDetourKm * 1.5)); // ~40km/h urban detour speed

  // Max allowable detour threshold
  const maxAllowedDetour = query.maxDetourKm ?? ride.maxDetourKm ?? 15.0;
  const isDetourAcceptable = totalDetourKm <= maxAllowedDetour;

  // Seat availability check
  const requestedSeats = query.seats ?? 1;
  const hasAvailableSeats = ride.availableSeats >= requestedSeats;

  const isCompatible = isOrderingValid && isDetourAcceptable && hasAvailableSeats;

  // 6. Compute Compatibility Score (0 - 99%)
  let compatibilityScore = 0;
  let explanation = '';

  if (!isOrderingValid) {
    compatibilityScore = 0;
    explanation = 'Incompatible direction: Trip travels opposite to the passenger route.';
  } else if (!hasAvailableSeats) {
    compatibilityScore = 0;
    explanation = 'Ride is fully booked for requested seat count.';
  } else if (!isDetourAcceptable) {
    compatibilityScore = 0;
    explanation = `Detour of ${totalDetourKm} km exceeds maximum limit of ${maxAllowedDetour} km.`;
  } else {
    // Score based on detour efficiency (50 to 98)
    const detourPenalty = Math.min(45, (totalDetourKm / maxAllowedDetour) * 45);
    compatibilityScore = Math.max(50, Math.round(98 - detourPenalty));

    explanation = `Pickup is ${pickupDetourKm} km from route; adds ~${totalDetourKm} km detour (${detourTimeMinutes} min) with ${ride.availableSeats} seats open.`;
  }

  // 7. Calculate Proportional Fare
  const fareBreakdown = calculateProportionalFare({
    segmentDistanceKm: passengerDistanceKm,
    basePricePerKm: ride.basePricePerKm,
    confirmedPassengers: (ride.totalSeats - ride.availableSeats) + requestedSeats,
    requestedSeats,
  });

  return {
    rideId: ride.id,
    ride,
    compatibilityScore,
    pickupDetourKm,
    dropoffDetourKm,
    totalDetourKm,
    detourTimeMinutes,
    passengerDistanceKm: Math.round(passengerDistanceKm * 10) / 10,
    estimatedFare: fareBreakdown.fareAmount,
    platformFee: fareBreakdown.platformFee,
    totalCharge: fareBreakdown.totalPaid,
    isCompatible,
    explanation,
  };
}
