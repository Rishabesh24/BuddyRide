import * as React from "react";
import Link from "next/link";
import { ShieldCheck, GitBranch, Terminal, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-commuter-200 bg-white text-commuter-600 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mobility-600 text-white font-bold text-xs">
                RS
              </div>
              <span className="font-bold text-base text-commuter-900 tracking-tight">
                RouteShare
              </span>
            </div>
            <p className="text-xs text-commuter-500 leading-relaxed">
              Algorithmic carpooling & smart commuter ride-sharing platform. Connecting passengers and drivers along overlapping corridors with transparent cost sharing.
            </p>
            {/* System Status Pill */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Zero-Config Fixture Mode Active</span>
            </div>
          </div>

          {/* Col 2: Commuter Corridors */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-commuter-900">
              Tamil Nadu Corridors
            </h4>
            <ul className="space-y-1.5 text-xs text-commuter-600">
              <li>
                <Link href="/rides?origin=Chennai+Airport&destination=OMR+Siruseri" className="hover:text-mobility-600 transition-colors">
                  Airport ➔ OMR Siruseri IT Park
                </Link>
              </li>
              <li>
                <Link href="/rides?origin=Chennai+Central&destination=T.+Nagar" className="hover:text-mobility-600 transition-colors">
                  Chennai Central ➔ T. Nagar
                </Link>
              </li>
              <li>
                <Link href="/rides?origin=OMR+Sholinganallur&destination=Pondicherry" className="hover:text-mobility-600 transition-colors">
                  Chennai ➔ Pondicherry (ECR Route)
                </Link>
              </li>
              <li>
                <Link href="/rides?origin=Coimbatore&destination=Saravanampatti" className="hover:text-mobility-600 transition-colors">
                  Coimbatore ➔ Saravanampatti IT SEZ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Engineering */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-commuter-900">
              Engineering Architecture
            </h4>
            <ul className="space-y-1.5 text-xs text-commuter-600">
              <li className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-mobility-600" />
                <span>Next.js 15 App Router & Strict TS</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-mobility-600" />
                <span>Spherical Haversine Detour Matching</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <GitBranch className="w-3.5 h-3.5 text-mobility-600" />
                <span>Supabase PostgreSQL Schema & RLS</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-mobility-600" />
                <span>Deterministic Proportional Fares</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-commuter-900">
              Trust & Community
            </h4>
            <p className="text-xs text-commuter-500 leading-relaxed">
              Every driver is verified with vehicle capacity locks to eliminate double-booking. Fares strictly allocate travel costs with zero predatory surge pricing.
            </p>
            <div className="pt-1 flex flex-col space-y-1">
              <Link
                href="/login?role=admin"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-commuter-700 hover:text-mobility-600"
              >
                <span>Staff Operations Portal (RBAC)</span>
                <span>➔</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-commuter-100 flex flex-col sm:flex-row items-center justify-between text-xs text-commuter-500 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} RouteShare Systems. Built for Software Engineering Portfolio & Placements.</p>
          <p className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for daily commuters.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
