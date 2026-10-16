"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  MapPin,
  Car,
  AlertCircle,
  XCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Lock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Booking, BookingStatus, VEHICLE_TIERS } from "@/features/types";
import { formatCurrency, formatDistance, formatTime } from "@/lib/utils";
import { RoleGuard } from "@/components/auth/role-guard";

export default function BookingsManagementPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"all" | "confirmed" | "completed" | "cancelled">("all");

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = React.useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);

  const fetchBookings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings?role=passenger&userId=u-demo-passenger");
      const data = await res.json();
      if (data.success && data.data) {
        setBookings(data.data);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancellingBooking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Cancelled by passenger" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "info",
          title: "Booking Cancelled",
          message: "The driver has been notified and seats have been released.",
        });
        setCancellingBooking(null);
        setCancelReason("");
        fetchBookings();
      }
    } catch {
      showToast({
        type: "error",
        title: "Cancellation Failed",
        message: "Please try again later.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success" className="font-bold">Confirmed · Ready to Board</Badge>;
      case "in_progress":
        return <Badge variant="warning" className="font-bold bg-amber-500 text-white animate-pulse">Trip in Progress</Badge>;
      case "pending":
        return <Badge variant="warning">Awaiting Driver</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RoleGuard requiredRole="passenger" portalName="Rider Bookings Dashboard">
      <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-commuter-200">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700">
              <CalendarCheck className="w-4 h-4" />
              <span>Rider Dashboard · Tamil Nadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-commuter-900 mt-1">
              My Rides & Start PINs
            </h1>
            <p className="text-xs sm:text-sm text-commuter-500 mt-0.5">
              Access your 4-digit start OTPs, driver vehicle information, and live journey statuses.
            </p>
          </div>

          <Link href="/rides">
            <Button size="sm" className="font-bold bg-commuter-900 hover:bg-black text-white">
              Book Another Ride
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-commuter-200 pb-2">
          {(
            [
              { id: "all", label: "All Rides" },
              { id: "confirmed", label: "Active & Confirmed" },
              { id: "completed", label: "Past Journeys" },
              { id: "cancelled", label: "Cancelled" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-commuter-900 text-white shadow-xs"
                  : "text-commuter-600 hover:bg-commuter-100 hover:text-commuter-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-commuter-200">
            <Loader2 className="w-8 h-8 animate-spin text-mobility-600 mx-auto mb-2" />
            <p className="text-xs text-commuter-500">Retrieving your ride schedule...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-commuter-300 bg-white p-12 text-center space-y-3">
            <CalendarCheck className="w-10 h-10 text-commuter-400 mx-auto" />
            <h3 className="text-base font-bold text-commuter-900">
              No rides in this category
            </h3>
            <p className="text-xs text-commuter-500 max-w-sm mx-auto">
              Ready to commute? Search verified Auto, Bike, and Cab routes across Tamil Nadu.
            </p>
            <div className="pt-2">
              <Link href="/rides">
                <Button size="sm" className="font-bold bg-commuter-900 hover:bg-black text-white">
                  Discover Rides
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const ride = b.ride;
              const tier = VEHICLE_TIERS.find((t) => t.type === b.vehicleType || t.type === ride?.vehicleType) ?? VEHICLE_TIERS[3];
              const isActionable = b.status === "confirmed" || b.status === "in_progress";

              return (
                <Card
                  key={b.id}
                  className={`bg-white transition-all overflow-hidden ${
                    isActionable
                      ? "border-emerald-300 shadow-md ring-1 ring-emerald-500/20"
                      : "border-commuter-200 hover:border-commuter-300"
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Top Status & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-commuter-100 gap-3">
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(b.status)}
                        <span className="text-xs text-commuter-500 font-mono">
                          Ref: {b.id}
                        </span>
                        <span className="text-xs font-bold text-commuter-700 bg-commuter-100 px-2 py-0.5 rounded flex items-center space-x-1">
                          <span>{tier.emoji}</span>
                          <span>{tier.name}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-commuter-900">
                          {formatCurrency(b.totalPaid)}
                        </span>
                        <span className="block text-[10px] text-commuter-400 font-medium">
                          {b.seatsBooked} {b.seatsBooked === 1 ? "seat" : "seats"} · Paid via UPI/Cash
                        </span>
                      </div>
                    </div>

                    {/* Active Ride 4-Digit OTP Hero Banner */}
                    {isActionable && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center">
                            <Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Share with Driver Upon Boarding
                          </span>
                          <p className="text-xs text-emerald-950 font-medium">
                            Your driver will enter this 4-digit PIN on their console to start your trip.
                          </p>
                        </div>
                        <div className="bg-white border-2 border-emerald-500 px-5 py-2.5 rounded-xl shadow-xs text-center flex-shrink-0">
                          <span className="text-[10px] uppercase font-bold text-commuter-400 block">
                            Start OTP
                          </span>
                          <span className="text-2xl font-black tracking-widest text-emerald-700 font-mono">
                            {b.startOtp || "5829"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Route & Times */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-400 block">
                              Pickup Location
                            </span>
                            <p className="font-bold text-commuter-900">{b.pickupLocation.city}</p>
                            <p className="text-commuter-500 text-[11px]">{b.pickupLocation.address}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-mobility-600 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-400 block">
                              Drop-off Destination
                            </span>
                            <p className="font-bold text-commuter-900">{b.dropoffLocation.city}</p>
                            <p className="text-commuter-500 text-[11px]">{b.dropoffLocation.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Driver Partner Details */}
                      {ride && (
                        <div className="bg-commuter-50 rounded-xl p-3.5 border border-commuter-200 flex flex-col justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <img
                              src={ride.driver?.avatarUrl}
                              alt={ride.driver?.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-commuter-200"
                            />
                            <div>
                              <p className="font-bold text-commuter-900">
                                {ride.driver?.fullName}
                              </p>
                              <p className="text-[11px] text-commuter-500">
                                {ride.vehicle?.make} {ride.vehicle?.model} · <strong className="text-commuter-800">{ride.vehicle?.licensePlate}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-commuter-200/60 flex items-center justify-between">
                            <span className="text-[11px] text-commuter-600 flex items-center">
                              <Phone className="w-3 h-3 mr-1 text-mobility-600" />
                              {ride.driver?.phoneNumber}
                            </span>
                            <a
                              href={`tel:${ride.driver?.phoneNumber}`}
                              className="text-[11px] font-bold text-mobility-700 hover:text-mobility-900"
                            >
                              Call Driver
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-4 border-t border-commuter-100 flex items-center justify-between text-xs">
                      <span className="text-commuter-400">
                        Booked on {new Date(b.createdAt).toLocaleDateString()}
                      </span>

                      {b.status === "confirmed" && (
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="text-rose-600 hover:text-rose-800 font-bold transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        {cancellingBooking && (
          <Modal
            isOpen={true}
            onClose={() => setCancellingBooking(null)}
            title="Cancel Booking"
            description="Are you sure you want to cancel this reservation? The driver will be alerted immediately."
          >
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule changed, booked different time..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-commuter-200 text-xs font-medium text-commuter-900 focus:outline-none focus:border-mobility-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancellingBooking(null)}
                  disabled={isCancelling}
                >
                  Keep Reservation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancelBooking}
                  isLoading={isCancelling}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}
