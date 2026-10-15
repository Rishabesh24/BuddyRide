"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";
import type { InteractiveMapProps } from "./map-inner";

// Client-only dynamic import to prevent Leaflet window reference errors on server
const MapWithNoSSR = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-commuter-100 rounded-xl border border-commuter-200 text-commuter-500 animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin text-mobility-600 mb-2" />
      <div className="flex items-center text-xs font-medium">
        <MapPin className="w-4 h-4 mr-1 text-mobility-600" />
        Loading Interactive Route Map...
      </div>
    </div>
  ),
});

export function InteractiveMap(props: InteractiveMapProps) {
  return <MapWithNoSSR {...props} />;
}
