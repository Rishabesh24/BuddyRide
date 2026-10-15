"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Filter,
  SlidersHorizontal,
  Clock,
  ArrowUpDown,
  Car,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InteractiveMap } from "@/components/map/interactive-map";
import { MatchResult } from "@/features/types";
import { formatCurrency, formatDistance, formatDuration, formatTime } from "@/lib/utils";

function SearchResultsContent() {
  const searchParams = useSearchParams();

  // Search form values from query string
  const [originInput, setOriginInput] = React.useState(
    searchParams.get("origin") || "San Francisco"
  );
  const [destInput, setDestInput] = React.useState(
    searchParams.get("destination") || "San Jose"
  );
  const [dateInput, setDateInput] = React.useState(
    searchParams.get("date") || "2026-10-16"
  );
  const [seatsInput, setSeatsInput] = React.useState(
    searchParams.get("seats") || "1"
  );

  // Results & Loading State
  const [results, setResults] = React.useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRideId, setSelectedRideId] = React.useState<string | null>(null);

  // Filters State
  const [maxPrice, setMaxPrice] = React.useState<number>(50);
  const [timeOfDay, setTimeOfDay] = React.useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [sortBy, setSortBy] = React.useState<"compatibility" | "price_asc" | "departure_time" | "detour_asc">("compatibility");
  const [mobileView, setMobileView] = React.useState<"list" | "map">("list");

  // Fetch search results
  const fetchSearchResults = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Default to SF -> SJ coordinates for demo queries if text matching
      let origLat = 37.7749;
      let origLng = -122.4194;
      let destLat = 37.3382;
      let destLng = -121.8863;

      if (originInput.toLowerCase().includes("seattle")) {
        origLat = 47.6114;
        origLng = -122.3370;
        destLat = 47.6144;
        destLng = -122.2014;
      }

      const params = new URLSearchParams({
        originLat: origLat.toString(),
        originLng: origLng.toString(),
        destLat: destLat.toString(),
        destLng: destLng.toString(),
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
  }, [results, maxPrice, timeOfDay, sortBy]);

  // Selected ride for interactive map
  const activeSelectedMatch = results.find((m) => m.rideId === selectedRideId) ?? results[0];

  return (
    <div className="flex-1 flex flex-col bg-commuter-50">
      {/* Top Search & Filter Bar */}
      <section className="bg-white border-b border-commuter-200 py-4 px-4 sm:px-6 lg:px-8 shadow-sm sticky top-16 z-30">
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
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="From: City or station"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
              />
            </div>

            {/* Destination */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mobility-600">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                placeholder="To: City or campus"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
              />
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
              <Button type="submit" size="sm" className="w-full h-10 font-bold" isLoading={isLoading}>
                Update Search
              </Button>
            </div>
          </form>

          {/* Faceted Filter Toolbar */}
          <div className="mt-3 pt-3 border-t border-commuter-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-commuter-500 uppercase tracking-wider text-[11px] flex items-center">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                Filters:
              </span>

              {/* Time of Day */}
              <div className="flex rounded-md border border-commuter-200 overflow-hidden bg-white">
                {(["all", "morning", "afternoon", "evening"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeOfDay(t)}
                    className={`px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                      timeOfDay === t
                        ? "bg-mobility-600 text-white"
                        : "text-commuter-600 hover:bg-commuter-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Price Cap */}
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-commuter-200">
                <span className="text-commuter-500 font-medium">Max:</span>
                <span className="font-bold text-commuter-900">${maxPrice}</span>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-16 accent-mobility-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
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
                <option value="compatibility">Highest Compatibility</option>
                <option value="price_asc">Lowest Fare</option>
                <option value="detour_asc">Shortest Detour</option>
                <option value="departure_time">Earliest Departure</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Segmented Toggle (List vs Map) */}
      <div className="lg:hidden p-3 bg-commuter-100 border-b border-commuter-200 flex justify-center">
        <div className="inline-flex rounded-lg border border-commuter-300 bg-white p-1">
          <button
            onClick={() => setMobileView("list")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
              mobileView === "list"
                ? "bg-mobility-600 text-white"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            Journey Cards ({filteredResults.length})
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
              mobileView === "map"
                ? "bg-mobility-600 text-white"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            Route Map
          </button>
        </div>
      </div>

      {/* Main Content Area: Split View on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
          {/* Left Column: Results List (7 cols on large desktop) */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              mobileView === "map" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-commuter-500">
                {filteredResults.length} Compatible {filteredResults.length === 1 ? "Journey" : "Journeys"} Found
              </p>
              <span className="text-xs text-commuter-400">
                Real-time geometric waypoint scoring
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4 py-8">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-44 rounded-xl bg-white border border-commuter-200 p-6 animate-pulse space-y-3"
                  >
                    <div className="h-4 bg-commuter-100 rounded w-1/3" />
                    <div className="h-4 bg-commuter-100 rounded w-3/4" />
                    <div className="h-4 bg-commuter-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-commuter-300 bg-white p-12 text-center">
                <AlertCircle className="w-10 h-10 text-commuter-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-commuter-900">
                  No compatible rides found
                </h3>
                <p className="text-xs text-commuter-500 max-w-sm mx-auto mt-1">
                  Try widening your travel date or adjusting the maximum price filter. You can also publish your own journey!
                </p>
                <div className="mt-5">
                  <Link href="/driver/publish">
                    <Button variant="outline" size="sm">
                      Publish a Ride on this Route
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              filteredResults.map((match) => {
                const isSelected = selectedRideId === match.rideId;
                const { ride } = match;

                return (
                  <Card
                    key={match.rideId}
                    onClick={() => setSelectedRideId(match.rideId)}
                    className={`cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "border-mobility-600 ring-2 ring-mobility-600/20 shadow-md bg-mobility-50/10"
                        : "hover:border-commuter-300"
                    }`}
                  >
                    <CardContent className="p-5">
                      {/* Card Top Row: Departure Time, Score, Price */}
                      <div className="flex items-start justify-between pb-3 border-b border-commuter-100">
                        <div className="flex items-center space-x-3">
                          <div className="text-left">
                            <span className="text-lg font-extrabold text-commuter-900">
                              {formatTime(ride.departureTime)}
                            </span>
                            <span className="block text-[11px] text-commuter-500 font-medium">
                              {formatDuration(ride.estimatedDurationMinutes)} commute
                            </span>
                          </div>

                          <Badge variant="mobility">
                            {match.compatibilityScore}% Compatibility
                          </Badge>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-extrabold text-commuter-900">
                            {formatCurrency(match.totalCharge)}
                          </span>
                          <span className="block text-[10px] text-commuter-400 font-medium">
                            total fare / seat
                          </span>
                        </div>
                      </div>

                      {/* Corridor Summary */}
                      <div className="mt-3.5 space-y-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="font-bold text-commuter-900">
                            {ride.origin.city}
                          </span>
                          <span className="text-commuter-400">➔</span>
                          <span className="font-bold text-commuter-900">
                            {ride.destination.city}
                          </span>
                          <span className="text-commuter-400">·</span>
                          <span className="text-commuter-500 text-[11px]">
                            {ride.origin.address}
                          </span>
                        </div>

                        {/* Waypoints badge info */}
                        {ride.waypoints.length > 0 && (
                          <div className="text-[11px] text-commuter-500 pl-4">
                            Stops along route:{" "}
                            {ride.waypoints.map((w) => w.address.split(",")[0]).join(" · ")}
                          </div>
                        )}
                      </div>

                      {/* Algorithmic Detour Explanation */}
                      <div className="mt-3 p-2.5 rounded-lg bg-commuter-50 border border-commuter-200 text-xs flex items-start space-x-2">
                        <Info className="w-3.5 h-3.5 text-mobility-600 flex-shrink-0 mt-0.5" />
                        <p className="text-commuter-700 text-[11px] leading-relaxed">
                          {match.explanation}
                        </p>
                      </div>

                      {/* Driver, Seats, & Action CTA */}
                      <div className="mt-4 pt-3 border-t border-commuter-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={ride.driver?.avatarUrl}
                            alt={ride.driver?.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-commuter-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-commuter-900">
                              {ride.driver?.fullName}
                            </p>
                            <p className="text-[10px] text-commuter-500">
                              {ride.vehicle?.make} {ride.vehicle?.model} · ★ {ride.driver?.ratingAverage.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            {ride.availableSeats} seats left
                          </span>

                          <Link href={`/rides/${ride.id}`}>
                            <Button size="sm" className="font-bold">
                              Book Seat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right Column: Sticky Leaflet Map (5 cols on large desktop) */}
          <div
            className={`lg:col-span-5 sticky top-48 h-[600px] ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="h-full rounded-2xl overflow-hidden border border-commuter-200 shadow-md bg-white flex flex-col">
              <div className="px-4 py-2.5 bg-commuter-900 text-white flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Interactive Route Polyline</span>
                </span>
                {activeSelectedMatch && (
                  <span className="text-commuter-300">
                    {activeSelectedMatch.ride.origin.city} ➔ {activeSelectedMatch.ride.destination.city}
                  </span>
                )}
              </div>

              <div className="flex-1 w-full relative">
                <InteractiveMap
                  origin={activeSelectedMatch?.ride.origin}
                  destination={activeSelectedMatch?.ride.destination}
                  waypoints={activeSelectedMatch?.ride.waypoints}
                />
              </div>

              {activeSelectedMatch && (
                <div className="p-3 bg-white border-t border-commuter-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-commuter-500 block text-[10px] uppercase font-bold">
                      Route Distance
                    </span>
                    <span className="font-bold text-commuter-900">
                      {formatDistance(activeSelectedMatch.ride.totalDistanceKm)}
                    </span>
                  </div>
                  <div>
                    <span className="text-commuter-500 block text-[10px] uppercase font-bold">
                      Estimated Detour
                    </span>
                    <span className="font-bold text-emerald-700">
                      +{formatDistance(activeSelectedMatch.totalDetourKm)} ({activeSelectedMatch.detourTimeMinutes} min)
                    </span>
                  </div>
                  <div>
                    <span className="text-commuter-500 block text-[10px] uppercase font-bold">
                      Detour Limit
                    </span>
                    <span className="font-bold text-commuter-700">
                      ≤ {activeSelectedMatch.ride.maxDetourKm} km
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24 bg-commuter-50">
          <Loader2 className="w-8 h-8 animate-spin text-mobility-600" />
        </div>
      }
    >
      <SearchResultsContent />
    </React.Suspense>
  );
}
