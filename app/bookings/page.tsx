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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Booking, BookingStatus } from "@/features/types";
import { formatCurrency, formatDistance, formatTime } from "@/lib/utils";

export default function BookingsManagementPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"all" | "confirmed" | "pending" | "cancelled">("all");

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
        return <Badge variant="success">Confirmed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending Confirmation</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-commuter-200">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700">
              <CalendarCheck className="w-4 h-4" />
              <span>Passenger Bookings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-commuter-900 mt-1">
              Your Reserved Journeys
            </h1>
            <p className="text-xs sm:text-sm text-commuter-500 mt-0.5">
              Review upcoming departure times, driver contact info, and manage seat reservations.
            </p>
          </div>

          <Link href="/rides">
            <Button size="sm" variant="outline" className="font-semibold">
              Find New Ride
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-commuter-200 pb-2">
          {(
            [
              { id: "all", label: "All Reservations" },
              { id: "confirmed", label: "Confirmed" },
              { id: "pending", label: "Pending" },
              { id: "cancelled", label: "Cancelled" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-mobility-600 text-white shadow-sm"
                  : "text-commuter-600 hover:bg-commuter-100 hover:text-commuter-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-mobility-600 mx-auto mb-2" />
            <p className="text-xs text-commuter-500">Loading your journeys...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-commuter-300 bg-white p-12 text-center space-y-3">
            <CalendarCheck className="w-10 h-10 text-commuter-400 mx-auto" />
            <h3 className="text-base font-bold text-commuter-900">
              No bookings in this category
            </h3>
            <p className="text-xs text-commuter-500 max-w-sm mx-auto">
              Search the commuter network to reserve a seat on overlapping highway routes.
            </p>
            <div className="pt-2">
              <Link href="/rides">
                <Button size="sm" className="font-bold">
                  Discover Rides
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <Card key={b.id} className="bg-white hover:border-commuter-300 transition-all">
                <CardContent className="p-6">
                  {/* Top Status & Price */}
                  <div className="flex items-start justify-between pb-4 border-b border-commuter-100">
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(b.status)}
                      <span className="text-xs text-commuter-500 font-medium">
                        Booking Ref: {b.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-commuter-900">
                        {formatCurrency(b.totalPaid)}
                      </span>
                      <span className="block text-[10px] text-commuter-400">
                        {b.seatsBooked} {b.seatsBooked === 1 ? "seat" : "seats"} · fare paid
                      </span>
                    </div>
                  </div>

                  {/* Route & Times */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-400 block">
                            Pickup Point
                          </span>
                          <p className="font-bold text-commuter-900">{b.pickupLocation.city}</p>
                          <p className="text-commuter-500 text-[11px]">{b.pickupLocation.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-mobility-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-400 block">
                            Drop-off Destination
                          </span>
                          <p className="font-bold text-commuter-900">{b.dropoffLocation.city}</p>
                          <p className="text-commuter-500 text-[11px]">{b.dropoffLocation.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Driver & Trip Schedule */}
                    <div className="p-3.5 rounded-xl bg-commuter-50 border border-commuter-200 text-xs flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={b.ride?.driver?.avatarUrl}
                            alt={b.ride?.driver?.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-commuter-200"
                          />
                          <div>
                            <p className="font-bold text-commuter-900">
                              {b.ride?.driver?.fullName}
                            </p>
                            <p className="text-[11px] text-commuter-500">
                              {b.ride?.vehicle?.make} {b.ride?.vehicle?.model} ({b.ride?.vehicle?.licensePlate})
                            </p>
                          </div>
                        </div>

                        {b.ride?.departureTime && (
                          <div className="text-right">
                            <span className="font-bold text-commuter-900 block">
                              {formatTime(b.ride.departureTime)}
                            </span>
                            <span className="text-[10px] text-commuter-500">
                              Scheduled departure
                            </span>
                          </div>
                        )}
                      </div>

                      {b.status === "cancelled" && b.cancellationReason && (
                        <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200">
                          Cancellation reason: {b.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="mt-5 pt-4 border-t border-commuter-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs text-commuter-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Free cancellation up to 2 hours prior to departure</span>
                    </div>

                    {b.status !== "cancelled" && b.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancellingBooking(b)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        Cancel Reservation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          title="Cancel Seat Reservation"
          description="Are you sure you want to cancel this booking?"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-commuter-600 leading-relaxed">
              Cancelling releases your {cancellingBooking?.seatsBooked} reserved seat(s) back to the commuter pool. The driver will be notified immediately.
            </p>

            <div>
              <label className="block text-xs font-semibold text-commuter-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Work schedule changed, taking alternate transit."
                className="w-full p-2.5 rounded-lg border border-commuter-200 text-xs font-medium text-commuter-900 focus:outline-none focus:border-mobility-600"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-commuter-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingBooking(null)}
                disabled={isCancelling}
              >
                Keep Booking
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
      </div>
    </div>
  );
}
