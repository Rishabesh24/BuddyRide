"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAMIL_NADU_HUBS, VEHICLE_TIERS, VehicleType } from "@/features/types";

export function CommuterSearchBar() {
  const router = useRouter();

  const [origin, setOrigin] = React.useState("Chennai Airport (MAA)");
  const [destination, setDestination] = React.useState("OMR Siruseri SIPCOT IT Park");
  const [date, setDate] = React.useState("2026-10-17");
  const [time, setTime] = React.useState("09:00");
  const [selectedVehicle, setSelectedVehicle] = React.useState<VehicleType | "all">("all");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/rides?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
        destination
      )}&date=${date}&time=${time}&vehicle=${selectedVehicle}`
    );
  };

  const setCorridor = (orig: string, dest: string, vehicle: VehicleType | "all" = "all") => {
    setOrigin(orig);
    setDestination(dest);
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="mt-8 max-w-5xl mx-auto w-full">
      {/* Vehicle Tier Selector Bar (Ola/Uber style) */}
      <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedVehicle("all")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedVehicle === "all"
              ? "bg-commuter-900 text-white shadow-md scale-105"
              : "bg-white text-commuter-700 hover:bg-commuter-100 border border-commuter-200"
          }`}
        >
          <span>All Mobility</span>
        </button>

        {VEHICLE_TIERS.map((tier) => (
          <button
            key={tier.type}
            type="button"
            onClick={() => setSelectedVehicle(tier.type)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedVehicle === tier.type
                ? "bg-mobility-700 text-white shadow-md scale-105"
                : "bg-white text-commuter-700 hover:bg-commuter-100 border border-commuter-200"
            }`}
          >
            <span className="text-sm">{tier.emoji}</span>
            <span>{tier.name}</span>
            <span className="opacity-75 text-[10px]">from ₹{tier.baseFare}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-commuter-200 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end"
      >
        {/* Origin with Tamil Nadu Suggestions */}
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            Pickup Location (Tamil Nadu)
          </label>
          <input
            type="text"
            list="origin-hubs"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Chennai Airport, Central, T. Nagar"
            className="w-full h-12 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 placeholder:text-commuter-400 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
            required
          />
          <datalist id="origin-hubs">
            {TAMIL_NADU_HUBS.map((hub) => (
              <option key={hub.id} value={hub.name}>
                {hub.city} — {hub.address}
              </option>
            ))}
          </datalist>
        </div>

        {/* Destination with Tamil Nadu Suggestions */}
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 text-rose-600 mr-1.5" />
            Dropoff Destination
          </label>
          <input
            type="text"
            list="dest-hubs"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. OMR Siruseri IT Park, Pondicherry"
            className="w-full h-12 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 placeholder:text-commuter-400 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
            required
          />
          <datalist id="dest-hubs">
            {TAMIL_NADU_HUBS.map((hub) => (
              <option key={hub.id} value={hub.name}>
                {hub.city} — {hub.address}
              </option>
            ))}
          </datalist>
        </div>

        {/* Date & Time */}
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
              <Calendar className="w-3 h-3 text-commuter-500 mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-2 rounded-xl border border-commuter-200 text-xs font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
              <Clock className="w-3 h-3 text-commuter-500 mr-1" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-12 px-2 rounded-xl border border-commuter-200 text-xs font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600"
              required
            />
          </div>
        </div>

        {/* Submit CTA */}
        <div className="md:col-span-2">
          <Button
            type="submit"
            size="lg"
            className="w-full font-bold h-12 space-x-2 text-white bg-gradient-to-r from-commuter-900 via-mobility-700 to-mobility-800 hover:from-black hover:to-mobility-900 shadow-md shadow-mobility-700/20 rounded-xl"
          >
            <Compass className="w-4 h-4" />
            <span>Find Cabs & Auto</span>
          </Button>
        </div>
      </form>

      {/* Quick Corridor Selector Pills (Authentic Tamil Nadu Mobility routes) */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-commuter-600">
        <span className="font-bold text-commuter-500 flex items-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
          Popular TN Corridors:
        </span>
        <button
          type="button"
          onClick={() =>
            setCorridor(
              "Chennai International Airport (MAA)",
              "OMR Siruseri SIPCOT IT Park (Navalur)",
              "sedan"
            )
          }
          className="px-3 py-1.5 rounded-full bg-white border border-commuter-200 hover:border-mobility-500 hover:text-mobility-800 font-semibold shadow-xs transition-colors flex items-center space-x-1"
        >
          <span>Airport ➔ OMR IT Park</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">₹370</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setCorridor(
              "Chennai Central Railway Station (MAS)",
              "T. Nagar (Pondy Bazaar / Panagal Park)",
              "auto"
            )
          }
          className="px-3 py-1.5 rounded-full bg-white border border-commuter-200 hover:border-mobility-500 hover:text-mobility-800 font-semibold shadow-xs transition-colors flex items-center space-x-1"
        >
          <span>Central ➔ T. Nagar</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">🛺 Auto ₹140</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setCorridor(
              "Velachery MRTS & Phoenix Marketcity",
              "Porur DLF Cybercity & IT Park",
              "bike"
            )
          }
          className="px-3 py-1.5 rounded-full bg-white border border-commuter-200 hover:border-mobility-500 hover:text-mobility-800 font-semibold shadow-xs transition-colors flex items-center space-x-1"
        >
          <span>Velachery ➔ Porur DLF</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">🛵 Bike ₹95</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setCorridor(
              "OMR Sholinganallur ELCOT Junction",
              "Pondicherry White Town / Promenade Beach",
              "mini"
            )
          }
          className="px-3 py-1.5 rounded-full bg-white border border-commuter-200 hover:border-mobility-500 hover:text-mobility-800 font-semibold shadow-xs transition-colors flex items-center space-x-1"
        >
          <span>Chennai ➔ Pondicherry (ECR)</span>
          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">Outstation ₹450</span>
        </button>
      </div>
    </div>
  );
}
