"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InteractiveMap } from "@/components/map/interactive-map";
import { useToast } from "@/components/ui/toast";
import { SEED_VEHICLES } from "@/lib/fixtures/rides";
import { calculateHaversineDistance } from "@/features/matching/engine";
import { formatCurrency, formatDistance, formatDuration } from "@/lib/utils";
import { RoleGuard } from "@/components/auth/role-guard";

export default function PublishRidePage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Guided Steps: 1. Route -> 2. Schedule & Vehicle -> 3. Capacity & Pricing -> 4. Review
  const [currentStep, setCurrentStep] = React.useState<number>(1);

  // Form State
  const [originAddress, setOriginAddress] = React.useState("Guindy Kathipara Junction & Metro");
  const [originCity, setOriginCity] = React.useState("Chennai");
  const [originLat, setOriginLat] = React.useState(13.0067);
  const [originLng, setOriginLng] = React.useState(80.2038);

  const [destAddress, setDestAddress] = React.useState("OMR Siruseri SIPCOT IT Park (Navalur)");
  const [destCity, setDestCity] = React.useState("Chennai");
  const [destLat, setDestLat] = React.useState(12.8465);
  const [destLng, setDestLng] = React.useState(80.2263);

  const [waypoints, setWaypoints] = React.useState<
    Array<{ address: string; lat: number; lng: number }>
  >([
    {
      address: "OMR Sholinganallur ELCOT Junction",
      lat: 12.9010,
      lng: 80.2279,
    },
  ]);

  const [departureDate, setDepartureDate] = React.useState("2026-10-17");
  const [departureTime, setDepartureTime] = React.useState("08:30");
  const [vehicleId, setVehicleId] = React.useState(SEED_VEHICLES[0].id);
  const [totalSeats, setTotalSeats] = React.useState(3);
  const [basePricePerKm, setBasePricePerKm] = React.useState(18); // ₹18/km
  const [maxDetourKm, setMaxDetourKm] = React.useState(4.0);
  const [notes, setNotes] = React.useState("Daily IT corridor carpool. AC on, smooth driving along OMR expressway.");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Add waypoint helper
  const addWaypoint = () => {
    setWaypoints([
      ...waypoints,
      {
        address: "Tidel Park & Thiruvanmiyur MRTS",
        lat: 12.9892,
        lng: 80.2464,
      },
    ]);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  // Calculated route distance & duration
  const estimatedDistance = React.useMemo(() => {
    let dist = calculateHaversineDistance(
      { latitude: originLat, longitude: originLng },
      waypoints.length > 0
        ? { latitude: waypoints[0].lat, longitude: waypoints[0].lng }
        : { latitude: destLat, longitude: destLng }
    );

    for (let i = 0; i < waypoints.length - 1; i++) {
      dist += calculateHaversineDistance(
        { latitude: waypoints[i].lat, longitude: waypoints[i].lng },
        { latitude: waypoints[i + 1].lat, longitude: waypoints[i + 1].lng }
      );
    }

    if (waypoints.length > 0) {
      dist += calculateHaversineDistance(
        { latitude: waypoints[waypoints.length - 1].lat, longitude: waypoints[waypoints.length - 1].lng },
        { latitude: destLat, longitude: destLng }
      );
    }

    return Math.round(dist * 1.2 * 10) / 10; // 20% road routing factor
  }, [originLat, originLng, destLat, destLng, waypoints]);

  const estimatedDuration = Math.round((estimatedDistance / 65) * 60); // 65 km/h avg highway commute

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const departureDateTime = new Date(`${departureDate}T${departureTime}:00Z`).toISOString();

      const payload = {
        vehicleId,
        origin: {
          address: originAddress,
          city: originCity,
          latitude: originLat,
          longitude: originLng,
        },
        destination: {
          address: destAddress,
          city: destCity,
          latitude: destLat,
          longitude: destLng,
        },
        waypoints: waypoints.map((w, index) => ({
          id: `wp-${index}`,
          address: w.address,
          latitude: w.lat,
          longitude: w.lng,
          orderIndex: index,
          stopType: "stopover",
        })),
        departureTime: departureDateTime,
        totalSeats,
        basePricePerKm,
        totalDistanceKm: estimatedDistance,
        estimatedDurationMinutes: estimatedDuration,
        maxDetourKm,
        notes,
      };

      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast({
          type: "success",
          title: "Journey Published!",
          message: "Your commute is now live and discoverable by compatible passengers.",
        });
        router.push("/driver");
      } else {
        showToast({
          type: "error",
          title: "Publish Failed",
          message: data.error?.message || "Failed to create ride",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to publish ride. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard requiredRole="driver" portalName="Corridor Publisher">
      <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-medium text-commuter-500">
          <Link
            href="/driver"
            className="inline-flex items-center space-x-1 hover:text-commuter-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Driver Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-commuter-800 font-semibold">Publish New Commute</span>
        </div>

        {/* Wizard Header */}
        <div className="pb-4 border-b border-commuter-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-commuter-900">
            Publish Scheduled Journey
          </h1>
          <p className="text-xs sm:text-sm text-commuter-500 mt-1">
            Specify your origin, destination, intermediate stops, and seat prices.
          </p>

          {/* Stepper Indicator */}
          <div className="mt-6 flex items-center justify-between max-w-md">
            {[
              { num: 1, label: "Route Setup" },
              { num: 2, label: "Schedule & Car" },
              { num: 3, label: "Pricing & Seats" },
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    currentStep === s.num
                      ? "bg-mobility-600 text-white"
                      : currentStep > s.num
                      ? "bg-emerald-600 text-white"
                      : "bg-commuter-200 text-commuter-600"
                  }`}
                >
                  {currentStep > s.num ? "✓" : s.num}
                </button>
                <span className="text-xs font-semibold text-commuter-700 hidden sm:inline">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: ROUTE SETUP */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-commuter-700 flex items-center">
                    <Navigation className="w-4 h-4 text-mobility-600 mr-2" />
                    1. Origin, Destination & Highway Stops
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Origin Address"
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        placeholder="e.g. Market St & 4th St"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Origin City"
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        placeholder="e.g. San Francisco"
                        required
                      />
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-commuter-600">
                        Optional Stops Along Route
                      </span>
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={addWaypoint}
                        className="text-xs font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Highway Stop
                      </Button>
                    </div>

                    {waypoints.map((wp, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-commuter-400 w-5">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={wp.address}
                          onChange={(e) => {
                            const newWps = [...waypoints];
                            newWps[index].address = e.target.value;
                            setWaypoints(newWps);
                          }}
                          className="flex-1 h-10 px-3 rounded-lg border border-commuter-200 text-xs font-medium text-commuter-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeWaypoint(index)}
                          className="p-2 text-commuter-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Input
                        label="Destination Address"
                        value={destAddress}
                        onChange={(e) => setDestAddress(e.target.value)}
                        placeholder="e.g. San Pedro Square"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Destination City"
                        value={destCity}
                        onChange={(e) => setDestCity(e.target.value)}
                        placeholder="e.g. San Jose"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Route Preview Map */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold uppercase tracking-wider text-commuter-500">
                      Live Route Trajectory Preview
                    </span>
                    <span className="font-semibold text-mobility-700">
                      ~{formatDistance(estimatedDistance)} · ~{formatDuration(estimatedDuration)}
                    </span>
                  </div>
                  <div className="h-64 rounded-xl overflow-hidden border border-commuter-200">
                    <InteractiveMap
                      origin={{
                        address: originAddress,
                        city: originCity,
                        latitude: originLat,
                        longitude: originLng,
                      }}
                      destination={{
                        address: destAddress,
                        city: destCity,
                        latitude: destLat,
                        longitude: destLng,
                      }}
                      waypoints={waypoints.map((w, idx) => ({
                        id: `preview-${idx}`,
                        rideId: "preview",
                        address: w.address,
                        latitude: w.lat,
                        longitude: w.lng,
                        orderIndex: idx,
                        stopType: "stopover",
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setCurrentStep(2)} className="font-bold">
                  Continue to Schedule ➔
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE & VEHICLE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-commuter-700 flex items-center">
                    <Calendar className="w-4 h-4 text-mobility-600 mr-2" />
                    2. Departure Schedule & Registered Vehicle
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="date"
                        label="Travel Date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="time"
                        label="Departure Time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-commuter-700 mb-1.5">
                      Select Vehicle
                    </label>
                    <select
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-commuter-200 text-sm font-medium text-commuter-900 bg-white"
                    >
                      {SEED_VEHICLES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.year}) · {v.color} · Plate: {v.licensePlate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-commuter-700 mb-1.5">
                      Driver Commute Preferences & Guidelines
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-lg border border-commuter-200 text-xs font-medium text-commuter-900 focus:outline-none focus:border-mobility-600"
                      placeholder="e.g. Non-smoking, luggage limits, quiet commute vs friendly conversation."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setCurrentStep(3)} className="font-bold">
                  Continue to Pricing ➔
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CAPACITY & PRICING */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50">
              <Card>
                <CardContent className="p-6 space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-commuter-700 flex items-center">
                    <DollarSign className="w-4 h-4 text-mobility-600 mr-2" />
                    3. Seat Capacity, Cost-Sharing Rate & Detour Limit
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-commuter-700 mb-1.5">
                        Available Seats
                      </label>
                      <select
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(Number(e.target.value))}
                        className="w-full h-11 px-3.5 rounded-lg border border-commuter-200 text-sm font-bold text-commuter-900 bg-white"
                      >
                        <option value="1">1 Seat</option>
                        <option value="2">2 Seats</option>
                        <option value="3">3 Seats</option>
                        <option value="4">4 Seats</option>
                        <option value="5">5 Seats</option>
                      </select>
                    </div>

                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.05"
                        max="0.50"
                        label="Rate per km (USD)"
                        value={basePricePerKm}
                        onChange={(e) => setBasePricePerKm(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div>
                      <Input
                        type="number"
                        step="1"
                        min="2"
                        max="25"
                        label="Max Detour Tolerance (km)"
                        value={maxDetourKm}
                        onChange={(e) => setMaxDetourKm(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-xl bg-mobility-50/60 border border-mobility-200 text-xs space-y-2">
                    <p className="font-bold text-mobility-900">
                      Calculated Trip Economics:
                    </p>
                    <div className="flex justify-between text-mobility-800">
                      <span>Full Distance:</span>
                      <span className="font-bold">{formatDistance(estimatedDistance)}</span>
                    </div>
                    <div className="flex justify-between text-mobility-800">
                      <span>Estimated Passenger Fare per Seat:</span>
                      <span className="font-bold text-sm">
                        {formatCurrency(estimatedDistance * basePricePerKm)}
                      </span>
                    </div>
                    <div className="flex justify-between text-mobility-800">
                      <span>Maximum Fuel/Expense Driver Recovery:</span>
                      <span className="font-bold text-sm text-emerald-800">
                        {formatCurrency(estimatedDistance * basePricePerKm * totalSeats)} (at 100% occupancy)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button type="submit" size="lg" isLoading={isSubmitting} className="font-bold shadow-md">
                  Confirm & Publish Journey
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
    </RoleGuard>
  );
}
