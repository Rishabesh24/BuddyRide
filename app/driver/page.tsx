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
  ShieldCheck,
  Lock,
  Phone,
  Power,
  DollarSign,
  Wallet,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Booking, Ride, Vehicle, VEHICLE_TIERS } from "@/features/types";
import { useRole } from "@/context/role-context";
import { RoleGuard } from "@/components/auth/role-guard";
import { formatCurrency, formatDistance } from "@/lib/utils";

export default function DriverDashboardPage() {
  const { showToast } = useToast();
  const { role, switchRole, isOnline, toggleOnline, currentUser } = useRole();

  const [driverRides, setDriverRides] = React.useState<Ride[]>([]);
  const [driverBookings, setDriverBookings] = React.useState<Booking[]>([]);
  const [driverVehicle, setDriverVehicle] = React.useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // OTP Verification state
  const [otpInputs, setOtpInputs] = React.useState<{ [bookingId: string]: string }>({});
  const [verifyingOtpId, setVerifyingOtpId] = React.useState<string | null>(null);

  // Dynamic driver ID linked to current authenticated account
  const driverId = currentUser?.id || "u-karthik-sedan";

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch rides for this driver
      const ridesRes = await fetch(`/api/rides?driverId=${encodeURIComponent(driverId)}`);
      const ridesData = await ridesRes.json();
      if (ridesData.success && Array.isArray(ridesData.data)) {
        setDriverRides(ridesData.data);
      }

      // 2. Fetch driver incoming bookings
      const bookingsRes = await fetch(`/api/bookings?role=driver&userId=${encodeURIComponent(driverId)}`);
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success && Array.isArray(bookingsData.data)) {
        setDriverBookings(bookingsData.data);
      }

      // 3. Fetch driver vehicle
      const vehicleRes = await fetch(`/api/vehicles?driverId=${encodeURIComponent(driverId)}`);
      const vehicleData = await vehicleRes.json();
      if (vehicleData.success && Array.isArray(vehicleData.data) && vehicleData.data.length > 0) {
        setDriverVehicle(vehicleData.data[0]);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

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
          message: "Trip confirmed. Ask passenger for their 4-digit start PIN when picking up.",
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
        body: JSON.stringify({ reason: "Route capacity full" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "info",
          title: "Request Declined",
          message: "The commuter has been notified to choose an alternative ride.",
        });
        fetchDashboardData();
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

  // Verify Passenger 4-digit OTP to start trip
  const handleVerifyOtp = async (bookingId: string) => {
    const otp = otpInputs[bookingId]?.trim();
    if (!otp || otp.length !== 4) {
      showToast({
        type: "error",
        title: "Invalid OTP",
        message: "Please enter the complete 4-digit start PIN provided by passenger.",
      });
      return;
    }

    setVerifyingOtpId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "success",
          title: "OTP Verified!",
          message: "Trip is now in progress. Drive safely!",
        });
        fetchDashboardData();
      } else {
        showToast({
          type: "error",
          title: "Incorrect OTP",
          message: data.error?.message || "PIN did not match.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Could not verify PIN.",
      });
    } finally {
      setVerifyingOtpId(null);
    }
  };

  // Complete Trip
  const handleCompleteTrip = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "success",
          title: "Trip Completed!",
          message: "Fare has been credited to your today's earnings.",
        });
        fetchDashboardData();
      }
    } catch {
      showToast({
        type: "error",
        title: "Error",
        message: "Could not mark trip complete.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingBookings = driverBookings.filter((b) => b.status === "pending");
  const activeBookings = driverBookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  );
  const completedBookings = driverBookings.filter((b) => b.status === "completed");

  const completedFares = completedBookings.reduce((sum, b) => sum + (b.fareAmount || 0), 0);
  const isDemoAccount = driverId === "u-karthik-sedan";
  const grossEarnings = isDemoAccount
    ? (completedFares > 0 ? 2450 + completedFares : 2450)
    : (completedFares + (currentUser?.todayEarnings || 0));
  const platformCut = Math.round(grossEarnings * 0.05 * 100) / 100;
  const netPayout = Math.round((grossEarnings - platformCut) * 100) / 100;

  return (
    <RoleGuard requiredRole="driver" portalName="Driver Partner Console">
      <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

        {/* Driver Header & Online Toggle */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-commuter-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser?.fullName || "Driver Captain"}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-commuter-200 shadow-xs bg-commuter-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-mobility-100 text-mobility-800 font-black text-xl flex items-center justify-center border-2 border-commuter-200 shadow-xs">
                {currentUser?.fullName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "DR"}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-commuter-900">
                  {currentUser?.fullName || "Driver Captain"}
                </h1>
                <Badge variant="success" className="font-bold">
                  {currentUser?.isKycVerified ? "Verified Captain" : "Registered Captain"}
                </Badge>
              </div>
              <p className="text-xs text-commuter-500 mt-1">
                {driverVehicle ? (
                  <>
                    {driverVehicle.type ? `${driverVehicle.type.toUpperCase()} Captain` : "Prime Captain"} · {driverVehicle.make} {driverVehicle.model} (<strong className="text-commuter-900 font-mono">{driverVehicle.licensePlate}</strong>)
                  </>
                ) : driverRides.length > 0 && driverRides[0].vehicle ? (
                  <>
                    Prime Captain · {driverRides[0].vehicle.make} {driverRides[0].vehicle.model} (<strong className="text-commuter-900 font-mono">{driverRides[0].vehicle.licensePlate}</strong>)
                  </>
                ) : (
                  <>Fleet Partner · All-Tamil Nadu Transit Certified</>
                )}
              </p>
              <div className="flex items-center space-x-3 text-xs text-commuter-600 mt-2">
                <span className="font-bold text-amber-500">
                  ★ {(currentUser?.ratingAverage ?? 5.0).toFixed(2)} ({currentUser?.ratingCount ?? 0} rides)
                </span>
                <span>·</span>
                <span className="font-mono text-commuter-500">
                  Lic: {currentUser?.drivingLicenseNo || "TN-07-2024-0049102"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Online/Offline Master Switch */}
          <div className="flex items-center space-x-4 bg-commuter-50 p-3 rounded-2xl border border-commuter-200">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-400 block">
                Driver Status
              </span>
              <span className="text-sm font-bold text-commuter-900 flex items-center justify-end space-x-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? "bg-emerald-500 animate-pulse" : "bg-commuter-400"
                  }`}
                />
                <span>{isOnline ? "Online & Receiving Rides" : "Offline"}</span>
              </span>
            </div>
            <button
              onClick={toggleOnline}
              className={`p-3 rounded-xl border transition-all ${
                isOnline
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  : "bg-commuter-200 text-commuter-600 hover:bg-commuter-300"
              }`}
              title="Toggle Online Mode"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Driver Earnings & Performance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
              Today&apos;s Gross Fares
            </span>
            <span className="text-2xl font-black text-commuter-900">
              {formatCurrency(grossEarnings)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              {completedBookings.length > 0 ? `${completedBookings.length} completed trip(s)` : isDemoAccount ? "+₹620 vs yesterday" : "Live earnings ledger"}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
              Platform Cut (5%)
            </span>
            <span className="text-2xl font-black text-commuter-600">
              {formatCurrency(platformCut)}
            </span>
            <span className="text-[11px] text-commuter-400 font-medium block mt-1">
              Maintains 24/7 safety & maps
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              Net Take-Home Payout
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {formatCurrency(netPayout)}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-1">
              Auto-settled to UPI daily
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
                Publish Corridor
              </span>
              <span className="text-xs text-commuter-600 font-medium">
                Going outstation or daily OMR?
              </span>
            </div>
            <Link href="/driver/publish">
              <Button size="sm" className="font-bold bg-commuter-900 hover:bg-black text-white">
                <PlusCircle className="w-4 h-4 mr-1" />
                Publish
              </Button>
            </Link>
          </div>
        </div>

        {/* Driver Published Corridors & Schedules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-commuter-900 flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-mobility-600" />
              <span>My Published Corridors ({driverRides.length})</span>
            </h2>
            <Link href="/driver/publish">
              <Button size="sm" className="font-bold bg-commuter-900 hover:bg-black text-white text-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Publish New Corridor
              </Button>
            </Link>
          </div>

          {driverRides.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-commuter-200">
              <div className="w-12 h-12 rounded-2xl bg-mobility-50 text-mobility-600 flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-commuter-900">
                Welcome to your Captain Console, {currentUser?.fullName}!
              </h3>
              <p className="text-xs text-commuter-500 mt-1 max-w-md mx-auto">
                You haven&apos;t scheduled any transit corridors yet. Set up your first commute along Tamil Nadu highways to start receiving passenger bookings.
              </p>
              <div className="mt-4">
                <Link href="/driver/publish">
                  <Button className="font-bold bg-mobility-600 hover:bg-mobility-700 text-white text-xs px-5">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Publish Your First Corridor
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driverRides.map((ride) => (
                <div
                  key={ride.id}
                  className="p-5 rounded-2xl bg-white border border-commuter-200 shadow-xs hover:border-mobility-400 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-400 block">
                        Corridor Route
                      </span>
                      <h4 className="font-bold text-sm text-commuter-900">
                        {ride.origin.city} ➔ {ride.destination.city}
                      </h4>
                    </div>
                    <Badge variant={ride.status === "scheduled" ? "success" : "secondary"}>
                      {ride.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-commuter-600 pt-2 border-t border-commuter-100">
                    <div>
                      <span className="text-[10px] font-bold text-commuter-400 block">DEPARTURE</span>
                      <span className="font-semibold text-commuter-900">
                        {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(ride.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-commuter-400 block">SEATS & FARE</span>
                      <span className="font-semibold text-commuter-900">
                        {ride.availableSeats}/{ride.totalSeats} Available · ₹{ride.basePricePerKm}/km
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-commuter-500 pt-1 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">
                      📍 {ride.origin.address.split(",")[0]}
                    </span>
                    <span className="font-medium text-mobility-700">
                      {ride.waypoints && ride.waypoints.length > 0 ? `+${ride.waypoints.length} stops` : 'Direct Corridor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Trips Requiring Passenger OTP Verification */}
        {activeBookings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-black text-commuter-900">
                Active & Boarding Trips ({activeBookings.length})
              </h2>
            </div>

            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-3xl bg-white border-2 border-emerald-500 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-commuter-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {b.passenger?.fullName?.split(" ").map((w) => w[0]).join("") || "R"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-commuter-900">
                          {b.passenger?.fullName || "Commuter Passenger"}
                        </span>
                        <Badge variant={b.status === "in_progress" ? "warning" : "success"}>
                          {b.status === "in_progress" ? "🟢 In Transit" : "📍 Arrived for Pickup"}
                        </Badge>
                      </div>
                      <p className="text-xs text-commuter-500">
                        {b.seatsBooked} seat(s) · Fare: <strong>{formatCurrency(b.fareAmount)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${b.passenger?.phoneNumber || "+919840988123"}`}
                      className="px-3 py-1.5 rounded-xl border border-commuter-200 text-xs font-bold text-commuter-700 hover:bg-commuter-100 flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-mobility-600" />
                      <span>Call Rider</span>
                    </a>
                  </div>
                </div>

                {/* Pickup & Dropoff Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-commuter-400 block">Pickup</span>
                      <span className="font-bold text-commuter-900">{b.pickupLocation.address}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 rounded-full bg-mobility-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-commuter-400 block">Dropoff</span>
                      <span className="font-bold text-commuter-900">{b.dropoffLocation.address}</span>
                    </div>
                  </div>
                </div>

                {/* OTP Verification Box or Trip Completion */}
                {b.status === "confirmed" ? (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                        Enter Rider&apos;s 4-Digit Start OTP
                      </span>
                      <p className="text-[11px] text-amber-800">
                        Ask the passenger for their start PIN to unlock and begin this trip.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 5829"
                        value={otpInputs[b.id] || ""}
                        onChange={(e) =>
                          setOtpInputs({ ...otpInputs, [b.id]: e.target.value })
                        }
                        className="w-28 h-10 px-3 text-center text-lg font-black tracking-widest font-mono rounded-xl border border-amber-300 bg-white text-commuter-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleVerifyOtp(b.id)}
                        isLoading={verifyingOtpId === b.id}
                        className="h-10 font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 rounded-xl"
                      >
                        Start Trip
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        Trip In Progress
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Rider safely boarded. Drive towards {b.dropoffLocation.city}.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTrip(b.id)}
                      isLoading={actionLoadingId === b.id}
                      className="font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                    >
                      Complete Trip & Credit ₹{b.fareAmount}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Incoming Commuter Requests Waiting for Acceptance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-commuter-900 flex items-center space-x-2">
              <span>Incoming Ride Requests</span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {pendingBookings.length} new
              </span>
            </h2>
            <span className="text-xs text-commuter-500">
              Overlapping your corridor with ≤ 4 km detour
            </span>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-commuter-200">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-commuter-900">
                All requests attended to!
              </h3>
              <p className="text-xs text-commuter-500 mt-1 max-w-sm mx-auto">
                Keep your status Online. New requests along OMR, GST Road, and Central corridors will pop up here in real time.
              </p>
            </div>
          ) : (
            pendingBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white border border-commuter-200 shadow-xs hover:border-mobility-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-commuter-100 flex items-center justify-center font-bold text-xs text-commuter-700">
                      Rider
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-commuter-900">
                        {b.passenger?.fullName || "Commuter Passenger"}
                      </h4>
                      <p className="text-xs text-commuter-500">
                        Requested {b.seatsBooked} seat(s) · {formatDistance(b.segmentDistanceKm)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-commuter-400 block">
                      Driver Payout
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {formatCurrency(b.fareAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-commuter-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-commuter-400 block">From</span>
                    <span className="font-medium text-commuter-800">{b.pickupLocation.address}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-commuter-400 block">To</span>
                    <span className="font-medium text-commuter-800">{b.dropoffLocation.address}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectBooking(b.id)}
                    disabled={actionLoadingId === b.id}
                    className="text-xs font-bold"
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptBooking(b.id)}
                    isLoading={actionLoadingId === b.id}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Accept & Confirm
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
