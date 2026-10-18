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
import { TAMIL_NADU_HUBS, Vehicle } from "@/features/types";
import { resolveTamilNaduCoordinates } from "@/features/locations/geocoder";
import { useRole } from "@/context/role-context";

export default function PublishRidePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { currentUser } = useRole();

  // Guided Steps: 1. Route -> 2. Schedule & Vehicle -> 3. Capacity & Pricing -> 4. Review
  const [currentStep, setCurrentStep] = React.useState<number>(1);

  // Form State
  const [originAddress, setOriginAddress] = React.useState("Salem New Bus Stand (Central Terminus)");
  const [originCity, setOriginCity] = React.useState("Salem");
  const [originLat, setOriginLat] = React.useState(11.6643);
  const [originLng, setOriginLng] = React.useState(78.1460);

  const [destAddress, setDestAddress] = React.useState("Coimbatore Gandhipuram Central Bus Stand");
  const [destCity, setDestCity] = React.useState("Coimbatore");
  const [destLat, setDestLat] = React.useState(11.0168);
  const [destLng, setDestLng] = React.useState(76.9558);

  const [waypoints, setWaypoints] = React.useState<
    Array<{ address: string; lat: number; lng: number }>
  >([
    {
      address: "Erode Central Bus Stand",
      lat: 11.3410,
      lng: 77.7172,
    },
    {
      address: "Tiruppur New Bus Stand (Avinashi Road)",
      lat: 11.1147,
      lng: 77.3411,
    },
  ]);

  const handleOriginAddressChange = async (val: string) => {
    setOriginAddress(val);
    const match = TAMIL_NADU_HUBS.find((h) => h.name.toLowerCase() === val.toLowerCase() || h.address.toLowerCase() === val.toLowerCase());
    if (match) {
      setOriginLat(match.latitude);
      setOriginLng(match.longitude);
      setOriginCity(match.city);
    } else if (val.length >= 3) {
      try {
        const resolved = await resolveTamilNaduCoordinates(val);
        if (resolved.isExact) {
          setOriginLat(resolved.latitude);
          setOriginLng(resolved.longitude);
          setOriginCity(resolved.city);
        }
      } catch {
        // Continue typing
      }
    }
  };

  const handleDestAddressChange = async (val: string) => {
    setDestAddress(val);
    const match = TAMIL_NADU_HUBS.find((h) => h.name.toLowerCase() === val.toLowerCase() || h.address.toLowerCase() === val.toLowerCase());
    if (match) {
      setDestLat(match.latitude);
      setDestLng(match.longitude);
      setDestCity(match.city);
    } else if (val.length >= 3) {
      try {
        const resolved = await resolveTamilNaduCoordinates(val);
        if (resolved.isExact) {
          setDestLat(resolved.latitude);
          setDestLng(resolved.longitude);
          setDestCity(resolved.city);
        }
      } catch {
        // Continue typing
      }
    }
  };

  const applyCorridorTemplate = (template: {
    origin: string;
    originCity: string;
    origLat: number;
    origLng: number;
    dest: string;
    destCity: string;
    destLat: number;
    destLng: number;
    wps: Array<{ address: string; lat: number; lng: number }>;
    notes: string;
    price: number;
  }) => {
    setOriginAddress(template.origin);
    setOriginCity(template.originCity);
    setOriginLat(template.origLat);
    setOriginLng(template.origLng);
    setDestAddress(template.dest);
    setDestCity(template.destCity);
    setDestLat(template.destLat);
    setDestLng(template.destLng);
    setWaypoints(template.wps);
    setNotes(template.notes);
    setBasePricePerKm(template.price);
  };

  const [departureDate, setDepartureDate] = React.useState("2026-10-17");
  const [departureTime, setDepartureTime] = React.useState("08:30");
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(SEED_VEHICLES);
  const [vehicleId, setVehicleId] = React.useState(SEED_VEHICLES[0].id);
  const [totalSeats, setTotalSeats] = React.useState(3);
  const [basePricePerKm, setBasePricePerKm] = React.useState(18); // ₹18/km
  const [maxDetourKm, setMaxDetourKm] = React.useState(4.0);
  const [notes, setNotes] = React.useState("Daily IT corridor carpool. AC on, smooth driving along OMR expressway.");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/vehicles?driverId=${encodeURIComponent(currentUser.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setVehicles(data.data);
            setVehicleId(data.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [currentUser?.id]);

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
        driverId: currentUser?.id || "u-karthik-sedan",
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-commuter-100 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-commuter-700 flex items-center">
                      <Navigation className="w-4 h-4 text-mobility-600 mr-2" />
                      1. Origin, Destination & Highway Stops (Tamil Nadu)
                    </h3>
                    <span className="text-xs font-semibold text-commuter-500">
                      Auto-geocodes all 38 TN Districts
                    </span>
                  </div>

                  {/* Quick TN Highway Corridor Templates */}
                  <div className="bg-commuter-50/70 p-3 rounded-xl border border-commuter-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-600 block mb-2">
                      ⚡ Quick Corridor Templates:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          applyCorridorTemplate({
                            origin: "Salem New Bus Stand (Central Terminus)",
                            originCity: "Salem",
                            origLat: 11.6643,
                            origLng: 78.1460,
                            dest: "Coimbatore Gandhipuram Central Bus Stand",
                            destCity: "Coimbatore",
                            destLat: 11.0168,
                            destLng: 76.9558,
                            wps: [
                              { address: "Erode Central Bus Stand", lat: 11.3410, lng: 77.7172 },
                              { address: "Tiruppur New Bus Stand (Avinashi Road)", lat: 11.1147, lng: 77.3411 },
                            ],
                            notes: "Kongu Expressway NH 544 morning express. Fast and reliable AC commute.",
                            price: 20,
                          })
                        }
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-commuter-200 hover:border-mobility-500 font-semibold text-commuter-700 shadow-xs"
                      >
                        Salem ➔ Coimbatore (NH 544)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyCorridorTemplate({
                            origin: "Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)",
                            originCity: "Chennai",
                            origLat: 12.8617,
                            origLng: 80.0784,
                            dest: "Madurai Mattuthavani MGR Integrated Bus Terminus",
                            destCity: "Madurai",
                            destLat: 9.9391,
                            destLng: 78.1565,
                            wps: [
                              { address: "Villupuram Central Bus Stand", lat: 11.9401, lng: 79.4861 },
                              { address: "Tiruchirappalli (Trichy) Central Bus Stand", lat: 10.7905, lng: 78.6946 },
                              { address: "Dindigul Central Bus Stand", lat: 10.3673, lng: 77.9803 },
                            ],
                            notes: "Grand Southern Trunk Road (NH 45) express. Samayapuram rest stop included.",
                            price: 18,
                          })
                        }
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-commuter-200 hover:border-mobility-500 font-semibold text-commuter-700 shadow-xs"
                      >
                        Chennai ➔ Madurai (GST Road)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyCorridorTemplate({
                            origin: "Coimbatore Gandhipuram Central Bus Stand",
                            originCity: "Coimbatore",
                            origLat: 11.0168,
                            origLng: 76.9558,
                            dest: "Udhagamandalam (Ooty) Central Bus Stand",
                            destCity: "Ooty",
                            destLat: 11.4102,
                            destLng: 76.6950,
                            wps: [{ address: "Coonoor Railway Station & Sims Park", lat: 11.3530, lng: 76.7959 }],
                            notes: "Scenic Western Ghats mountain ride up to Ooty in a rugged SUV.",
                            price: 24,
                          })
                        }
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-commuter-200 hover:border-mobility-500 font-semibold text-commuter-700 shadow-xs"
                      >
                        Coimbatore ➔ Ooty (Nilgiris)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyCorridorTemplate({
                            origin: "Madurai Mattuthavani MGR Integrated Bus Terminus",
                            originCity: "Madurai",
                            origLat: 9.9391,
                            origLng: 78.1565,
                            dest: "Kanyakumari Cape Comorin Beach & Memorial",
                            destCity: "Kanyakumari",
                            destLat: 8.0883,
                            destLng: 77.5385,
                            wps: [
                              { address: "Virudhunagar Central Bus Stand", lat: 9.5872, lng: 77.9514 },
                              { address: "Tirunelveli New Bus Stand (Vepperkulam)", lat: 8.7139, lng: 77.7567 },
                              { address: "Nagercoil Vadasery Christopher Bus Stand", lat: 8.1883, lng: 77.4332 },
                            ],
                            notes: "NH 44 Southern Highway line connecting Madurai, Nellai and Cape Comorin.",
                            price: 17,
                          })
                        }
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-commuter-200 hover:border-mobility-500 font-semibold text-commuter-700 shadow-xs"
                      >
                        Madurai ➔ Kanyakumari
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5">
                        Origin Address (Tamil Nadu)
                      </label>
                      <input
                        type="text"
                        list="publish-origin-hubs"
                        value={originAddress}
                        onChange={(e) => handleOriginAddressChange(e.target.value)}
                        placeholder="e.g. Salem New Bus Stand, Meyyanur"
                        className="w-full h-10 px-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
                        required
                      />
                      <datalist id="publish-origin-hubs">
                        {TAMIL_NADU_HUBS.map((h) => (
                          <option key={h.id} value={h.name}>
                            {h.city} — {h.address}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <Input
                        label="Origin City / District"
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        placeholder="e.g. Salem"
                        required
                      />
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-commuter-600">
                        Optional Highway Stops Along Corridor
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
                          list="publish-origin-hubs"
                          value={wp.address}
                          onChange={(e) => {
                            const newWps = [...waypoints];
                            newWps[index].address = e.target.value;
                            const match = TAMIL_NADU_HUBS.find((h) => h.name.toLowerCase() === e.target.value.toLowerCase());
                            if (match) {
                              newWps[index].lat = match.latitude;
                              newWps[index].lng = match.longitude;
                            }
                            setWaypoints(newWps);
                          }}
                          placeholder="Intermediate stop in Tamil Nadu"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5">
                        Destination Address (Tamil Nadu)
                      </label>
                      <input
                        type="text"
                        list="publish-dest-hubs"
                        value={destAddress}
                        onChange={(e) => handleDestAddressChange(e.target.value)}
                        placeholder="e.g. Coimbatore Gandhipuram Central"
                        className="w-full h-10 px-3 rounded-lg border border-commuter-200 text-xs font-semibold text-commuter-900 focus:border-mobility-600 focus:ring-1 focus:ring-mobility-600"
                        required
                      />
                      <datalist id="publish-dest-hubs">
                        {TAMIL_NADU_HUBS.map((h) => (
                          <option key={h.id} value={h.name}>
                            {h.city} — {h.address}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <Input
                        label="Destination City / District"
                        value={destCity}
                        onChange={(e) => setDestCity(e.target.value)}
                        placeholder="e.g. Coimbatore"
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
                      {vehicles.map((v) => (
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
