import * as React from "react";
import Link from "next/link";
import {
  Compass,
  Car,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommuterSearchBar } from "@/components/commuter-search-bar";
import { SEED_RIDES } from "@/lib/fixtures/rides";
import { formatCurrency, formatTime } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-commuter-50 to-mobility-50/30 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full border border-mobility-300 bg-mobility-50 px-3.5 py-1 text-xs font-semibold text-mobility-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-mobility-600" />
              <span>Algorithmic Commuter Matching · Zero Surge Pricing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-commuter-900 leading-[1.15]">
              Share the Journey. <br />
              <span className="text-mobility-600">Split the Cost.</span> Cut the Commute.
            </h1>

            <p className="text-base sm:text-lg text-commuter-600 max-w-2xl mx-auto leading-relaxed">
              RouteShare links drivers with empty seats to commuters traveling along the exact same highway or arterial corridor. Guaranteed maximum detour limits and fair, proportional fares.
            </p>
          </div>

          {/* Commuter Search Bar (Interactive Client Component) */}
          <CommuterSearchBar />
        </div>
      </section>

      {/* Live Featured Rides Section */}
      <section className="py-16 bg-white border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Commuter Listings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-commuter-900 mt-1">
                Active Trips Open for Booking
              </h2>
            </div>
            <Link
              href="/rides"
              className="mt-3 sm:mt-0 text-sm font-semibold text-mobility-600 hover:text-mobility-800 flex items-center space-x-1"
            >
              <span>Explore all rides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEED_RIDES.slice(0, 3).map((ride) => (
              <Card key={ride.id} className="hover:border-mobility-300 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Header: Driver & Rating */}
                    <div className="flex items-center justify-between pb-3 border-b border-commuter-100">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={ride.driver?.avatarUrl}
                          alt={ride.driver?.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-commuter-200"
                        />
                        <div>
                          <p className="font-bold text-sm text-commuter-900">
                            {ride.driver?.fullName}
                          </p>
                          <p className="text-xs text-commuter-500">
                            ★ {ride.driver?.ratingAverage.toFixed(2)} ({ride.driver?.ratingCount} trips)
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">
                        {ride.availableSeats} seats open
                      </Badge>
                    </div>

                    {/* Route Details */}
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-commuter-900">{ride.origin.city}</p>
                          <p className="text-commuter-500 text-[11px] truncate max-w-[220px]">
                            {ride.origin.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-mobility-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-commuter-900">{ride.destination.city}</p>
                          <p className="text-commuter-500 text-[11px] truncate max-w-[220px]">
                            {ride.destination.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle & Time info */}
                    <div className="mt-4 pt-3 border-t border-commuter-100 flex items-center justify-between text-xs text-commuter-600">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 text-commuter-400 mr-1" />
                        {formatTime(ride.departureTime)}
                      </span>
                      <span>
                        {ride.vehicle?.make} {ride.vehicle?.model}
                      </span>
                    </div>
                  </div>

                  {/* Fare & CTA */}
                  <div className="mt-5 pt-3 border-t border-commuter-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-commuter-400 block">
                        Est. Fare / Seat
                      </span>
                      <span className="text-lg font-bold text-commuter-900">
                        {formatCurrency(ride.totalDistanceKm * ride.basePricePerKm)}
                      </span>
                    </div>
                    <Link href={`/rides/${ride.id}`}>
                      <Button size="sm" variant="subtle" className="font-semibold">
                        View & Book
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Algorithmic Principles) */}
      <section className="py-20 bg-commuter-50 border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-commuter-900">
              How RouteShare Evaluates Compatibility
            </h2>
            <p className="mt-2 text-sm text-commuter-600">
              Unlike generic bulletin boards, RouteShare uses spherical geometry and waypoint insertion to protect your travel schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-commuter-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-mobility-50 text-mobility-700 flex items-center justify-center font-bold text-base mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-commuter-900">
                Geometric Route Overlap
              </h3>
              <p className="mt-2 text-sm text-commuter-600 leading-relaxed">
                We compute cross-track distance between passenger pickup/drop-off points and the driver&apos;s planned highway trajectory.
              </p>
              <div className="mt-4 pt-3 border-t border-commuter-100 text-xs text-mobility-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Verified spatial ordering
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-commuter-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-mobility-50 text-mobility-700 flex items-center justify-center font-bold text-base mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-commuter-900">
                Enforced Detour Limits
              </h3>
              <p className="mt-2 text-sm text-commuter-600 leading-relaxed">
                Drivers configure maximum tolerable detour in kilometers. Requests that divert the car beyond this tolerance are automatically eliminated.
              </p>
              <div className="mt-4 pt-3 border-t border-commuter-100 text-xs text-mobility-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                No 30-minute side detours
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-commuter-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-mobility-50 text-mobility-700 flex items-center justify-center font-bold text-base mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-commuter-900">
                Proportional Cost Sharing
              </h3>
              <p className="mt-2 text-sm text-commuter-600 leading-relaxed">
                Passengers pay strictly for the segment distance traveled. Higher vehicle occupancy triggers automatic shared discounts for everyone.
              </p>
              <div className="mt-4 pt-3 border-t border-commuter-100 text-xs text-mobility-700 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Transparent 5% platform fee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Proposition: Passenger vs Driver */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* For Passengers */}
            <div className="rounded-3xl border border-commuter-200 bg-commuter-50/70 p-8 sm:p-10">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                <Compass className="w-4 h-4" />
                <span>For Commuter Passengers</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-commuter-900">
                Ride in Comfort for 60% Less Than Taxis
              </h3>
              <ul className="mt-6 space-y-3.5 text-sm text-commuter-700">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>Reserve a guaranteed seat with verified professionals and colleagues.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>Fixed, predictable prices based strictly on distance traveled.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>Instant in-app trip updates and driver contact details.</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/rides">
                  <Button className="font-bold">
                    Find Available Rides
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Drivers */}
            <div className="rounded-3xl border border-mobility-200 bg-mobility-50/40 p-8 sm:p-10">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-800 mb-2">
                <Car className="w-4 h-4 text-mobility-600" />
                <span>For Commuter Drivers</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-commuter-900">
                Offset 100% of Your Fuel, Toll & EV Charging Costs
              </h3>
              <ul className="mt-6 space-y-3.5 text-sm text-commuter-700">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-mobility-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>You drive your scheduled commute anyway — monetize empty seats with zero friction.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-mobility-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>Full control: Review each passenger&apos;s detour distance before accepting.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-mobility-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <span>Fast carpool / HOV lane access by carrying 2+ riders.</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/driver/publish">
                  <Button variant="secondary" className="font-bold">
                    Publish Your Commute
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
