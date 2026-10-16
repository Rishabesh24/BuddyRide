"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GeoCoordinate, LocationPoint, RideWaypoint } from "@/features/types";

// Custom Leaflet Icons using SVG Data URIs
const createCustomIcon = (bgColor: string, text: string) => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        background-color: ${bgColor};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 700;
        font-family: sans-serif;
      ">
        ${text}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const originIcon = createCustomIcon("#16A34A", "A");
const destIcon = createCustomIcon("#0D9488", "B");
const waypointIcon = createCustomIcon("#475569", "•");
const pickupIcon = createCustomIcon("#2563EB", "P");

// Component to dynamically fit map bounds to the polyline
function MapBoundsUpdater({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [coordinates, map]);
  return null;
}

export interface InteractiveMapProps {
  origin?: LocationPoint;
  destination?: LocationPoint;
  waypoints?: RideWaypoint[];
  pickupLocation?: GeoCoordinate;
  dropoffLocation?: GeoCoordinate;
  routePolyline?: [number, number][];
  className?: string;
  zoom?: number;
  center?: [number, number];
}

export default function MapInner({
  origin,
  destination,
  waypoints = [],
  pickupLocation,
  dropoffLocation,
  routePolyline,
  className,
  center = [13.0827, 80.2707], // Chennai, Tamil Nadu
  zoom = 11,
}: InteractiveMapProps) {
  // Compute polyline coordinates from points if not explicitly provided
  const polylineCoords: [number, number][] = routePolyline ?? (
    origin && destination
      ? [
          [origin.latitude, origin.longitude],
          ...waypoints.map((w) => [w.latitude, w.longitude] as [number, number]),
          [destination.latitude, destination.longitude],
        ]
      : []
  );

  const initialCenter = origin
    ? ([origin.latitude, origin.longitude] as [number, number])
    : center;

  return (
    <div className={className || "w-full h-full min-h-[300px] relative rounded-xl overflow-hidden border border-commuter-200"}>
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylineCoords.length > 1 && (
          <>
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: "#0D9488",
                weight: 5,
                opacity: 0.85,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <MapBoundsUpdater coordinates={polylineCoords} />
          </>
        )}

        {/* Origin Marker */}
        {origin && (
          <Marker position={[origin.latitude, origin.longitude]} icon={originIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs text-emerald-700">Origin / Departure</p>
                <p className="text-xs text-commuter-800">{origin.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Waypoints */}
        {waypoints.map((wp, idx) => (
          <Marker key={wp.id || idx} position={[wp.latitude, wp.longitude]} icon={waypointIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs text-commuter-600">Waypoint {idx + 1}</p>
                <p className="text-xs text-commuter-800">{wp.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.latitude, destination.longitude]} icon={destIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs text-mobility-700">Destination</p>
                <p className="text-xs text-commuter-800">{destination.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Passenger Pickup/Dropoff Markers if active */}
        {pickupLocation && (
          <Marker position={[pickupLocation.latitude, pickupLocation.longitude]} icon={pickupIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs text-blue-700">Your Pickup Point</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
