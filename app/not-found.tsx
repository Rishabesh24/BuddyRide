import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-commuter-50">
      <div className="w-16 h-16 rounded-2xl bg-mobility-100 text-mobility-700 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold text-commuter-900">
        404 — Route Not Found
      </h1>
      <p className="mt-2 text-sm text-commuter-600 max-w-md">
        The destination or commuter listing you requested could not be located along our active corridors.
      </p>
      <div className="mt-6 flex items-center space-x-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="space-x-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Button>
        </Link>
        <Link href="/rides">
          <Button size="sm" className="font-bold">
            Search Available Rides
          </Button>
        </Link>
      </div>
    </div>
  );
}
