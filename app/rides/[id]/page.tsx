"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RouteTimeline } from "@/components/ui/route-timeline";
import { InteractiveMap } from "@/components/map/interactive-map";
import { useToast } from "@/components/ui/toast";
import { Ride } from "@/features/types";
import { calculateProportionalFare } from "@/features/fare/calculator";
import { formatCurrency, formatDistance, formatDuration, formatTime } from "@/lib/utils";

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const rideId = params?.id as string;

  const [ride, setRide] = React.useState<Ride | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSeats, setSelectedSeats] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingConfirmed, setBookingConfirmed] = React.useState(false);

  React.useEffect(() => {
    async function loadRide() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/rides/${rideId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setRide(data.data);
        }
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    }
    if (rideId) loadRide();
  }, [rideId]);

  // Compute live dynamic proportional fare
  const fare = React.useMemo(() => {
    if (!ride) return null;
    return calculateProportionalFare({
      segmentDistanceKm: ride.totalDistanceKm,
      basePricePerKm: ride.basePricePerKm,
      confirmedPassengers: (ride.totalSeats - ride.availableSeats) + selectedSeats,
      requestedSeats: selectedSeats,
    });
  }, [ride, selectedSeats]);

  const handleBookingSubmit = async () => {
    if (!ride || !fare) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId: ride.id,
          seatsBooked: selectedSeats,
          pickupLocation: ride.origin,
          dropoffLocation: ride.destination,
          segmentDistanceKm: ride.totalDistanceKm,
          detourDistanceKm: 1.5,
          fareAmount: fare.fareAmount,
          platformFee: fare.platformFee,
          totalPaid: fare.totalPaid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingConfirmed(true);
        showToast({
          type: "success",
          title: "Booking Request Submitted!",
          message: "The driver will review your route request shortly.",
        });
      } else {
        showToast({
          type: "error",
          title: "Booking Failed",
          message: data.error?.message || "Could not reserve seat.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-mobility-600" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-commuter-900">Ride Not Found</h2>
        <p className="text-sm text-commuter-500 mt-1">
          This ride may have already departed or been cancelled.
        </p>
        <Link href="/rides" className="mt-4">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-medium text-commuter-500">
          <Link
            href="/rides"
            className="inline-flex items-center space-x-1 hover:text-commuter-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Search Results</span>
          </Link>
          <span>/</span>
          <span className="text-commuter-800 font-semibold truncate">
            {ride.origin.city} to {ride.destination.city}
          </span>
        </div>

        {/* Confirmation Banner if booked */}
        {bookingConfirmed && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start space-x-3 animate-in fade-in-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Booking Request Sent Successfully</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your request for {selectedSeats} seat(s) has been forwarded to {ride.driver?.fullName}. You will be notified the moment it is confirmed.
              </p>
              <div className="mt-3">
                <Link href="/bookings">
                  <Button size="sm" className="font-semibold bg-emerald-700 hover:bg-emerald-800 text-white">
                    View in My Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column: Journey Info & Map (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between pb-4 border-b border-commuter-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-mobility-700">
                      Scheduled Commute
                    </span>
                    <h1 className="text-2xl font-extrabold text-commuter-900 mt-0.5">
                      {ride.origin.city} ➔ {ride.destination.city}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-commuter-600 font-medium">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                        {new Date(ride.departureTime).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                        {formatTime(ride.departureTime)} ({formatDuration(ride.estimatedDurationMinutes)})
                      </span>
                    </div>
                  </div>

                  <Badge variant="success" className="text-sm px-3 py-1">
                    {ride.availableSeats} seats open
                  </Badge>
                </div>

                {/* Route Timeline */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-commuter-500 mb-4">
                    Stops & Waypoints
                  </h3>
                  <RouteTimeline
                    origin={ride.origin}
                    destination={ride.destination}
                    waypoints={ride.waypoints}
                    departureTime={formatTime(ride.departureTime)}
                  />
                </div>

                {ride.notes && (
                  <div className="mt-6 pt-4 border-t border-commuter-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-commuter-500 mb-1">
                      Driver Commuter Notes
                    </h4>
                    <p className="text-xs text-commuter-700 leading-relaxed bg-commuter-50 p-3 rounded-lg border border-commuter-200">
                      &ldquo;{ride.notes}&rdquo;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Route Map */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-commuter-500 mb-3">
                  Interactive Route Geometry
                </h3>
                <div className="h-72 w-full rounded-xl overflow-hidden border border-commuter-200">
                  <InteractiveMap
                    origin={ride.origin}
                    destination={ride.destination}
                    waypoints={ride.waypoints}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-commuter-500">
                  <span>Total Distance: {formatDistance(ride.totalDistanceKm)}</span>
                  <span>Driver Detour Allowance: ≤ {ride.maxDetourKm} km</span>
                </div>
              </CardContent>
            </Card>

            {/* Driver & Vehicle Profile */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-commuter-500 mb-4">
                  Driver & Vehicle Details
                </h3>

                <div className="flex items-start space-x-4">
                  <img
                    src={ride.driver?.avatarUrl}
                    alt={ride.driver?.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-commuter-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-commuter-900">
                        {ride.driver?.fullName}
                      </h4>
                      <Badge variant="mobility">Verified Driver</Badge>
                    </div>
                    <p className="text-xs text-commuter-500 mt-0.5">
                      ★ {ride.driver?.ratingAverage.toFixed(2)} rating · {ride.driver?.ratingCount} rides completed
                    </p>
                    <p className="text-xs text-commuter-600 mt-2 leading-relaxed">
                      {ride.driver?.bio}
                    </p>
                  </div>
                </div>

                {/* Vehicle Specs */}
                {ride.vehicle && (
                  <div className="mt-6 pt-4 border-t border-commuter-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Vehicle</span>
                      <span className="font-semibold text-commuter-900">{ride.vehicle.make} {ride.vehicle.model}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Year / Color</span>
                      <span className="font-semibold text-commuter-900">{ride.vehicle.year} · {ride.vehicle.color}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">License Plate</span>
                      <span className="font-semibold text-commuter-900">{ride.vehicle.licensePlate}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Total Capacity</span>
                      <span className="font-semibold text-commuter-900">{ride.totalSeats} passengers</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Fare Breakdown & Reservation Box (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <Card className="border-mobility-200 shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-commuter-900">
                    Reserve Your Seat
                  </h3>
                  <p className="text-xs text-commuter-500 mt-0.5">
                    Deterministic cost allocation — pay strictly for distance traveled.
                  </p>
                </div>

                {/* Seat Picker Stepper */}
                <div className="p-3.5 rounded-xl bg-commuter-50 border border-commuter-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-commuter-600" />
                    <span className="text-xs font-semibold text-commuter-900">
                      Number of Passengers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSeats((s) => Math.max(1, s - 1))}
                      disabled={selectedSeats <= 1}
                      className="w-7 h-7 rounded-md border border-commuter-300 bg-white text-sm font-bold text-commuter-800 disabled:opacity-40 hover:bg-commuter-100"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-commuter-900">
                      {selectedSeats}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSeats((s) => Math.min(ride.availableSeats, s + 1))}
                      disabled={selectedSeats >= ride.availableSeats}
                      className="w-7 h-7 rounded-md border border-commuter-300 bg-white text-sm font-bold text-commuter-800 disabled:opacity-40 hover:bg-commuter-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Transparent Fare Allocation Table */}
                {fare && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-commuter-500">
                      Transparent Fare Breakdown
                    </h4>
                    <div className="rounded-xl border border-commuter-200 bg-white p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between text-commuter-600">
                        <span>Segment Distance ({formatDistance(ride.totalDistanceKm)}) × ${ride.basePricePerKm}/km</span>
                        <span className="font-semibold text-commuter-900">{formatCurrency(fare.grossFare)}</span>
                      </div>

                      {fare.carpoolDiscountPercent > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Multi-Rider Carpool Discount ({fare.carpoolDiscountPercent}%)</span>
                          <span>-{formatCurrency(fare.carpoolDiscountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-commuter-600">
                        <span className="flex items-center">
                          Platform Contribution (5%)
                          <span title="Supports verification & map servers">
                            <HelpCircle className="w-3 h-3 ml-1 text-commuter-400" />
                          </span>
                        </span>
                        <span className="font-semibold text-commuter-900">{formatCurrency(fare.platformFee)}</span>
                      </div>

                      <div className="pt-2 border-t border-commuter-100 flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-commuter-900">Total Calculated Fare</span>
                          <span className="block text-[10px] text-commuter-400">
                            {selectedSeats} seat(s) · All taxes included
                          </span>
                        </div>
                        <span className="text-2xl font-extrabold text-commuter-900">
                          {formatCurrency(fare.totalPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Policy */}
                <div className="rounded-lg bg-mobility-50/60 p-3 text-xs text-mobility-900 border border-mobility-200 space-y-1">
                  <p className="font-bold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-mobility-700" />
                    Commuter Protection Policy
                  </p>
                  <p className="text-[11px] text-mobility-800 leading-relaxed">
                    Free cancellation up to 2 hours before scheduled departure. Drivers cannot accept duplicate requests for booked seats.
                  </p>
                </div>

                {/* Action CTA */}
                <div>
                  <Button
                    onClick={handleBookingSubmit}
                    isLoading={isSubmitting}
                    disabled={bookingConfirmed || ride.availableSeats < selectedSeats}
                    size="lg"
                    className="w-full font-bold shadow-md shadow-mobility-600/20"
                  >
                    {bookingConfirmed ? "Request Sent" : "Request Seat Reservation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
