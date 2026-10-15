"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommuterSearchBar() {
  const router = useRouter();

  const [origin, setOrigin] = React.useState("San Francisco");
  const [destination, setDestination] = React.useState("San Jose");
  const [date, setDate] = React.useState("2026-10-16");
  const [seats, setSeats] = React.useState("1");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/rides?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
        destination
      )}&date=${date}&seats=${seats}`
    );
  };

  const setCorridor = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
  };

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-commuter-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end"
      >
        {/* Origin */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            Origin
          </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. San Francisco"
            className="w-full h-11 px-3.5 rounded-lg border border-commuter-200 text-sm font-medium text-commuter-900 placeholder:text-commuter-400 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
            required
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 text-mobility-600 mr-1.5" />
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. San Jose"
            className="w-full h-11 px-3.5 rounded-lg border border-commuter-200 text-sm font-medium text-commuter-900 placeholder:text-commuter-400 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
            required
          />
        </div>

        {/* Date & Seats in 3rd col */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-commuter-500 mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-2.5 rounded-lg border border-commuter-200 text-sm font-medium text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
              <Users className="w-3.5 h-3.5 text-commuter-500 mr-1" />
              Seats
            </label>
            <select
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="w-full h-11 px-2.5 rounded-lg border border-commuter-200 text-sm font-medium text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100 bg-white"
            >
              <option value="1">1 Seat</option>
              <option value="2">2 Seats</option>
              <option value="3">3 Seats</option>
              <option value="4">4 Seats</option>
            </select>
          </div>
        </div>

        {/* Submit CTA */}
        <div>
          <Button
            type="submit"
            size="lg"
            className="w-full font-bold h-11 space-x-2 text-white shadow-md shadow-mobility-600/20"
          >
            <Compass className="w-4 h-4" />
            <span>Find Rides</span>
          </Button>
        </div>
      </form>

      {/* Quick Corridor Selector Pills */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-commuter-600">
        <span className="font-semibold text-commuter-500">Popular Corridors:</span>
        <button
          type="button"
          onClick={() => setCorridor("San Francisco", "San Jose")}
          className="px-2.5 py-1 rounded-full bg-white border border-commuter-200 hover:border-mobility-400 hover:text-mobility-700 transition-colors"
        >
          SF ➔ San Jose (US-101)
        </button>
        <button
          type="button"
          onClick={() => setCorridor("Hayes Valley", "Palo Alto")}
          className="px-2.5 py-1 rounded-full bg-white border border-commuter-200 hover:border-mobility-400 hover:text-mobility-700 transition-colors"
        >
          SF ➔ Stanford / Palo Alto
        </button>
        <button
          type="button"
          onClick={() => setCorridor("Seattle", "Bellevue")}
          className="px-2.5 py-1 rounded-full bg-white border border-commuter-200 hover:border-mobility-400 hover:text-mobility-700 transition-colors"
        >
          Seattle ➔ Bellevue (I-90)
        </button>
      </div>
    </div>
  );
}
