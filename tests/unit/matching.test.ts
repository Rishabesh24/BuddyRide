import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, distanceToSegment, evaluateRideCompatibility } from '@/features/matching/engine';
import { Ride, SearchQuery } from '@/features/types';

describe('Geospatial Matching Engine', () => {
  it('calculates zero distance for identical coordinates', () => {
    const point = { latitude: 37.7749, longitude: -122.4194 };
    expect(calculateHaversineDistance(point, point)).toBe(0);
  });

  it('calculates known distance between SF and San Jose (~67-75 km)', () => {
    const sf = { latitude: 37.7749, longitude: -122.4194 };
    const sj = { latitude: 37.3382, longitude: -121.8863 };
    const dist = calculateHaversineDistance(sf, sj);
    expect(dist).toBeGreaterThan(65);
    expect(dist).toBeLessThan(75);
  });

  it('calculates distance to segment properly', () => {
    const a = { latitude: 37.0, longitude: -122.0 };
    const b = { latitude: 38.0, longitude: -122.0 };
    const pointOnLine = { latitude: 37.5, longitude: -122.0 };
    const dist = distanceToSegment(pointOnLine, a, b);
    expect(dist).toBeCloseTo(0, 1);
  });

  const baseRide: Ride = {
    id: 'test-ride-01',
    driverId: 'driver-1',
    vehicleId: 'vehicle-1',
    origin: { address: 'SF', city: 'San Francisco', latitude: 37.78, longitude: -122.41 },
    destination: { address: 'SJ', city: 'San Jose', latitude: 37.33, longitude: -121.89 },
    waypoints: [
      {
        id: 'w-1',
        rideId: 'test-ride-01',
        address: 'Palo Alto',
        latitude: 37.44,
        longitude: -122.16,
        orderIndex: 0,
        stopType: 'stopover',
      },
    ],
    departureTime: '2026-10-16T08:00:00Z',
    totalSeats: 3,
    availableSeats: 2,
    basePricePerKm: 0.18,
    totalDistanceKm: 75,
    estimatedDurationMinutes: 60,
    maxDetourKm: 10,
    status: 'scheduled',
    createdAt: '2026-10-15T00:00:00Z',
  };

  it('accepts perfectly aligned commuter query', () => {
    const query: SearchQuery = {
      originLat: 37.77,
      originLng: -122.40, // Near SF
      destLat: 37.44,
      destLng: -122.16, // Near Palo Alto
      date: '2026-10-16',
      seats: 1,
    };

    const result = evaluateRideCompatibility(query, baseRide);
    expect(result.isCompatible).toBe(true);
    expect(result.compatibilityScore).toBeGreaterThan(70);
    expect(result.totalDetourKm).toBeLessThanOrEqual(baseRide.maxDetourKm);
  });

  it('rejects query travelling in reverse direction (e.g. San Jose to SF)', () => {
    const reverseQuery: SearchQuery = {
      originLat: 37.33,
      originLng: -121.89, // San Jose
      destLat: 37.78,
      destLng: -122.41, // SF
      date: '2026-10-16',
      seats: 1,
    };

    const result = evaluateRideCompatibility(reverseQuery, baseRide);
    expect(result.isCompatible).toBe(false);
    expect(result.compatibilityScore).toBe(0);
    expect(result.explanation).toContain('Incompatible direction');
  });

  it('rejects query when detour exceeds driver maximum limit', () => {
    const excessiveDetourQuery: SearchQuery = {
      originLat: 37.87,
      originLng: -122.27, // Berkeley (across bay bridge, far detour)
      destLat: 37.33,
      destLng: -121.89,
      date: '2026-10-16',
      seats: 1,
      maxDetourKm: 5,
    };

    const result = evaluateRideCompatibility(excessiveDetourQuery, baseRide);
    expect(result.isCompatible).toBe(false);
    expect(result.compatibilityScore).toBe(0);
  });

  it('rejects query when requested seats exceed available seats', () => {
    const query: SearchQuery = {
      originLat: 37.77,
      originLng: -122.40,
      destLat: 37.44,
      destLng: -122.16,
      date: '2026-10-16',
      seats: 5, // baseRide only has 2 available
    };

    const result = evaluateRideCompatibility(query, baseRide);
    expect(result.isCompatible).toBe(false);
    expect(result.explanation).toContain('fully booked');
  });
});
