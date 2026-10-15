import * as React from "react";
import { MapPin, Navigation, Clock } from "lucide-react";
import { LocationPoint, RideWaypoint } from "@/features/types";
import { cn } from "@/lib/utils";

export interface RouteTimelineProps {
  origin: LocationPoint;
  destination: LocationPoint;
  waypoints?: RideWaypoint[];
  departureTime?: string;
  className?: string;
  compact?: boolean;
}

export function RouteTimeline({
  origin,
  destination,
  waypoints = [],
  departureTime,
  className,
  compact = false,
}: RouteTimelineProps) {
  const sortedWaypoints = [...waypoints].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className={cn("relative flex flex-col space-y-3 font-sans", className)}>
      {/* Origin */}
      <div className="flex items-start space-x-3 relative">
        <div className="flex flex-col items-center">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border-2 border-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
          </div>
          {/* Vertical line connecting to next stop */}
          <div className="w-0.5 bg-commuter-200 flex-1 min-h-[24px]" />
        </div>
        <div className="pt-0.5 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Pickup / Origin
            </span>
            {departureTime && (
              <span className="flex items-center text-xs text-commuter-500 font-medium">
                <Clock className="w-3 h-3 mr-1 text-commuter-400" />
                {departureTime}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-commuter-900 truncate">
            {origin.address}
          </p>
          <p className="text-xs text-commuter-500">{origin.city}</p>
        </div>
      </div>

      {/* Intermediate Waypoints */}
      {sortedWaypoints.map((wp, index) => (
        <div key={wp.id || index} className="flex items-start space-x-3 relative">
          <div className="flex flex-col items-center">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-commuter-100 border border-commuter-400">
              <span className="h-1.5 w-1.5 rounded-full bg-commuter-600" />
            </div>
            <div className="w-0.5 bg-commuter-200 flex-1 min-h-[20px]" />
          </div>
          <div className="pt-0.5 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-commuter-500 uppercase tracking-wider">
                Waypoint {index + 1}
              </span>
              {wp.estimatedArrival && (
                <span className="text-xs text-commuter-400">{wp.estimatedArrival}</span>
              )}
            </div>
            <p className="text-xs text-commuter-700 truncate">{wp.address}</p>
          </div>
        </div>
      ))}

      {/* Destination */}
      <div className="flex items-start space-x-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mobility-100 border-2 border-mobility-600">
          <MapPin className="h-3.5 w-3.5 text-mobility-700" />
        </div>
        <div className="pt-0.5 min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mobility-800">
            Drop-off / Destination
          </span>
          <p className="text-sm font-semibold text-commuter-900 truncate">
            {destination.address}
          </p>
          <p className="text-xs text-commuter-500">{destination.city}</p>
        </div>
      </div>
    </div>
  );
}
