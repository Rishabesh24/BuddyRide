"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  Clock,
  ArrowUpDown,
  Car,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InteractiveMap } from "@/components/map/interactive-map";
import { MatchResult, TAMIL_NADU_HUBS, VEHICLE_TIERS, VehicleType } from "@/features/types";
import { formatCurrency, formatDistance, formatDuration, formatTime } from "@/lib/utils";

function SearchResultsContent() {
  const searchParams = useSearchParams();

  // Search form values from query string
  const [originInput, setOriginInput] = React.useState(
    searchParams.get("origin") || "Chennai International Airport (MAA)"
  );
  const [destInput, setDestInput] = React.useState(
    searchParams.get("destination") || "OMR Siruseri SIPCOT IT Park (Navalur)"
  );
  const [dateInput, setDateInput] = React.useState(
    searchParams.get("date") || "2026-10-17"
  );
  const [seatsInput, setSeatsInput] = React.useState(
    searchParams.get("seats") || "1"
  );
  const [vehicleFilter, setVehicleFilter] = React.useState<VehicleType | "all">(
    (searchParams.get("vehicle") as VehicleType) || "all"
  );

  // Results & Loading State
  const [results, setResults] = React.useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRideId, setSelectedRideId] = React.useState<string | null>(null);

  // Filters State
  const [maxPrice, setMaxPrice] = React.useState<number>(3500);
  const [timeOfDay, setTimeOfDay] = React.useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [sortBy, setSortBy] = React.useState<"compatibility" | "price_asc" | "departure_time" | "detour_asc">("compatibility");
  const [mobileView, setMobileView] = React.useState<"list" | "map">("list");

  // Fetch search results
  const fetchSearchResults = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        origin: originInput,
        destination: destInput,
        date: dateInput,
        seats: seatsInput,
      });

      const res = await fetch(`/api/rides/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data?.results) {
        setResults(data.data.results);
        if (data.data.results.length > 0) {
          setSelectedRideId(data.data.results[0].rideId);
        }
      }
    } catch {
      // Silent error handler
    } finally {
      setIsLoading(false);
    }
  }, [originInput, destInput, dateInput, seatsInput]);

  React.useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Client-side filtering & sorting
  const filteredResults = React.useMemo(() => {
    return results
      .filter((m) => {
        // Vehicle type filter
        if (vehicleFilter !== "all" && m.ride.vehicleType !== vehicleFilter) {
          return false;
        }

        // Price filter
        if (m.totalCharge > maxPrice) return false;

        // Time of day filter
        if (timeOfDay !== "all") {
          const departureHour = new Date(m.ride.departureTime).getHours();
          if (timeOfDay === "morning" && (departureHour < 6 || departureHour >= 12)) return false;
          if (timeOfDay === "afternoon" && (departureHour < 12 || departureHour >= 17)) return false;
          if (timeOfDay === "evening" && (departureHour < 17 || departureHour >= 23)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "compatibility") return b.compatibilityScore - a.compatibilityScore;
        if (sortBy === "price_asc") return a.totalCharge - b.totalCharge;
        if (sortBy === "detour_asc") return a.totalDetourKm - b.totalDetourKm;
        if (sortBy === "departure_time") {
          return new Date(a.ride.departureTime).getTime() - new Date(b.ride.departureTime).getTime();
        }
        return 0;
      });
  }, [results, vehicleFilter, maxPrice, timeOfDay, sortBy]);

  // Selected ride for interactive map
  const activeSelectedMatch = results.find((m) => m.rideId === selectedRideId) ?? results[0];

  return (
    <div className="flex-1 flex flex-col bg-commuter-50">
      {/* Top Search & Filter Bar */}
      <section className="bg-white border-b border-commuter-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSearchResults();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center"
          >
            {/* Origin */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                list="rides-origin-hubs"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="From: Station or area"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
              />
              <datalist id="rides-origin-hubs">
                {TAMIL_NADU_HUBS.map((h) => (
                  <option key={h.id} value={h.name} />
                ))}
              </datalist>
            </div>

            {/* Destination */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mobility-600">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                list="rides-dest-hubs"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                placeholder="To: Destination or IT Park"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
              />
              <datalist id="rides-dest-hubs">
                {TAMIL_NADU_HUBS.map((h) => (
                  <option key={h.id} value={h.name} />
                ))}
              </datalist>
            </div>

            {/* Date */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-commuter-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
              />
            </div>

            {/* Seats */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-commuter-400">
                <Users className="w-4 h-4" />
              </span>
              <select
                value={seatsInput}
                onChange={(e) => setSeatsInput(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600 bg-white"
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div>
              <Button type="submit" size="sm" className="w-full h-10 font-bold bg-commuter-900 hover:bg-black text-white" isLoading={isLoading}>
                Update Search
              </Button>
            </div>
          </form>

          {/* Vehicle Category Filter Tabs (Ola / Uber style) */}
          <div className="mt-3 pt-3 border-t border-commuter-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setVehicleFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                vehicleFilter === "all"
                  ? "bg-commuter-900 text-white"
                  : "bg-commuter-100 text-commuter-700 hover:bg-commuter-200"
              }`}
            >
              All Types ({results.length})
            </button>

            {VEHICLE_TIERS.map((tier) => {
              const count = results.filter((r) => r.ride.vehicleType === tier.type).length;
              return (
                <button
                  key={tier.type}
                  onClick={() => setVehicleFilter(tier.type)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    vehicleFilter === tier.type
                      ? "bg-mobility-700 text-white shadow-xs"
                      : "bg-white border border-commuter-200 text-commuter-700 hover:bg-commuter-50"
                  }`}
                >
                  <span>{tier.emoji}</span>
                  <span>{tier.name}</span>
                  {count > 0 && (
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Secondary Sorting Toolbar */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-commuter-500">Max Fare:</span>
              <span className="font-bold text-commuter-900">₹{maxPrice}</span>
              <input
                type="range"
                min="50"
                max="3500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-mobility-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-medium text-commuter-500 flex items-center">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-commuter-200 rounded-md px-2 py-1 font-semibold text-commuter-800 text-xs focus:outline-none focus:border-mobility-600"
              >
                <option value="compatibility">Best Match & Proximity</option>
                <option value="price_asc">Lowest Fare (₹)</option>
                <option value="detour_asc">Shortest Detour</option>
                <option value="departure_time">Earliest Departure</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split-View: Ride Cards List (Left) + Interactive Map (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Ride Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-commuter-900 flex items-center space-x-2">
                <span>Available Rides</span>
                <span className="text-xs bg-mobility-100 text-mobility-800 px-2 py-0.5 rounded-full font-bold">
                  {filteredResults.length} options
                </span>
              </h2>
              <span className="text-xs text-commuter-500">
                Showing authentic Tamil Nadu routes
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-commuter-200">
                <Loader2 className="w-8 h-8 animate-spin text-mobility-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-commuter-800">
                  Scanning Tamil Nadu corridors...
                </p>
                <p className="text-xs text-commuter-500 mt-1">
                  Matching your route against active Auto, Bike, and Cab drivers.
                </p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-commuter-200">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-commuter-900">
                  No direct vehicles found for this specific filter
                </h3>
                <p className="text-xs text-commuter-500 mt-1 max-w-sm mx-auto">
                  Try switching the vehicle type to &quot;All Types&quot; or selecting one of our high-frequency corridors.
                </p>
                <button
                  onClick={() => {
                    setVehicleFilter("all");
                    setMaxPrice(1000);
                  }}
                  className="mt-4 px-4 py-2 bg-commuter-900 text-white rounded-xl text-xs font-bold hover:bg-black"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredResults.map((match) => {
                const isSelected = match.rideId === selectedRideId;
                const ride = match.ride;
                const tier = VEHICLE_TIERS.find((t) => t.type === ride.vehicleType) ?? VEHICLE_TIERS[3];

                return (
                  <div
                    key={match.rideId}
                    onClick={() => setSelectedRideId(match.rideId)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? "border-mobility-600 shadow-md ring-2 ring-mobility-600/20"
                        : "border-commuter-200 hover:border-mobility-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Driver & Vehicle */}
                      <div className="flex items-start space-x-3.5">
                        <div className="relative">
                          <img
                            src={ride.driver?.avatarUrl}
                            alt={ride.driver?.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full p-0.5 shadow-xs">
                            {tier.emoji}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-commuter-900">
                              {ride.driver?.fullName}
                            </span>
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 mr-0.5" />
                              KYC Verified
                            </span>
                          </div>
                          <p className="text-xs text-commuter-500 mt-0.5">
                            <span className="font-bold text-amber-500">★ {ride.driver?.ratingAverage.toFixed(2)}</span>
                            {" · "}
                            <span>{ride.vehicle?.make} {ride.vehicle?.model}</span>
                            {" · "}
                            <span className="font-mono text-commuter-700 font-semibold">{ride.vehicle?.licensePlate}</span>
                          </p>
                        </div>
                      </div>

                      {/* Fare in INR */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-commuter-400 block">
                          Total Fare
                        </span>
                        <span className="text-xl font-black text-commuter-900">
                          {formatCurrency(match.totalCharge)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          ⚡ Zero Surge
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="mt-4 pt-3 border-t border-commuter-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-start space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                          <span className="text-commuter-700 font-medium line-clamp-1">
                            {ride.origin.address}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="w-2 h-2 rounded-full bg-mobility-600 mt-1 flex-shrink-0" />
                          <span className="text-commuter-700 font-medium line-clamp-1">
                            {ride.destination.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center sm:items-end space-y-1">
                        <div className="flex items-center space-x-2 text-commuter-600">
                          <Clock className="w-3.5 h-3.5 text-commuter-400" />
                          <span>Leaves {formatTime(ride.departureTime)}</span>
                          <span className="font-bold text-commuter-900">
                            (~{ride.estimatedDurationMinutes}m)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="success" className="text-[11px] font-bold">
                            {ride.availableSeats} seats available
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-commuter-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs text-commuter-500">
                        <Info className="w-3.5 h-3.5 text-mobility-600" />
                        <span>Instant 4-digit start PIN provided upon booking</span>
                      </div>
                      <Link href={`/rides/${ride.id}`}>
                        <Button size="sm" className="font-bold bg-commuter-900 hover:bg-black text-white px-4">
                          Select {tier.name.split(" ")[0]}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Live Route Map */}
          <div className="lg:col-span-5 sticky top-36">
            <div className="bg-white rounded-2xl border border-commuter-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-commuter-900 text-white flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Tamil Nadu Corridor Map</span>
                </span>
                {activeSelectedMatch && (
                  <span className="text-commuter-300">
                    {activeSelectedMatch.ride.origin.city} ➔ {activeSelectedMatch.ride.destination.city}
                  </span>
                )}
              </div>
              <div className="h-[460px] w-full">
                {activeSelectedMatch ? (
                  <InteractiveMap
                    origin={activeSelectedMatch.ride.origin}
                    destination={activeSelectedMatch.ride.destination}
                    waypoints={activeSelectedMatch.ride.waypoints}
                    className="h-full w-full"
                  />
                ) : (
                  <InteractiveMap className="h-full w-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm">Loading search...</div>}>
      <SearchResultsContent />
    </React.Suspense>
  );
}
