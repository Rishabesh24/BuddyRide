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
  role: 'user' | 'admin';
  ratingAverage: number;
  ratingCount: number;
  isSuspended?: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
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

export type RideStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  driverId: string;
  driver?: Profile;
  vehicleId: string;
  vehicle?: Vehicle;
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

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  rideId: string;
  ride?: Ride;
  passengerId: string;
  passenger?: Profile;
  seatsBooked: number;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  segmentDistanceKm: number;
  detourDistanceKm: number;
  fareAmount: number;
  platformFee: number;
  totalPaid: number;
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
