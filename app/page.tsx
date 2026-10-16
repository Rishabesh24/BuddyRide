import * as React from "react";
import Link from "next/link";
import {
  Car,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  MapPin,
  Lock,
  PhoneCall,
  UserCheck,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommuterSearchBar } from "@/components/commuter-search-bar";
import { SEED_RIDES } from "@/lib/fixtures/rides";
import { VEHICLE_TIERS } from "@/features/types";
import { formatCurrency, formatTime } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section — Uber / Ola Style Mobility Interface */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-commuter-50 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full border border-amber-300 bg-amber-50/90 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-xs">
              <span className="text-sm">🛺</span>
              <span>Tamil Nadu&apos;s Smart Mobility & Daily Corridor Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-commuter-900 leading-[1.12]">
              Any Ride. Any Corridor. <br />
              <span className="bg-gradient-to-r from-amber-600 via-mobility-600 to-commuter-900 bg-clip-text text-transparent">
                Auto, Bike Taxi & Cabs.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-commuter-600 max-w-2xl mx-auto leading-relaxed">
              Book verified Auto, Bike, and Cabs across Chennai, Coimbatore, Madurai, and OMR IT Corridors. Transparent upfront fares in ₹, instant 4-digit start OTP, and zero surge pricing.
            </p>
          </div>

          {/* Commuter Search Bar with Tamil Nadu Autocomplete & Vehicle Filters */}
          <CommuterSearchBar />
        </div>
      </section>

      {/* Vehicle Tier Grid — Inspired by Uber, Ola & Rapido */}
      <section className="py-16 bg-white border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tailored For Indian City & Highway Commute</span>
            </div>
            <h2 className="text-3xl font-extrabold text-commuter-900">
              Choose the Way You Move
            </h2>
            <p className="mt-2 text-sm text-commuter-600">
              From solo bike hops through peak traffic to high-capacity highway shuttles, every ride is verified and tracked.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VEHICLE_TIERS.map((tier) => (
              <div
                key={tier.type}
                className="group relative rounded-2xl border border-commuter-200 hover:border-mobility-500 bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-commuter-50 border border-commuter-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {tier.emoji}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-commuter-400 block">
                        Base Fare
                      </span>
                      <span className="text-lg font-black text-commuter-900">
                        ₹{tier.baseFare}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-commuter-900 mt-4 flex items-center space-x-2">
                    <span>{tier.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-commuter-100 text-commuter-700">
                      ₹{tier.perKmRate}/km
                    </span>
                  </h3>
                  <p className="text-xs text-commuter-500 mt-1 leading-relaxed">
                    {tier.tagline}
                  </p>

                  <ul className="mt-4 space-y-2 border-t border-commuter-100 pt-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="text-xs text-commuter-600 flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-commuter-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-commuter-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-mobility-600" />
                    Pickup in ~{tier.etaMinutes} mins
                  </span>
                  <Link href={`/rides?vehicle=${tier.type}`}>
                    <Button size="sm" variant="subtle" className="text-xs font-bold">
                      Book {tier.name.split(" ")[0]}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Featured Rides Section (Tamil Nadu Corridors) */}
      <section className="py-16 bg-commuter-50 border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Active Vehicles on Road</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-commuter-900 mt-1">
                Scheduled Rides Open for Booking
              </h2>
            </div>
            <Link
              href="/rides"
              className="mt-3 sm:mt-0 text-sm font-bold text-mobility-700 hover:text-mobility-900 flex items-center space-x-1"
            >
              <span>View all available trips in Tamil Nadu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEED_RIDES.slice(0, 3).map((ride) => (
              <Card key={ride.id} className="hover:border-mobility-400 hover:shadow-md transition-all bg-white">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    {/* Header: Driver & Rating */}
                    <div className="flex items-center justify-between pb-3 border-b border-commuter-100">
                      <div className="flex items-center space-x-3">
                        <img
                          src={ride.driver?.avatarUrl}
                          alt={ride.driver?.fullName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                        <div>
                          <p className="font-bold text-sm text-commuter-900">
                            {ride.driver?.fullName}
                          </p>
                          <p className="text-xs text-commuter-500 flex items-center">
                            <span className="text-amber-500 font-bold mr-1">★ {ride.driver?.ratingAverage.toFixed(2)}</span>
                            <span>({ride.driver?.ratingCount} trips)</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" className="font-bold">
                        {ride.availableSeats} seats open
                      </Badge>
                    </div>

                    {/* Route Details */}
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-start space-x-2.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 ring-4 ring-emerald-50" />
                        <div>
                          <p className="font-bold text-commuter-900">{ride.origin.city}</p>
                          <p className="text-commuter-500 text-[11px] line-clamp-1">
                            {ride.origin.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-mobility-600 mt-1 flex-shrink-0 ring-4 ring-mobility-50" />
                        <div>
                          <p className="font-bold text-commuter-900">{ride.destination.city}</p>
                          <p className="text-commuter-500 text-[11px] line-clamp-1">
                            {ride.destination.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle & Time info */}
                    <div className="mt-4 pt-3 border-t border-commuter-100 flex items-center justify-between text-xs text-commuter-600">
                      <span className="flex items-center font-medium">
                        <Clock className="w-3.5 h-3.5 text-commuter-400 mr-1" />
                        {formatTime(ride.departureTime)}
                      </span>
                      <span className="font-semibold bg-commuter-100 text-commuter-800 px-2 py-0.5 rounded">
                        {ride.vehicle?.make} {ride.vehicle?.model}
                      </span>
                    </div>
                  </div>

                  {/* Fare & CTA */}
                  <div className="mt-5 pt-3 border-t border-commuter-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-commuter-400 block">
                        Fare / Seat
                      </span>
                      <span className="text-xl font-black text-commuter-900">
                        {formatCurrency(ride.totalDistanceKm * ride.basePricePerKm)}
                      </span>
                    </div>
                    <Link href={`/rides/${ride.id}`}>
                      <Button size="sm" className="font-bold bg-commuter-900 hover:bg-commuter-800 text-white">
                        Book Seat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Trust Features (Ola/Uber 4-digit OTP, SOS, KYC) */}
      <section className="py-20 bg-white border-b border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety & Trust Guaranteed</span>
            </div>
            <h2 className="text-3xl font-extrabold text-commuter-900">
              Built with Safety at Every Step
            </h2>
            <p className="mt-2 text-sm text-commuter-600">
              We uphold strict trust protocols so passengers and drivers travel with 100% peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-commuter-50 border border-commuter-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-commuter-900">4-Digit Start OTP</h3>
              <p className="text-xs text-commuter-600 mt-1.5 leading-relaxed">
                Rides only begin once you share your unique 4-digit PIN with the driver inside the car.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-commuter-50 border border-commuter-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-commuter-900">KYC Verified Drivers</h3>
              <p className="text-xs text-commuter-600 mt-1.5 leading-relaxed">
                Driving license, RC book, and vehicle commercial fitness verified before any driver goes online.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-commuter-50 border border-commuter-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-commuter-900">Zero Surge Price</h3>
              <p className="text-xs text-commuter-600 mt-1.5 leading-relaxed">
                Predetermined distance-proportional pricing. Rain or peak office hours, our daily rates stay flat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-commuter-50 border border-commuter-200 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-commuter-900">24/7 SOS & Live GPS</h3>
              <p className="text-xs text-commuter-600 mt-1.5 leading-relaxed">
                Share live route tracking with family. Emergency SOS button connects to operations center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Authentication Portals Hub: Passenger vs Driver Partner vs Admin */}
      <section id="portals" className="py-20 bg-gradient-to-b from-white via-commuter-50 to-commuter-100/70 border-t border-commuter-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full mb-3 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Verified Portals & Role-Based Access Control</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-commuter-900 tracking-tight">
              3 Dedicated Portals. One Platform.
            </h2>
            <p className="mt-2 text-sm text-commuter-600">
              Each workspace requires verified credentials. Choose your portal below to sign in or register before accessing role dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Passenger / Rider Portal */}
            <div className="rounded-3xl border border-commuter-200 bg-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-commuter-100 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-commuter-50 border border-commuter-100 flex items-center justify-center text-2xl shadow-xs">
                    👤
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-700 bg-commuter-100 px-2.5 py-1 rounded-full border border-commuter-200">
                    Rider Gateway
                  </span>
                </div>

                <h3 className="text-xl font-black text-commuter-900 mt-5">
                  Passenger Portal
                </h3>
                <p className="text-xs text-commuter-600 mt-2 leading-relaxed">
                  Search live rides across Tamil Nadu, book Auto, Bike & Cabs, receive instant 4-digit start OTPs, and track ride history.
                </p>

                <div className="mt-5 p-3 rounded-xl bg-commuter-50 border border-commuter-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-commuter-500 block">
                    Demo Account:
                  </span>
                  <div className="font-semibold text-commuter-900 flex items-center justify-between">
                    <span>rider@routeshare.in</span>
                    <span className="text-[10px] text-commuter-500 font-mono">Password123!</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-commuter-100 space-y-2">
                <Link href="/login?role=passenger" className="block">
                  <Button className="w-full font-bold bg-commuter-900 hover:bg-black text-white h-11 rounded-xl shadow-xs flex items-center justify-center space-x-1.5">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as Rider</span>
                  </Button>
                </Link>
                <Link href="/signup?role=passenger" className="block text-center">
                  <Button variant="ghost" className="w-full text-xs font-semibold text-commuter-600 hover:text-commuter-900 h-9">
                    New Rider? Register Account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Driver Partner Portal */}
            <div className="rounded-3xl border border-amber-300 bg-gradient-to-b from-amber-50/50 via-white to-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/50 rounded-full blur-2xl group-hover:bg-amber-300/60 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shadow-xs">
                    🚕
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2.5 py-1 rounded-full border border-amber-300">
                    Partner Gateway
                  </span>
                </div>

                <h3 className="text-xl font-black text-commuter-900 mt-5">
                  Driver Partner Console
                </h3>
                <p className="text-xs text-commuter-600 mt-2 leading-relaxed">
                  Go online, receive instant rider requests along your corridor, verify 4-digit start PINs, and track today&apos;s earnings in ₹.
                </p>

                <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Demo Captain:
                  </span>
                  <div className="font-semibold text-amber-950 flex items-center justify-between">
                    <span>driver@routeshare.in</span>
                    <span className="text-[10px] text-amber-800 font-mono">Password123!</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-100 space-y-2">
                <Link href="/login?role=driver" className="block">
                  <Button className="w-full font-bold bg-amber-600 hover:bg-amber-700 text-white h-11 rounded-xl shadow-xs flex items-center justify-center space-x-1.5">
                    <LogIn className="w-4 h-4" />
                    <span>Driver Partner Sign In</span>
                  </Button>
                </Link>
                <Link href="/signup?role=driver" className="block text-center">
                  <Button variant="ghost" className="w-full text-xs font-semibold text-amber-800 hover:text-amber-950 h-9">
                    Register Vehicle & KYC
                  </Button>
                </Link>
              </div>
            </div>

            {/* Operations Admin Portal */}
            <div className="rounded-3xl border border-commuter-200 bg-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/60 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-xs">
                    🛡️
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
                    Restricted · Staff Only
                  </span>
                </div>

                <h3 className="text-xl font-black text-commuter-900 mt-5">
                  Operations & Safety HQ
                </h3>
                <p className="text-xs text-commuter-600 mt-2 leading-relaxed">
                  Platform command center. Supervise live rides, review and approve driver KYC licenses, handle SOS alerts, and monitor ₹ GMV.
                </p>

                <div className="mt-5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Demo Admin:
                  </span>
                  <div className="font-semibold text-blue-950 flex items-center justify-between">
                    <span>admin@routeshare.in</span>
                    <span className="text-[10px] text-blue-800 font-mono">AdminSecure2026!</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-commuter-100 space-y-2">
                <Link href="/login?role=admin" className="block">
                  <Button variant="outline" className="w-full font-bold border-commuter-300 hover:bg-commuter-50 text-commuter-900 h-11 rounded-xl flex items-center justify-center space-x-1.5">
                    <LogIn className="w-4 h-4" />
                    <span>Admin Secure Sign In</span>
                  </Button>
                </Link>
                <div className="text-center pt-1">
                  <span className="text-[10px] text-commuter-400 font-medium">
                    Strict RBAC clearance required. 403 enforced.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
