"use client";

import * as React from "react";
import Link from "next/link";
import {
  Car,
  PlusCircle,
  Clock,
  MapPin,
  Check,
  X,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Booking, Ride } from "@/features/types";
import { formatCurrency, formatDistance, formatDuration, formatTime } from "@/lib/utils";

export default function DriverDashboardPage() {
  const { showToast } = useToast();

  const [driverRides, setDriverRides] = React.useState<Ride[]>([]);
  const [driverBookings, setDriverBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch rides
      const ridesRes = await fetch("/api/rides");
      const ridesData = await ridesRes.json();
      if (ridesData.success) {
        setDriverRides(ridesData.data);
      }

      // 2. Fetch driver incoming bookings
      const bookingsRes = await fetch("/api/bookings?role=driver&userId=u-alex-mercer");
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setDriverBookings(bookingsData.data);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Driver Accept Booking
  const handleAcceptBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "success",
          title: "Booking Accepted!",
          message: "The seat has been confirmed and the passenger has been notified.",
        });
        fetchDashboardData();
      } else {
        showToast({
          type: "error",
          title: "Could Not Accept",
          message: data.error?.message || "Seat conflict occurred.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Action Error",
        message: "Failed to communicate with server.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Driver Reject Booking
  const handleRejectBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Driver route capacity full" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "info",
          title: "Request Declined",
          message: "The booking request has been declined.",
        });
        fetchDashboardData();
      }
    } catch {
      // error
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingBookings = driverBookings.filter((b) => b.status === "pending");
  const confirmedBookings = driverBookings.filter((b) => b.status === "confirmed");

  return (
    <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-commuter-200">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700">
              <Car className="w-4 h-4" />
              <span>Driver Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-commuter-900 mt-1">
              Driver Dashboard & Requests
            </h1>
            <p className="text-xs sm:text-sm text-commuter-500 mt-0.5">
              Manage your scheduled commute listings, passenger manifests, and detour requests.
            </p>
          </div>

          <Link href="/driver/publish">
            <Button size="md" className="font-bold space-x-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Journey</span>
            </Button>
          </Link>
        </div>

        {/* Operational Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-mobility-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-commuter-500 uppercase tracking-wider">
                  Active Scheduled Trips
                </span>
                <p className="text-2xl font-black text-commuter-900 mt-1">
                  {driverRides.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-mobility-50 text-mobility-700 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Pending Seat Requests
                </span>
                <p className="text-2xl font-black text-amber-900 mt-1">
                  {pendingBookings.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Confirmed Co-Riders
                </span>
                <p className="text-2xl font-black text-emerald-900 mt-1">
                  {confirmedBookings.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Pending Booking Requests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-commuter-900">
                Action Required: Pending Passenger Requests
              </h2>
              {pendingBookings.length > 0 && (
                <Badge variant="warning">{pendingBookings.length} pending</Badge>
              )}
            </div>
            <span className="text-xs text-commuter-500">
              Accepting automatically decrements your vehicle seats.
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-xl border border-commuter-200">
              <Loader2 className="w-6 h-6 animate-spin text-mobility-600 mx-auto" />
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="p-8 rounded-xl bg-white border border-dashed border-commuter-300 text-center text-xs text-commuter-500">
              No pending seat requests at this moment. You are all caught up!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingBookings.map((b) => (
                <Card key={b.id} className="border-amber-200 shadow-sm bg-white">
                  <CardContent className="p-5 space-y-4">
                    {/* Passenger Profile */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={b.passenger?.avatarUrl}
                          alt={b.passenger?.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-commuter-200"
                        />
                        <div>
                          <p className="font-bold text-sm text-commuter-900">
                            {b.passenger?.fullName}
                          </p>
                          <p className="text-xs text-commuter-500">
                            ★ {b.passenger?.ratingAverage.toFixed(2)} rating · {b.seatsBooked} seat requested
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-700">
                          +{formatCurrency(b.fareAmount)}
                        </span>
                        <span className="block text-[10px] text-commuter-400">
                          driver payout
                        </span>
                      </div>
                    </div>

                    {/* Detour & Location Details */}
                    <div className="p-3 rounded-lg bg-commuter-50 border border-commuter-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-commuter-700">
                        <span className="font-semibold">Pickup:</span>
                        <span className="truncate max-w-[200px] text-right font-medium">
                          {b.pickupLocation.address}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-commuter-700">
                        <span className="font-semibold">Drop-off:</span>
                        <span className="truncate max-w-[200px] text-right font-medium">
                          {b.dropoffLocation.address}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-commuter-200 flex items-center justify-between text-[11px]">
                        <span className="text-commuter-500">Detour introduced:</span>
                        <span className="font-bold text-emerald-700">
                          +{formatDistance(b.detourDistanceKm)} (within limit)
                        </span>
                      </div>
                    </div>

                    {/* Accept / Decline CTA Buttons */}
                    <div className="flex items-center space-x-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptBooking(b.id)}
                        isLoading={actionLoadingId === b.id}
                        className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        <span>Accept Passenger</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectBooking(b.id)}
                        disabled={actionLoadingId === b.id}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        <X className="w-4 h-4 mr-1" />
                        <span>Decline</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Commutes Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-commuter-900">
            Your Published Commute Trips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {driverRides.map((ride) => (
              <Card key={ride.id} className="hover:border-commuter-300 transition-all bg-white">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-commuter-100">
                      <span className="text-xs font-bold text-mobility-700 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-mobility-600" />
                        {formatTime(ride.departureTime)}
                      </span>
                      <Badge variant={ride.status === "scheduled" ? "success" : "default"}>
                        {ride.status}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <p className="text-sm font-bold text-commuter-900">
                        {ride.origin.city} ➔ {ride.destination.city}
                      </p>
                      <p className="text-xs text-commuter-500">
                        {formatDistance(ride.totalDistanceKm)} · ~{formatDuration(ride.estimatedDurationMinutes)}
                      </p>
                    </div>

                    {/* Capacity Indicator Bar */}
                    <div className="mt-4 pt-3 border-t border-commuter-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-commuter-500 font-medium">Occupancy</span>
                        <span className="font-bold text-commuter-900">
                          {ride.totalSeats - ride.availableSeats} of {ride.totalSeats} seats booked
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-commuter-100 overflow-hidden">
                        <div
                          className="h-full bg-mobility-600 transition-all duration-300"
                          style={{
                            width: `${((ride.totalSeats - ride.availableSeats) / ride.totalSeats) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-commuter-100 flex items-center justify-between text-xs">
                    <span className="text-commuter-500 font-medium">
                      Rate: ${ride.basePricePerKm}/km
                    </span>
                    <Link
                      href={`/rides/${ride.id}`}
                      className="font-bold text-mobility-700 hover:text-mobility-900 flex items-center"
                    >
                      <span>Trip Details</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
