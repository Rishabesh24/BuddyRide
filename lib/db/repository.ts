// Resilient Repository Adapter for RouteShare
import {
  AdminStats,
  Booking,
  BookingStatus,
  InAppNotification,
  MatchResult,
  ReportItem,
  Ride,
  SearchQuery,
  Vehicle,
} from '@/features/types';
import { SEED_RIDES, SEED_USERS, SEED_VEHICLES } from '../fixtures/rides';
import { evaluateRideCompatibility } from '@/features/matching/engine';

export interface IRideRepository {
  searchRides(query: SearchQuery): Promise<MatchResult[]>;
  getRideById(id: string): Promise<Ride | null>;
  createRide(rideData: Omit<Ride, 'id' | 'createdAt'>): Promise<Ride>;
  cancelRide(rideId: string, driverId: string): Promise<boolean>;

  getBookingsForPassenger(passengerId: string): Promise<Booking[]>;
  getBookingsForDriver(driverId: string): Promise<Booking[]>;
  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  updateBookingStatus(bookingId: string, status: BookingStatus, reason?: string): Promise<Booking>;

  getVehiclesForDriver(driverId: string): Promise<Vehicle[]>;
  addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle>;

  getNotifications(userId: string): Promise<InAppNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;

  getAdminStats(): Promise<AdminStats>;
  getAdminReports(): Promise<ReportItem[]>;
  resolveReport(reportId: string): Promise<void>;
}

// In-Memory state for local/fixture mode with dynamic persistence across the session
class LocalFixtureRepository implements IRideRepository {
  private rides: Ride[] = [...SEED_RIDES];
  private vehicles: Vehicle[] = [...SEED_VEHICLES];
  private bookings: Booking[] = [
    {
      id: 'b-seed-01',
      rideId: 'ride-sf-sjc-01',
      ride: SEED_RIDES[0],
      passengerId: 'u-demo-passenger',
      passenger: SEED_USERS[4],
      seatsBooked: 1,
      pickupLocation: {
        address: 'San Mateo Transit Center',
        city: 'San Mateo',
        latitude: 37.5684,
        longitude: -122.3242,
      },
      dropoffLocation: {
        address: 'Palo Alto Caltrain Station',
        city: 'Palo Alto',
        latitude: 37.4431,
        longitude: -122.1649,
      },
      segmentDistanceKm: 21.2,
      detourDistanceKm: 1.5,
      fareAmount: 3.82,
      platformFee: 0.50,
      totalPaid: 4.32,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'b-seed-02',
      rideId: 'ride-sf-sjc-01',
      ride: SEED_RIDES[0],
      passengerId: 'u-elena-rostova',
      passenger: SEED_USERS[1],
      seatsBooked: 1,
      pickupLocation: {
        address: 'Market St & 4th St',
        city: 'San Francisco',
        latitude: 37.7858,
        longitude: -122.4065,
      },
      dropoffLocation: {
        address: 'San Pedro Square Market',
        city: 'San Jose',
        latitude: 37.3364,
        longitude: -121.8938,
      },
      segmentDistanceKm: 78.5,
      detourDistanceKm: 0.0,
      fareAmount: 14.13,
      platformFee: 0.71,
      totalPaid: 14.84,
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  private notifications: InAppNotification[] = [
    {
      id: 'notif-01',
      userId: 'u-alex-mercer',
      title: 'New Booking Request',
      message: 'Elena Rostova requested 1 seat on your morning trip to San Jose.',
      type: 'booking_request',
      linkUrl: '/driver',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'notif-02',
      userId: 'u-demo-passenger',
      title: 'Booking Confirmed!',
      message: 'Alex Mercer approved your ride to Palo Alto. Departure at 7:45 AM.',
      type: 'booking_confirmed',
      linkUrl: '/bookings',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];

  private reports: ReportItem[] = [
    {
      id: 'rep-01',
      reporterId: 'u-marcus-chen',
      targetId: 'ride-sf-paloalto-02',
      targetType: 'ride',
      reason: 'Question regarding pickup location accessibility.',
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  async searchRides(query: SearchQuery): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const ride of this.rides) {
      if (ride.status !== 'scheduled' && ride.status !== 'active') continue;
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
        passenger: SEED_USERS.find((u) => u.id === b.passengerId) ?? b.passenger,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const ride = this.rides.find((r) => r.id === bookingData.rideId);
    if (!ride) throw new Error('Ride not found');

    if (ride.availableSeats < bookingData.seatsBooked) {
      throw new Error('Insufficient seats available');
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `b-${Date.now().toString(36)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ride,
    };

    this.bookings.unshift(newBooking);

    // Notify driver
    this.notifications.push({
      id: `notif-${Date.now().toString(36)}`,
      userId: ride.driverId,
      title: 'New Booking Request',
      message: `A commuter requested ${bookingData.seatsBooked} seat(s) for your trip to ${ride.destination.city}.`,
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

    const ride = this.rides.find((r) => r.id === booking.rideId);
    if (!ride) throw new Error('Associated ride not found');

    // Atomic seat capacity adjustment
    if (status === 'confirmed' && booking.status !== 'confirmed') {
      if (ride.availableSeats < booking.seatsBooked) {
        throw new Error('Insufficient seats remaining to confirm booking');
      }
      ride.availableSeats -= booking.seatsBooked;

      this.notifications.push({
        id: `notif-${Date.now().toString(36)}`,
        userId: booking.passengerId,
        title: 'Booking Confirmed!',
        message: `Your ride from ${booking.pickupLocation.city} to ${booking.dropoffLocation.city} is confirmed!`,
        type: 'booking_confirmed',
        linkUrl: '/bookings',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (status === 'cancelled' || status === 'rejected') {
      if (booking.status === 'confirmed') {
        // Return seats
        ride.availableSeats += booking.seatsBooked;
      }
      if (reason) booking.cancellationReason = reason;

      this.notifications.push({
        id: `notif-${Date.now().toString(36)}`,
        userId: booking.passengerId,
        title: status === 'rejected' ? 'Booking Request Declined' : 'Booking Cancelled',
        message: `Trip request status updated to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
        type: status === 'rejected' ? 'booking_rejected' : 'booking_cancelled',
        linkUrl: '/bookings',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    return booking;
  }

  async getVehiclesForDriver(driverId: string): Promise<Vehicle[]> {
    return this.vehicles.filter((v) => v.driverId === driverId && v.isActive);
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
      activeUsers: SEED_USERS.length + 120,
      activeRides: this.rides.filter((r) => r.status === 'scheduled').length,
      totalBookings: this.bookings.length + 38,
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
}

// Singleton repository provider
export const rideRepository: IRideRepository = new LocalFixtureRepository();
