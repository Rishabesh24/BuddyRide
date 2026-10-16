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

export interface MobilityTierQuote {
  type: string;
  name: string;
  emoji: string;
  tagline: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
  distanceKm: number;
  grossFare: number;
  platformFee: number;
  totalFare: number;
  etaMinutes: number;
  features: string[];
}

/**
 * Calculates authentic Indian mobility estimates (Bike, Auto, Mini, Sedan, SUV, Shuttle)
 * for a given distance in kilometers.
 */
export function calculateMobilityTierFares(distanceKm: number): MobilityTierQuote[] {
  const dist = Math.max(1, distanceKm);

  const TIER_DEFS = [
    {
      type: 'bike',
      name: 'Bike Taxi',
      emoji: '🛵',
      tagline: 'Fastest commute through traffic',
      capacity: 1,
      baseFare: 25,
      perKmRate: 7,
      etaMinutes: 3,
      features: ['1 Helmet Provided', 'Beats Traffic Jams', 'Solo Commute'],
    },
    {
      type: 'auto',
      name: 'Namma Auto',
      emoji: '🛺',
      tagline: 'Doorstep pickup at transparent fare',
      capacity: 3,
      baseFare: 35,
      perKmRate: 13,
      etaMinutes: 4,
      features: ['Upfront Meter Rate', 'Up to 3 Passengers', 'No Surge On-Road'],
    },
    {
      type: 'mini',
      name: 'Mini Hatchback',
      emoji: '🚗',
      tagline: 'Pocket-friendly compact AC ride',
      capacity: 4,
      baseFare: 60,
      perKmRate: 16,
      etaMinutes: 5,
      features: ['Clean Air Conditioning', 'WagonR / Indica / Swift', 'Compact & Fast'],
    },
    {
      type: 'sedan',
      name: 'Prime Sedan',
      emoji: '🚘',
      tagline: 'Spacious comfort with top drivers',
      capacity: 4,
      baseFare: 90,
      perKmRate: 20,
      etaMinutes: 6,
      features: ['Maruti Dzire / Etios', 'Extra Legroom & Boot Space', 'Top 4.8★ Drivers'],
    },
    {
      type: 'suv',
      name: 'Prime SUV XL',
      emoji: '🚙',
      tagline: '6-seater for family, group or luggage',
      capacity: 6,
      baseFare: 150,
      perKmRate: 26,
      etaMinutes: 8,
      features: ['Innova Crysta / Ertiga', '6 Seats + Ample Luggage', 'Airport & Outstation'],
    },
    {
      type: 'shuttle',
      name: 'Corridor Shuttle',
      emoji: '🚐',
      tagline: 'Shared express van on IT corridors',
      capacity: 12,
      baseFare: 50,
      perKmRate: 8,
      etaMinutes: 10,
      features: ['Dedicated High-Capacity Van', 'Fixed Highway Stopovers', '50% Cheaper than Solo Cabs'],
    },
  ];

  return TIER_DEFS.map((t) => {
    const rawFare = t.baseFare + Math.round(dist * t.perKmRate);
    const platformFee = Math.round(rawFare * 0.05);
    const totalFare = rawFare + platformFee;

    return {
      type: t.type,
      name: t.name,
      emoji: t.emoji,
      tagline: t.tagline,
      capacity: t.capacity,
      baseFare: t.baseFare,
      perKmRate: t.perKmRate,
      distanceKm: Math.round(dist * 10) / 10,
      grossFare: rawFare,
      platformFee,
      totalFare,
      etaMinutes: t.etaMinutes,
      features: t.features,
    };
  });
}

