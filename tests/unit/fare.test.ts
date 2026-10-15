import { describe, it, expect } from 'vitest';
import { calculateProportionalFare } from '@/features/fare/calculator';

describe('Proportional Fare Allocation Calculator', () => {
  it('calculates standard commuter fare without discount', () => {
    const fare = calculateProportionalFare({
      segmentDistanceKm: 50,
      basePricePerKm: 0.18,
      confirmedPassengers: 1,
      requestedSeats: 1,
    });

    // 50 * 0.18 = $9.00
    // Platform fee 5% of 9.00 = $0.45
    // Total = $9.45
    expect(fare.grossFare).toBe(9.00);
    expect(fare.carpoolDiscountPercent).toBe(0);
    expect(fare.fareAmount).toBe(9.00);
    expect(fare.platformFee).toBe(0.45);
    expect(fare.totalPaid).toBe(9.45);
    expect(fare.driverPayout).toBe(9.00);
  });

  it('applies shared carpool discount for 3 passengers', () => {
    const fare = calculateProportionalFare({
      segmentDistanceKm: 40,
      basePricePerKm: 0.20,
      confirmedPassengers: 3, // (3 - 1) * 5% = 10% discount
      requestedSeats: 1,
    });

    // Gross = 40 * 0.20 = $8.00
    // 10% discount = $0.80 -> FareAmount = $7.20
    // Platform fee 5% of 7.20 = $0.36
    // Total = $7.56
    expect(fare.grossFare).toBe(8.00);
    expect(fare.carpoolDiscountPercent).toBe(10);
    expect(fare.carpoolDiscountAmount).toBe(0.80);
    expect(fare.fareAmount).toBe(7.20);
    expect(fare.platformFee).toBe(0.36);
    expect(fare.totalPaid).toBe(7.56);
  });

  it('caps carpool discount at 25%', () => {
    const fare = calculateProportionalFare({
      segmentDistanceKm: 100,
      basePricePerKm: 0.15,
      confirmedPassengers: 8, // would be 35%, capped at 25%
      requestedSeats: 1,
    });

    expect(fare.carpoolDiscountPercent).toBe(25);
  });

  it('handles zero distance with minimum base charge', () => {
    const fare = calculateProportionalFare({
      segmentDistanceKm: 0,
      basePricePerKm: 0.15,
      requestedSeats: 1,
    });

    expect(fare.fareAmount).toBe(2.50); // Minimum base fee
    expect(fare.platformFee).toBe(0.13); // 5% of $2.50
    expect(fare.totalPaid).toBe(2.63);
  });

  it('multiplies price by requested seats', () => {
    const singleSeat = calculateProportionalFare({
      segmentDistanceKm: 50,
      basePricePerKm: 0.20,
      requestedSeats: 1,
    });

    const twoSeats = calculateProportionalFare({
      segmentDistanceKm: 50,
      basePricePerKm: 0.20,
      requestedSeats: 2,
    });

    expect(twoSeats.grossFare).toBeCloseTo(singleSeat.grossFare * 2, 2);
  });
});
