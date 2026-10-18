// Domain Types for RouteShare

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface LocationPoint extends GeoCoordinate {
  address: string;
  city: string;
  name?: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'passenger' | 'driver' | 'admin' | 'user';
  ratingAverage: number;
  ratingCount: number;
  isSuspended?: boolean;
  isOnline?: boolean;
  drivingLicenseNo?: string;
  isKycVerified?: boolean;
  todayEarnings?: number;
  createdAt: string;
}

export type VehicleType = 'bike' | 'auto' | 'mini' | 'sedan' | 'suv' | 'shuttle';

export interface VehicleTier {
  type: VehicleType;
  name: string;
  emoji: string;
  iconName: string;
  tagline: string;
  capacity: number;
  baseFare: number; // in INR
  perKmRate: number; // in INR
  etaMinutes: number;
  features: string[];
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  capacity: number;
  isActive: boolean;
}

export interface RideWaypoint extends GeoCoordinate {
  id: string;
  rideId: string;
  address: string;
  orderIndex: number;
  stopType: 'pickup' | 'dropoff' | 'stopover';
  estimatedArrival?: string;
}

export type RideStatus = 'scheduled' | 'active' | 'in_progress' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  driverId: string;
  driver?: Profile;
  vehicleId: string;
  vehicle?: Vehicle;
  vehicleType?: VehicleType;
  origin: LocationPoint;
  destination: LocationPoint;
  waypoints: RideWaypoint[];
  departureTime: string; // ISO 8601
  totalSeats: number;
  availableSeats: number;
  basePricePerKm: number;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  maxDetourKm: number;
  status: RideStatus;
  notes?: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  rideId: string;
  ride?: Ride;
  passengerId: string;
  passenger?: Profile;
  vehicleType?: VehicleType;
  seatsBooked: number;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  segmentDistanceKm: number;
  detourDistanceKm: number;
  fareAmount: number;
  platformFee: number;
  totalPaid: number;
  startOtp?: string; // 4-digit ride OTP
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  rideId: string;
  ride: Ride;
  compatibilityScore: number; // 0 to 100
  pickupDetourKm: number;
  dropoffDetourKm: number;
  totalDetourKm: number;
  detourTimeMinutes: number;
  passengerDistanceKm: number;
  estimatedFare: number;
  platformFee: number;
  totalCharge: number;
  isCompatible: boolean;
  explanation: string;
}

export interface SearchQuery {
  originLat: number;
  originLng: number;
  originAddress?: string;
  destLat: number;
  destLng: number;
  destAddress?: string;
  date: string; // YYYY-MM-DD
  seats?: number;
  maxDetourKm?: number;
}

export interface FilterOptions {
  maxPrice?: number;
  timeOfDay?: 'all' | 'morning' | 'afternoon' | 'evening';
  minRating?: number;
  maxDetourKm?: number;
  sortBy?: 'compatibility' | 'price_asc' | 'departure_time' | 'detour_asc';
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'trip_reminder' | 'system';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'ride' | 'review';
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AdminStats {
  activeUsers: number;
  activeRides: number;
  totalBookings: number;
  occupancyRatePercent: number;
  flaggedReportsCount: number;
}

export const VEHICLE_TIERS: VehicleTier[] = [
  {
    type: 'bike',
    name: 'Bike Taxi',
    emoji: '🛵',
    iconName: 'Bike',
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
    iconName: 'Car',
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
    iconName: 'Car',
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
    iconName: 'Car',
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
    iconName: 'Truck',
    tagline: '6-seater for family, group or luggage',
    capacity: 6,
    baseFare: 150,
    perKmRate: 26,
    etaMinutes: 8,
    features: ['Innova Crysta / Ertiga', '6 Seats + Ample Luggage', 'Ideal for Airport & Outstation'],
  },
  {
    type: 'shuttle',
    name: 'Corridor Shuttle',
    emoji: '🚐',
    iconName: 'Bus',
    tagline: 'Shared express van on IT corridors',
    capacity: 12,
    baseFare: 50,
    perKmRate: 8,
    etaMinutes: 10,
    features: ['Dedicated High-Capacity Van', 'Fixed Highway Stopovers', '50% Cheaper than Solo Cabs'],
  },
];

export interface TamilNaduHub {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'transit' | 'it_hub' | 'airport' | 'commercial' | 'outstation';
}

import { EXTENDED_TAMIL_NADU_HUBS } from './locations/tamil-nadu-locations';

export const TAMIL_NADU_HUBS: TamilNaduHub[] = EXTENDED_TAMIL_NADU_HUBS;
export { ALL_TAMIL_NADU_LOCATIONS } from './locations/tamil-nadu-locations';
export type { TamilNaduLocation } from './locations/tamil-nadu-locations';


