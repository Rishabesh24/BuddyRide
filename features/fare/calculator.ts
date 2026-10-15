// Proportional Fare Allocation Calculator

export interface FareCalculationInput {
  segmentDistanceKm: number;
  basePricePerKm: number;
  confirmedPassengers?: number;
  requestedSeats?: number;
}

export interface FareBreakdown {
  segmentDistanceKm: number;
  baseRatePerKm: number;
  grossFare: number;
  carpoolDiscountPercent: number;
  carpoolDiscountAmount: number;
  fareAmount: number; // Subtotal after discount
  platformFee: number; // 5% contribution
  totalPaid: number; // Total passenger charge
  driverPayout: number; // Subtotal received by driver
}

/**
 * Calculates deterministic proportional fare for a commuter carpooling segment.
 */
export function calculateProportionalFare(input: FareCalculationInput): FareBreakdown {
  const seats = Math.max(1, input.requestedSeats ?? 1);
  const distance = Math.max(0, input.segmentDistanceKm);
  const rate = Math.max(0.01, input.basePricePerKm);
  const passengers = Math.max(1, input.confirmedPassengers ?? 1);

  // 1. Gross distance-proportional fare
  const grossFare = Math.round(distance * rate * seats * 100) / 100;

  // 2. Shared carpool discount (5% per co-rider up to 25% maximum)
  const discountTier = Math.min(0.25, Math.max(0, (passengers - 1) * 0.05));
  const carpoolDiscountPercent = Math.round(discountTier * 100);
  const carpoolDiscountAmount = Math.round(grossFare * discountTier * 100) / 100;

  // 3. Subtotal after shared discount (minimum base fare $2.50 to cover driver fixed pickup cost)
  const minBaseFare = 2.50 * seats;
  const fareAmount = Math.max(minBaseFare, Math.round((grossFare - carpoolDiscountAmount) * 100) / 100);

  // 4. Transparent 5% platform maintenance fee
  const platformFee = Math.round(fareAmount * 0.05 * 100) / 100;

  // 5. Total passenger cost
  const totalPaid = Math.round((fareAmount + platformFee) * 100) / 100;

  return {
    segmentDistanceKm: Math.round(distance * 10) / 10,
    baseRatePerKm: rate,
    grossFare,
    carpoolDiscountPercent,
    carpoolDiscountAmount,
    fareAmount,
    platformFee,
    totalPaid,
    driverPayout: fareAmount,
  };
}
