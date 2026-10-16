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
  Lock,
  Phone,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RouteTimeline } from "@/components/ui/route-timeline";
import { InteractiveMap } from "@/components/map/interactive-map";
import { useToast } from "@/components/ui/toast";
import { Booking, Ride, VEHICLE_TIERS } from "@/features/types";
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
  const [confirmedBooking, setConfirmedBooking] = React.useState<Booking | null>(null);

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
          passengerId: "u-demo-passenger",
          vehicleType: ride.vehicleType,
          seatsBooked: selectedSeats,
          pickupLocation: ride.origin,
          dropoffLocation: ride.destination,
          segmentDistanceKm: ride.totalDistanceKm,
          detourDistanceKm: 1.0,
          fareAmount: fare.fareAmount,
          platformFee: fare.platformFee,
          totalPaid: fare.totalPaid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedBooking(data.data);
        showToast({
          type: "success",
          title: "Ride Booked Successfully!",
          message: `Your 4-digit start OTP is ${data.data.startOtp}. Share with driver when boarding.`,
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
        title: "Connection Error",
        message: "Failed to communicate with booking server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-commuter-50">
        <Loader2 className="w-8 h-8 animate-spin text-mobility-600 mb-3" />
        <p className="text-sm font-semibold text-commuter-700">Loading trip itinerary...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-commuter-50">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-commuter-900">Trip Not Found</h2>
        <p className="text-xs text-commuter-500 mt-1 mb-4">
          This ride may have already departed or been cancelled.
        </p>
        <Link href="/rides">
          <Button variant="outline">Back to Available Rides</Button>
        </Link>
      </div>
    );
  }

  const tier = VEHICLE_TIERS.find((t) => t.type === ride.vehicleType) ?? VEHICLE_TIERS[3];

  return (
    <div className="flex-1 flex flex-col bg-commuter-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/rides"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-commuter-600 hover:text-commuter-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search Results</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xl">{tier.emoji}</span>
            <Badge variant="outline" className="font-bold">
              {tier.name}
            </Badge>
            <Badge variant="success" className="font-bold">
              {ride.availableSeats} seats remaining
            </Badge>
          </div>
        </div>

        {/* Booking Confirmed Banner (Ola / Uber OTP Card) */}
        {confirmedBooking && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-commuter-900 text-white shadow-xl border border-emerald-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ride Confirmed with Driver {ride.driver?.fullName}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Trip Confirmed · Start PIN
                </h2>
                <p className="text-xs text-emerald-200 max-w-lg leading-relaxed">
                  Share this 4-digit code with the driver inside the car when you board. The driver cannot start the meter or trip without this PIN.
                </p>
              </div>

              {/* Bold 4-Digit OTP Box */}
              <div className="bg-white text-commuter-900 p-5 rounded-2xl shadow-lg border border-white text-center min-w-[200px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-500 block mb-1 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  4-Digit Start OTP
                </span>
                <span className="text-4xl font-black tracking-widest text-emerald-700 font-mono block">
                  {confirmedBooking.startOtp || "5829"}
                </span>
                <span className="text-[10px] text-commuter-400 font-semibold block mt-1">
                  Keep this private until pickup
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4">
                <span className="text-emerald-200">
                  Vehicle: <strong className="text-white">{ride.vehicle?.make} {ride.vehicle?.model} ({ride.vehicle?.licensePlate})</strong>
                </span>
                <span className="text-emerald-200">
                  Driver Contact: <strong className="text-white">{ride.driver?.phoneNumber}</strong>
                </span>
              </div>
              <Link href="/bookings">
                <Button size="sm" className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold">
                  View in My Bookings
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Route Itinerary & Driver Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Itinerary Header Card */}
            <Card className="border-commuter-200 shadow-xs bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-commuter-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-mobility-700">
                      Corridor Route · Tamil Nadu
                    </span>
                    <h1 className="text-2xl font-black text-commuter-900 mt-1">
                      {ride.origin.city} ➔ {ride.destination.city}
                    </h1>
                    <p className="text-xs text-commuter-500 mt-0.5">
                      Departing on {formatTime(ride.departureTime)} ({formatDuration(ride.estimatedDurationMinutes)} commute)
                    </p>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-commuter-400 block">
                      Single Seat Fare
                    </span>
                    <span className="text-2xl font-black text-commuter-900">
                      {formatCurrency(ride.totalDistanceKm * ride.basePricePerKm)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Fixed Commuter Rate
                    </span>
                  </div>
                </div>

                {/* Interactive Map Visual */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-commuter-200 h-64 w-full">
                  <InteractiveMap
                    origin={ride.origin}
                    destination={ride.destination}
                    waypoints={ride.waypoints}
                    className="h-full w-full"
                  />
                </div>

                {/* Detailed Stopover Timeline */}
                <div className="mt-6 pt-4 border-t border-commuter-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-commuter-500 mb-4">
                    Stops Along the Highway Corridor
                  </h3>
                  <RouteTimeline
                    origin={ride.origin}
                    destination={ride.destination}
                    waypoints={ride.waypoints}
                    departureTime={ride.departureTime}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Driver & Vehicle Profile */}
            <Card className="border-commuter-200 shadow-xs bg-white">
              <CardContent className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-commuter-500 mb-4">
                  Verified Captain & Vehicle Specs
                </h3>

                <div className="flex items-start space-x-4">
                  <img
                    src={ride.driver?.avatarUrl}
                    alt={ride.driver?.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-commuter-200 shadow-xs"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-commuter-900">
                        {ride.driver?.fullName}
                      </h4>
                      <Badge variant="success" className="font-bold flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Verified Partner
                      </Badge>
                    </div>
                    <p className="text-xs text-commuter-500 mt-0.5">
                      <span className="font-bold text-amber-500">★ {ride.driver?.ratingAverage.toFixed(2)}</span>
                      {" · "}
                      <span>{ride.driver?.ratingCount} trips completed</span>
                      {" · "}
                      <span className="font-mono text-commuter-700 font-semibold">{ride.driver?.drivingLicenseNo}</span>
                    </p>
                    <p className="text-xs text-commuter-600 mt-2 leading-relaxed">
                      {ride.driver?.bio}
                    </p>
                  </div>
                </div>

                {/* Vehicle Specs Grid */}
                {ride.vehicle && (
                  <div className="mt-6 pt-4 border-t border-commuter-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-bold text-commuter-900">{tier.name} {tier.emoji}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Model</span>
                      <span className="font-bold text-commuter-900">{ride.vehicle.make} {ride.vehicle.model}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Registration</span>
                      <span className="font-mono font-bold text-commuter-900">{ride.vehicle.licensePlate}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-commuter-50 border border-commuter-200">
                      <span className="text-commuter-400 block text-[10px] uppercase font-bold">Available Seats</span>
                      <span className="font-bold text-emerald-700">{ride.availableSeats} of {ride.totalSeats} open</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Fare Breakdown & Reservation Box (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <Card className="border-mobility-200 shadow-md bg-white">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-commuter-900">
                    Reserve Your Ride
                  </h3>
                  <p className="text-xs text-commuter-500 mt-0.5">
                    Transparent distance-based fare in Indian Rupees (₹).
                  </p>
                </div>

                {/* Seat Picker Stepper */}
                <div className="p-3.5 rounded-xl bg-commuter-50 border border-commuter-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-commuter-600" />
                    <span className="text-xs font-bold text-commuter-900">
                      Number of Passengers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSeats((s) => Math.max(1, s - 1))}
                      disabled={selectedSeats <= 1}
                      className="w-8 h-8 rounded-lg border border-commuter-300 bg-white text-sm font-bold text-commuter-800 disabled:opacity-40 hover:bg-commuter-100"
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
                      className="w-8 h-8 rounded-lg border border-commuter-300 bg-white text-sm font-bold text-commuter-800 disabled:opacity-40 hover:bg-commuter-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Transparent Fare Allocation Table */}
                {fare && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-commuter-500">
                      Fare Breakdown (₹)
                    </h4>
                    <div className="rounded-xl border border-commuter-200 bg-commuter-50/50 p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-commuter-700">
                        <span>Distance Fare ({formatDistance(ride.totalDistanceKm)} × ₹{ride.basePricePerKm}/km)</span>
                        <span className="font-bold text-commuter-900">{formatCurrency(fare.grossFare)}</span>
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
                          <span title="Maintains 24/7 SOS and verified driver tracking">
                            <HelpCircle className="w-3 h-3 ml-1 text-commuter-400" />
                          </span>
                        </span>
                        <span className="font-semibold text-commuter-900">{formatCurrency(fare.platformFee)}</span>
                      </div>

                      <div className="pt-3 border-t border-commuter-200 flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-commuter-900">Total Fare Payable</span>
                          <span className="block text-[10px] text-commuter-400">
                            {selectedSeats} passenger(s) · Zero surge guarantee
                          </span>
                        </div>
                        <span className="text-2xl font-black text-commuter-900">
                          {formatCurrency(fare.totalPaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTP Security Notice */}
                <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    You will receive a unique <strong>4-digit start PIN</strong> immediately after confirmation. Never share it with anyone before boarding.
                  </p>
                </div>

                {/* Action CTA */}
                <div>
                  <Button
                    onClick={handleBookingSubmit}
                    isLoading={isSubmitting}
                    disabled={!!confirmedBooking || ride.availableSeats < selectedSeats}
                    size="lg"
                    className="w-full font-bold h-12 bg-commuter-900 hover:bg-black text-white shadow-md shadow-commuter-900/20 rounded-xl"
                  >
                    {confirmedBooking ? "Seat Reserved Successfully" : `Confirm Booking (${formatCurrency(fare?.totalPaid || 0)})`}
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
