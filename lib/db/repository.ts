// Resilient Repository Adapter for RouteShare (Tamil Nadu Transit Network)
import {
  AdminStats,
  Booking,
  BookingStatus,
  InAppNotification,
  MatchResult,
  Profile,
  ReportItem,
  Ride,
  SearchQuery,
  Vehicle,
} from '@/features/types';
import { SEED_RIDES, SEED_USERS, SEED_VEHICLES } from '../fixtures/rides';
import { evaluateRideCompatibility } from '@/features/matching/engine';
import { getRegisteredAccountById } from '../auth';
import { isSupabaseConfigured, supabaseAdmin } from '../supabase/client';

export interface IRideRepository {
  searchRides(query: SearchQuery): Promise<MatchResult[]>;
  getRideById(id: string): Promise<Ride | null>;
  getRidesByDriver(driverId: string): Promise<Ride[]>;
  getAllRides(): Promise<Ride[]>;
  createRide(rideData: Omit<Ride, 'id' | 'createdAt'>): Promise<Ride>;
  cancelRide(rideId: string, driverId: string): Promise<boolean>;

  getBookingsForPassenger(passengerId: string): Promise<Booking[]>;
  getBookingsForDriver(driverId: string): Promise<Booking[]>;
  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  updateBookingStatus(bookingId: string, status: BookingStatus, reason?: string): Promise<Booking>;
  verifyStartOtp(bookingId: string, otp: string): Promise<{ success: boolean; message: string }>;
  completeBooking(bookingId: string): Promise<Booking>;

  getDrivers(): Promise<Profile[]>;
  getDriverById(driverId: string): Promise<Profile | null>;
  getUserById(userId: string): Promise<Profile | null>;
  addUser(profile: Profile): Promise<Profile>;
  toggleDriverOnline(driverId: string, isOnline: boolean): Promise<Profile>;
  getVehiclesForDriver(driverId: string): Promise<Vehicle[]>;
  addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle>;

  getNotifications(userId: string): Promise<InAppNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;

  getAdminStats(): Promise<AdminStats>;
  getAdminReports(): Promise<ReportItem[]>;
  resolveReport(reportId: string): Promise<void>;
  updateDriverKyc(driverId: string, verified: boolean): Promise<Profile>;
  reviewDriverKyc(driverId: string, action: 'verified' | 'rejected', reason?: string): Promise<Profile>;
  suspendUser(userId: string): Promise<Profile>;
  restoreUser(userId: string): Promise<Profile>;
  submitReport(report: Omit<ReportItem, 'id' | 'createdAt'>): Promise<ReportItem>;
  editRide(rideId: string, updates: Partial<Ride>): Promise<Ride>;
}

// In-Memory state for local/fixture mode with dynamic persistence across the session
class LocalFixtureRepository implements IRideRepository {
  private rides: Ride[] = SEED_RIDES.map((r, i) => {
    const d = new Date();
    if (i === 13) {
      // Index 13 is explicitly a past ride to verify past-ride exclusion
      d.setDate(d.getDate() - 1);
      d.setHours(10, 0, 0, 0);
    } else {
      const dayOffset = Math.floor(i / 4);
      const hour = 8 + (i % 4) * 3;
      d.setDate(d.getDate() + dayOffset);
      d.setHours(hour, 30, 0, 0);
    }
    return {
      ...r,
      departureTime: d.toISOString(),
    };
  });
  private vehicles: Vehicle[] = [...SEED_VEHICLES];
  private users: Profile[] = [...SEED_USERS];
  private bookings: Booking[] = [
    {
      id: 'b-seed-01',
      rideId: 'ride-omr-sedan-01',
      ride: SEED_RIDES[0],
      passengerId: 'u-demo-passenger',
      passenger: SEED_USERS[6], // Anand Subramanian
      vehicleType: 'sedan',
      seatsBooked: 1,
      pickupLocation: {
        address: 'Guindy Kathipara Junction & Metro',
        city: 'Chennai',
        latitude: 13.0067,
        longitude: 80.2038,
      },
      dropoffLocation: {
        address: 'OMR Sholinganallur ELCOT Junction',
        city: 'Chennai',
        latitude: 12.9010,
        longitude: 80.2279,
      },
      segmentDistanceKm: 18.5,
      detourDistanceKm: 0.8,
      fareAmount: 370,
      platformFee: 18.5,
      totalPaid: 388.5,
      startOtp: '5829',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 'b-seed-02',
      rideId: 'ride-airport-suv-02',
      ride: SEED_RIDES[1],
      passengerId: 'u-demo-passenger',
      passenger: SEED_USERS[6],
      vehicleType: 'suv',
      seatsBooked: 2,
      pickupLocation: {
        address: 'Chennai International Airport (MAA)',
        city: 'Chennai',
        latitude: 12.9941,
        longitude: 80.1709,
      },
      dropoffLocation: {
        address: 'T. Nagar (Pondy Bazaar)',
        city: 'Chennai',
        latitude: 13.0418,
        longitude: 80.2341,
      },
      segmentDistanceKm: 12.0,
      detourDistanceKm: 0.0,
      fareAmount: 580,
      platformFee: 29,
      totalPaid: 609,
      startOtp: '7412',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    },
  ];

  private notifications: InAppNotification[] = [
    {
      id: 'notif-01',
      userId: 'u-karthik-sedan',
      title: 'New Commuter Confirmed',
      message: 'Anand Subramanian confirmed 1 seat for OMR Sholinganallur corridor.',
      type: 'booking_confirmed',
      linkUrl: '/driver',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'notif-02',
      userId: 'u-demo-passenger',
      title: 'Ride Confirmed — Start OTP 5829',
      message: 'Karthik Raja (Swift Dzire TN 10 BX 9014) is on the way. Share OTP 5829 at pickup.',
      type: 'booking_confirmed',
      linkUrl: '/bookings',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  private reports: ReportItem[] = [
    {
      id: 'rep-01',
      reporterId: 'u-demo-passenger',
      targetId: 'ride-tnagar-auto-03',
      targetType: 'ride',
      reason: 'Driver requested exact landmark update near Panagal Park gate.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  async searchRides(query: SearchQuery): Promise<MatchResult[]> {
    const results: MatchResult[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // TC-M2-06: If queried date is in the past, return no upcoming matches
    if (query.date && query.date < todayStr) {
      return [];
    }

    for (const ride of this.rides) {
      if (ride.status !== 'scheduled' && ride.status !== 'active') continue;

      const rideDate = new Date(ride.departureTime);

      // TC-M2-06: Past rides are not offered as upcoming rides
      if (rideDate.getTime() < now.getTime()) {
        continue;
      }

      // If a specific date is queried, match that departure date
      if (query.date) {
        const rideDateStr = rideDate.toISOString().split('T')[0];
        if (rideDateStr !== query.date) {
          continue;
        }
      }

      const match = evaluateRideCompatibility(query, ride);
      if (match.isCompatible) {
        results.push(match);
      }
    }

    // Sort by compatibility score descending
    results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return results;
  }

  async getRideById(id: string): Promise<Ride | null> {
    const ride = this.rides.find((r) => r.id === id);
    return ride ?? null;
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    const list = this.rides
      .filter((r) => r.driverId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (isSupabaseConfigured && supabaseAdmin && driverId.length === 36) {
      try {
        const { data: rows } = await supabaseAdmin.from('rides').select('*').eq('driver_id', driverId);
        if (rows && rows.length > 0) {
          for (const row of rows) {
            if (!list.some((lr) => lr.id === row.id)) {
              list.push({
                id: row.id,
                driverId: row.driver_id,
                vehicleId: row.vehicle_id,
                origin: { address: row.origin_address, city: row.origin_city, latitude: Number(row.origin_lat), longitude: Number(row.origin_lng) },
                destination: { address: row.dest_address, city: row.dest_city, latitude: Number(row.dest_lat), longitude: Number(row.dest_lng) },
                waypoints: [],
                departureTime: row.departure_time,
                totalSeats: row.total_seats,
                availableSeats: row.available_seats,
                basePricePerKm: Number(row.base_price_per_km),
                totalDistanceKm: Number(row.total_distance_km),
                estimatedDurationMinutes: row.estimated_duration_min,
                maxDetourKm: Number(row.max_detour_km),
                status: row.status,
                notes: row.notes,
                createdAt: row.created_at,
              });
            }
          }
        }
      } catch {}
    }

    return list;
  }

  async getAllRides(): Promise<Ride[]> {
    const list = [...this.rides];
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: rows } = await supabaseAdmin.from('rides').select('*');
        if (rows && rows.length > 0) {
          for (const row of rows) {
            if (!list.some((lr) => lr.id === row.id)) {
              list.unshift({
                id: row.id,
                driverId: row.driver_id,
                vehicleId: row.vehicle_id,
                origin: { address: row.origin_address, city: row.origin_city, latitude: Number(row.origin_lat), longitude: Number(row.origin_lng) },
                destination: { address: row.dest_address, city: row.dest_city, latitude: Number(row.dest_lat), longitude: Number(row.dest_lng) },
                waypoints: [],
                departureTime: row.departure_time,
                totalSeats: row.total_seats,
                availableSeats: row.available_seats,
                basePricePerKm: Number(row.base_price_per_km),
                totalDistanceKm: Number(row.total_distance_km),
                estimatedDurationMinutes: row.estimated_duration_min,
                maxDetourKm: Number(row.max_detour_km),
                status: row.status,
                notes: row.notes,
                createdAt: row.created_at,
              });
            }
          }
        }
      } catch {}
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createRide(rideData: Omit<Ride, 'id' | 'createdAt'>): Promise<Ride> {
    const newRide: Ride = {
      ...rideData,
      id: `ride-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.rides.unshift(newRide);
    return newRide;
  }

  async cancelRide(rideId: string, driverId: string): Promise<boolean> {
    const ride = this.rides.find((r) => r.id === rideId && r.driverId === driverId);
    if (!ride) return false;

    ride.status = 'cancelled';

    // Transition all active bookings to cancelled
    for (const booking of this.bookings) {
      if (booking.rideId === rideId && booking.status !== 'cancelled') {
        booking.status = 'cancelled';
        booking.cancellationReason = 'Driver cancelled the scheduled trip.';
        this.notifications.push({
          id: `notif-${Date.now().toString(36)}`,
          userId: booking.passengerId,
          title: 'Ride Cancelled by Driver',
          message: `The trip from ${ride.origin.city} to ${ride.destination.city} was cancelled.`,
          type: 'booking_cancelled',
          linkUrl: '/bookings',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return true;
  }

  async getBookingsForPassenger(passengerId: string): Promise<Booking[]> {
    return this.bookings
      .filter((b) => b.passengerId === passengerId)
      .map((b) => ({
        ...b,
        ride: this.rides.find((r) => r.id === b.rideId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBookingsForDriver(driverId: string): Promise<Booking[]> {
    const driverRideIds = this.rides.filter((r) => r.driverId === driverId).map((r) => r.id);
    return this.bookings
      .filter((b) => driverRideIds.includes(b.rideId))
      .map((b) => ({
        ...b,
        ride: this.rides.find((r) => r.id === b.rideId),
        passenger: this.users.find((u) => u.id === b.passengerId) ?? b.passenger,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const ride = this.rides.find((r) => r.id === bookingData.rideId);
    if (!ride) throw new Error('Ride not found');

    // TC-M4-03: Validate seat counts (must be positive and within availability)
    if (!bookingData.seatsBooked || bookingData.seatsBooked <= 0 || ride.availableSeats < bookingData.seatsBooked) {
      throw new Error('Insufficient or invalid seat count');
    }

    // Generate secure 4-digit start OTP
    const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // TC-M4-01: Default status is 'pending' unless explicitly set to accepted/confirmed
    const initialStatus: BookingStatus = bookingData.status || 'pending';

    // Only decrement availableSeats if confirmed directly
    if (initialStatus === 'confirmed' || initialStatus === 'accepted') {
      ride.availableSeats -= bookingData.seatsBooked;
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `b-${Date.now().toString(36)}`,
      startOtp,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ride,
    };

    this.bookings.unshift(newBooking);

    // Notify driver
    this.notifications.push({
      id: `notif-${Date.now().toString(36)}`,
      userId: ride.driverId,
      title: initialStatus === 'pending' ? 'New Booking Request' : 'New Confirmed Ride Booking!',
      message: `A commuter booked ${bookingData.seatsBooked} seat(s) to ${bookingData.dropoffLocation.address}. OTP: ${startOtp}`,
      type: 'booking_request',
      linkUrl: '/driver',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newBooking;
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    reason?: string
  ): Promise<Booking> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    // TC-M4-07: Invalid transition from terminal state
    if (['rejected', 'cancelled', 'completed'].includes(booking.status)) {
      throw new Error(`Invalid status transition: booking is already in terminal state '${booking.status}'`);
    }

    const ride = this.rides.find((r) => r.id === booking.rideId);
    if (!ride) throw new Error('Associated ride not found');

    const isAccepting = status === 'accepted' || status === 'confirmed';
    const wasAccepted = booking.status === 'accepted' || booking.status === 'confirmed';

    if (isAccepting && !wasAccepted) {
      if (ride.availableSeats < booking.seatsBooked) {
        throw new Error('Insufficient seats remaining');
      }
      ride.availableSeats -= booking.seatsBooked;
    } else if (status === 'cancelled' || status === 'rejected') {
      if (wasAccepted || booking.status === 'in_progress') {
        ride.availableSeats += booking.seatsBooked;
      }
      if (reason) booking.cancellationReason = reason;
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    // Notify passenger
    this.notifications.push({
      id: `notif-${Date.now().toString(36)}-status`,
      userId: booking.passengerId,
      title: `Booking ${isAccepting ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Cancelled'}`,
      message: `Your booking for trip to ${booking.dropoffLocation.city} is now ${status}.`,
      type: isAccepting ? 'booking_confirmed' : 'booking_rejected',
      linkUrl: '/bookings',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return booking;
  }

  async verifyStartOtp(bookingId: string, otp: string): Promise<{ success: boolean; message: string }> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    // TC-M4-07: Rejected or cancelled booking cannot be boarded
    if (booking.status === 'rejected' || booking.status === 'cancelled') {
      return { success: false, message: `Cannot verify OTP on a ${booking.status} booking.` };
    }

    // TC-M4-10: Reject empty, malformed, or non-numeric OTP
    if (!otp || typeof otp !== 'string' || otp.trim().length !== 4 || !/^\d{4}$/.test(otp.trim())) {
      return { success: false, message: 'OTP must be exactly 4 numeric digits.' };
    }

    if (booking.startOtp !== otp.trim()) {
      return { success: false, message: 'Invalid 4-digit OTP. Please ask rider for correct PIN.' };
    }

    booking.status = 'in_progress';
    booking.updatedAt = new Date().toISOString();

    const ride = this.rides.find((r) => r.id === booking.rideId);
    if (ride) ride.status = 'in_progress';

    return { success: true, message: 'OTP verified successfully! Trip is now in progress.' };
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = 'completed';
    booking.updatedAt = new Date().toISOString();

    // Credit driver
    const ride = this.rides.find((r) => r.id === booking.rideId);
    if (ride) {
      const driver = this.users.find((u) => u.id === ride.driverId);
      if (driver) {
        driver.todayEarnings = (driver.todayEarnings ?? 0) + booking.fareAmount;
      }
    }

    return booking;
  }

  async getDrivers(): Promise<Profile[]> {
    return this.users.filter((u) => u.role === 'driver');
  }

  async getDriverById(driverId: string): Promise<Profile | null> {
    const driver = this.users.find((u) => u.id === driverId);
    if (driver) return driver;
    const reg = getRegisteredAccountById(driverId);
    if (reg && reg.role === 'driver') return reg.profile;
    return null;
  }

  async getUserById(userId: string): Promise<Profile | null> {
    const user = this.users.find((u) => u.id === userId);
    if (user) return user;
    const reg = getRegisteredAccountById(userId);
    if (reg) return reg.profile;

    if (isSupabaseConfigured && supabaseAdmin && userId.length === 36) {
      try {
        const { data: p } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (p) {
          const profile: Profile = {
            id: p.id,
            email: p.email,
            fullName: p.full_name,
            phoneNumber: p.phone_number,
            avatarUrl: p.avatar_url,
            role: p.role,
            ratingAverage: Number(p.rating_avg || 5.0),
            ratingCount: Number(p.rating_count || 0),
            drivingLicenseNo: p.driving_license_no,
            isKycVerified: p.is_kyc_verified,
            todayEarnings: Number(p.today_earnings || 0),
            createdAt: p.created_at,
          };
          this.users.push(profile);
          return profile;
        }
      } catch {}
    }

    return null;
  }

  async addUser(profile: Profile): Promise<Profile> {
    const existingIndex = this.users.findIndex((u) => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase());
    if (existingIndex >= 0) {
      this.users[existingIndex] = profile;
    } else {
      this.users.push(profile);
    }
    return profile;
  }

  async toggleDriverOnline(driverId: string, isOnline: boolean): Promise<Profile> {
    const driver = this.users.find((u) => u.id === driverId);
    if (!driver) throw new Error('Driver not found');
    driver.isOnline = isOnline;
    return driver;
  }

  async getVehiclesForDriver(driverId: string): Promise<Vehicle[]> {
    const existing = this.vehicles.filter((v) => v.driverId === driverId && v.isActive);
    if (existing.length > 0) return existing;

    if (isSupabaseConfigured && supabaseAdmin && driverId.length === 36) {
      try {
        const { data: vRows } = await supabaseAdmin.from('vehicles').select('*').eq('driver_id', driverId).eq('is_active', true);
        if (vRows && vRows.length > 0) {
          const mapped = vRows.map((v: any) => ({
            id: v.id,
            driverId: v.driver_id,
            type: v.type,
            make: v.make,
            model: v.model,
            year: v.year,
            licensePlate: v.license_plate,
            color: v.color,
            capacity: v.capacity,
            isActive: v.is_active,
          }));
          return mapped;
        }
      } catch {}
    }

    // Check if user exists as a driver and auto-provision their starter registered vehicle
    const user = await this.getUserById(driverId);
    if (user && user.role === 'driver') {
      const rto = Math.floor(10 + Math.random() * 80);
      const chars = ['AB', 'BX', 'CM', 'DL', 'EK'][Math.floor(Math.random() * 5)];
      const num = Math.floor(1000 + Math.random() * 9000);
      const autoVehicle: Vehicle = {
        id: `v-auto-${driverId}`,
        driverId,
        type: 'sedan',
        make: 'Maruti Suzuki',
        model: 'Swift Dzire Tour (AC)',
        year: 2024,
        licensePlate: `TN ${rto} ${chars} ${num}`,
        color: 'Pearl Arctic White',
        capacity: 4,
        isActive: true,
      };
      this.vehicles.push(autoVehicle);
      return [autoVehicle];
    }

    return [];
  }

  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v-${Date.now().toString(36)}`,
    };
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  async getNotifications(userId: string): Promise<InAppNotification[]> {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) notif.isRead = true;
  }

  async getAdminStats(): Promise<AdminStats> {
    const totalCapacity = this.rides.reduce((acc, r) => acc + r.totalSeats, 0);
    const occupiedSeats = this.rides.reduce((acc, r) => acc + (r.totalSeats - r.availableSeats), 0);
    const occupancyRate = totalCapacity > 0 ? (occupiedSeats / totalCapacity) * 100 : 0;

    return {
      activeUsers: this.users.length,
      activeRides: this.rides.filter((r) => r.status === 'scheduled' || r.status === 'in_progress').length,
      totalBookings: this.bookings.length,
      occupancyRatePercent: Math.round(occupancyRate * 10) / 10,
      flaggedReportsCount: this.reports.filter((r) => r.status === 'open').length,
    };
  }

  async getAdminReports(): Promise<ReportItem[]> {
    return this.reports;
  }

  async resolveReport(reportId: string): Promise<void> {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) report.status = 'resolved';
  }

  async submitReport(report: Omit<ReportItem, 'id' | 'createdAt'>): Promise<ReportItem> {
    if (!report.reason || report.reason.trim().length === 0) {
      throw new Error('Report description cannot be empty');
    }
    if (report.reason.length > 1000) {
      throw new Error('Report description exceeds maximum 1000 characters');
    }
    if (!report.targetId || report.targetId.trim().length === 0) {
      throw new Error('Valid target ID is required');
    }

    // Sanitize reason against stored script tags
    const cleanReason = report.reason.replace(/<[^>]*>?/gm, '').trim();

    const newReport: ReportItem = {
      ...report,
      id: `rep-${Date.now().toString(36)}`,
      reason: cleanReason,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  async updateDriverKyc(driverId: string, verified: boolean): Promise<Profile> {
    const driver = this.users.find((u) => u.id === driverId);
    if (!driver) throw new Error('Driver not found');
    driver.isKycVerified = verified;
    driver.kycStatus = verified ? 'verified' : 'rejected';
    return driver;
  }

  async reviewDriverKyc(driverId: string, action: 'verified' | 'rejected' | 'pending' | 'reset', reason?: string): Promise<Profile> {
    const driver = this.users.find((u) => u.id === driverId);
    if (!driver) throw new Error('Driver not found');

    if (action !== 'pending' && action !== 'reset' && driver.kycStatus === action) {
      throw new Error(`Policy violation: Driver KYC is already ${action}`);
    }

    if (action === 'pending' || action === 'reset') {
      driver.kycStatus = 'pending';
      driver.isKycVerified = false;
      driver.kycRejectionReason = undefined;
      return driver;
    }

    driver.kycStatus = action;
    driver.isKycVerified = action === 'verified';
    if (reason) driver.kycRejectionReason = reason;

    return driver;
  }

  async suspendUser(userId: string): Promise<Profile> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.isSuspended = true;

    const seed = SEED_USERS.find((u) => u.id === userId);
    if (seed) seed.isSuspended = true;

    const reg = getRegisteredAccountById(userId);
    if (reg) reg.profile.isSuspended = true;

    const suspendedIds: Set<string> = (globalThis as any).__routeshare_suspended_user_ids || new Set();
    suspendedIds.add(userId);
    if (user.email) suspendedIds.add(user.email.toLowerCase());
    if (userId === 'u-karthik-sedan') suspendedIds.add('driver@routeshare.in');
    (globalThis as any).__routeshare_suspended_user_ids = suspendedIds;

    return user;
  }

  async restoreUser(userId: string): Promise<Profile> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.isSuspended = false;

    const seed = SEED_USERS.find((u) => u.id === userId);
    if (seed) seed.isSuspended = false;

    const reg = getRegisteredAccountById(userId);
    if (reg) reg.profile.isSuspended = false;

    const suspendedIds: Set<string> = (globalThis as any).__routeshare_suspended_user_ids || new Set();
    suspendedIds.delete(userId);
    if (user.email) suspendedIds.delete(user.email.toLowerCase());
    if (userId === 'u-karthik-sedan') suspendedIds.delete('driver@routeshare.in');
    (globalThis as any).__routeshare_suspended_user_ids = suspendedIds;

    return user;
  }

  async editRide(rideId: string, updates: Partial<Ride>): Promise<Ride> {
    const ride = this.rides.find((r) => r.id === rideId);
    if (!ride) throw new Error('Ride not found');

    if (updates.departureTime && new Date(updates.departureTime).getTime() < Date.now() - 60000) {
      throw new Error('Departure time cannot be in the past');
    }

    if (updates.origin && updates.destination) {
      if (
        updates.origin.address === updates.destination.address ||
        (updates.origin.latitude === updates.destination.latitude && updates.origin.longitude === updates.destination.longitude)
      ) {
        throw new Error('Origin and destination cannot be identical');
      }
    }

    if (updates.totalSeats !== undefined && updates.totalSeats <= 0) {
      throw new Error('Published seat count must be positive');
    }

    Object.assign(ride, updates);
    return ride;
  }
}

// Singleton repository provider attached to globalThis for Next.js cross-chunk consistency
const globalForRepo = globalThis as unknown as {
  routeshare_repository?: IRideRepository;
};

export const rideRepository: IRideRepository =
  globalForRepo.routeshare_repository ?? new LocalFixtureRepository();

if (globalForRepo.routeshare_repository) {
  Object.setPrototypeOf(globalForRepo.routeshare_repository, LocalFixtureRepository.prototype);
} else {
  globalForRepo.routeshare_repository = rideRepository;
}
