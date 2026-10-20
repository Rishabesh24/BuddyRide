"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Car,
  Shield,
  Star,
  CheckCircle2,
  Plus,
  Save,
  Phone,
  Mail,
  AlertCircle,
  ShieldCheck,
  LogOut,
  KeyRound,
  MapPin,
  Compass,
  Navigation,
  ArrowRight,
  Clock,
  FileCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SEED_VEHICLES } from "@/lib/fixtures/rides";
import { VEHICLE_TIERS, Vehicle, VehicleType } from "@/features/types";
import { useRole, UserRole } from "@/context/role-context";
import { RoleGuard } from "@/components/auth/role-guard";

export default function ProfilePage() {
  const { showToast } = useToast();
  const { role, user, logout, currentUser } = useRole();

  const currentRole: UserRole = (role || user?.role || currentUser?.role || "passenger") as UserRole;
  const isAdmin = currentRole === "admin";
  const isDriver = currentRole === "driver";
  const isPassenger = currentRole === "passenger";

  // Safe fallback values for current user fields
  const displayName = currentUser?.fullName || user?.fullName || "RouteShare Member";
  const displayEmail = currentUser?.email || user?.email || "user@routeshare.in";
  const displayPhone = currentUser?.phoneNumber || user?.phoneNumber || "+91 94440 00000";
  const displayRating = typeof currentUser?.ratingAverage === "number" ? currentUser.ratingAverage.toFixed(1) : "5.0";
  const displayRatingCount = currentUser?.ratingCount ?? 0;
  const avatarUrl =
    currentUser?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const [fullName, setFullName] = React.useState(displayName);
  const [phoneNumber, setPhoneNumber] = React.useState(displayPhone);
  const [bio, setBio] = React.useState(currentUser?.bio || "");
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync state when role or currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setPhoneNumber(currentUser.phoneNumber || "");
      setBio(currentUser.bio || "");
    }
  }, [currentUser]);

  // Vehicles state (accessible to Drivers and Admins)
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(SEED_VEHICLES);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = React.useState(false);

  // New vehicle form state
  const [vType, setVType] = React.useState<VehicleType>("sedan");
  const [vMake, setVMake] = React.useState("Maruti Suzuki");
  const [vModel, setVModel] = React.useState("Swift Dzire Tour");
  const [vYear, setVYear] = React.useState(2024);
  const [vPlate, setVPlate] = React.useState("TN 10 BX 9014");
  const [vColor, setVColor] = React.useState("Arctic White");
  const [vCapacity, setVCapacity] = React.useState(4);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile details have been successfully updated.",
      });
    }, 400);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vMake || !vModel || !vPlate) return;

    const newV: Vehicle = {
      id: `v-${Date.now().toString(36)}`,
      driverId: currentUser?.id || "fleet-registered",
      type: vType,
      make: vMake,
      model: vModel,
      year: vYear,
      licensePlate: vPlate,
      color: vColor || "White",
      capacity: vCapacity,
      isActive: true,
    };

    setVehicles([...vehicles, newV]);
    setIsAddVehicleOpen(false);
    showToast({
      type: "success",
      title: "Vehicle Registered",
      message: `${newV.make} ${newV.model} (${newV.licensePlate}) added to authorized fleet.`,
    });
  };

  return (
    <RoleGuard requiredRole="any" portalName="Account Profile">
      <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Active Session & Security Clearance Card */}
          <Card className="bg-white border-commuter-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Verified Active Session
                  </span>
                  <h3 className="text-lg font-black text-commuter-900 mt-0.5">
                    Logged in as {displayName}
                  </h3>
                  <p className="text-xs text-commuter-500">
                    Role: <strong className="text-commuter-900 uppercase">{currentRole}</strong> · Email: <span className="font-mono">{displayEmail}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="text-xs font-bold border-commuter-300">
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                      Switch Account
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={logout}
                    className="text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Profile Card */}
          <Card className="bg-white border-commuter-200 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-commuter-200 shadow-sm bg-commuter-100"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-black text-commuter-900">
                        {displayName}
                      </h1>
                      <p className="text-xs text-commuter-500">{displayEmail}</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end space-x-2">
                      {isPassenger && (
                        <Badge variant="default" className="font-bold flex items-center bg-mobility-600 text-white">
                          <User className="w-3.5 h-3.5 mr-1" />
                          Passenger / Commuter
                        </Badge>
                      )}
                      {isDriver && (
                        <Badge variant="warning" className="font-bold flex items-center bg-amber-500 text-white">
                          <Car className="w-3.5 h-3.5 mr-1" />
                          Driver Partner
                        </Badge>
                      )}
                      {isAdmin && (
                        <Badge variant="danger" className="font-bold flex items-center bg-rose-700 text-white">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          Platform Administrator
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-commuter-600 pt-1">
                    <span className="flex items-center">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                      <strong>{displayRating}</strong> ({displayRatingCount} rides)
                    </span>
                    <span>·</span>
                    <span>Phone: <strong className="text-commuter-900">{displayPhone}</strong></span>
                    <span>·</span>
                    <span>Jurisdiction: <strong className="text-commuter-900">Tamil Nadu (TN-01 to TN-99)</strong></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ================================================================= */}
          {/* 1. ADMIN GOVERNANCE SECTION (ADMINS ONLY)                         */}
          {/* ================================================================= */}
          {isAdmin && (
            <div className="space-y-6">
              <Card className="bg-white border-commuter-200 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-commuter-100">
                    <div>
                      <h2 className="text-lg font-bold text-commuter-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-rose-700" />
                        Platform Governance & Administrative Clearance
                      </h2>
                      <p className="text-xs text-commuter-500 mt-0.5">
                        High-clearance supervisory controls, Tamil Nadu transit operations, and live audit logs.
                      </p>
                    </div>
                    <Badge variant="danger" className="font-bold">
                      Super Admin
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-1.5">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider">
                        Operational Coverage
                      </span>
                      <p className="text-sm font-bold text-commuter-900">All 38 TN Districts</p>
                      <p className="text-[11px] text-commuter-500">Chennai, Coimbatore, Madurai, Trichy</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-1.5">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider">
                        Supervisory Scope
                      </span>
                      <p className="text-sm font-bold text-commuter-900">Driver KYC & Fleet Oversight</p>
                      <p className="text-[11px] text-commuter-500">Live corridor fare multiplier control</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-1.5">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider">
                        Security Status
                      </span>
                      <p className="text-sm font-bold text-emerald-700 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Full Clearance Active
                      </p>
                      <p className="text-[11px] text-commuter-500">Audit logging active for all actions</p>
                    </div>
                  </div>

                  <div>
                    <Link href="/admin">
                      <Button className="w-full font-bold bg-rose-700 hover:bg-rose-800 text-white flex items-center justify-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span>Open Admin Operations & Dispatch Center</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. PASSENGER SECTION (PASSENGERS ONLY)                            */}
          {/* ================================================================= */}
          {isPassenger && (
            <div className="space-y-6">
              {/* Commuter Transit & Safety Overview */}
              <Card className="bg-white border-commuter-200 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-commuter-100">
                    <div>
                      <h2 className="text-lg font-bold text-commuter-900 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-mobility-600" />
                        Commuter Transit Profile & Safety Pass
                      </h2>
                      <p className="text-xs text-commuter-500 mt-0.5">
                        Your personalized ride settings, verified safety credentials, and commute preferences.
                      </p>
                    </div>
                    <Badge variant="success" className="font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Active Rider
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-2">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-mobility-600" />
                        Default Commute Zone
                      </span>
                      <p className="text-sm font-bold text-commuter-900">OMR IT Corridor & GST Highway</p>
                      <p className="text-[11px] text-commuter-500">Siruseri, Sholinganallur, Tidel, Tambaram</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-2">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider flex items-center">
                        <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Boarding Security
                      </span>
                      <p className="text-sm font-bold text-emerald-800">4-Digit OTP Verified</p>
                      <p className="text-[11px] text-commuter-500">Driver must verify unique code before departure</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-2">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                        Emergency SOS Line
                      </span>
                      <p className="text-sm font-bold text-commuter-900">TN Police Helpline 112</p>
                      <p className="text-[11px] text-commuter-500">24/7 RouteShare Rapid Response Protocol</p>
                    </div>
                  </div>

                  {/* Quick Shortcuts for Passenger */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link href="/" className="flex-1">
                      <Button className="w-full font-bold bg-mobility-600 hover:bg-mobility-700 text-white flex items-center justify-center space-x-2">
                        <Compass className="w-4 h-4" />
                        <span>Explore & Book Rides</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/rides" className="flex-1">
                      <Button variant="outline" className="w-full font-bold border-commuter-300 text-commuter-900 flex items-center justify-center space-x-2">
                        <Navigation className="w-4 h-4 text-commuter-700" />
                        <span>My Rides & OTPs</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. DRIVER CREDENTIALS & FLEET (VISIBLE TO DRIVERS & ADMINS)       */}
          {/* ================================================================= */}
          {(isDriver || isAdmin) && (
            <div className="space-y-6">
              {/* Driver Partner Credentials & KYC */}
              <Card className="bg-white border-commuter-200 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-commuter-100">
                    <div>
                      <h2 className="text-lg font-bold text-commuter-900 flex items-center">
                        <FileCheck className="w-5 h-5 mr-2 text-amber-600" />
                        {isAdmin ? "Driver Partner Credentials & KYC Standards (Admin Oversight)" : "Driver Partner Credentials & KYC"}
                      </h2>
                      <p className="text-xs text-commuter-500 mt-0.5">
                        {isAdmin
                          ? "Supervisory clearance, Tamil Nadu commercial driving verification, and revenue audit."
                          : "Government verification, Tamil Nadu commercial driving clearance, and earnings."}
                      </p>
                    </div>
                    <Badge variant="success" className="font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      RTO Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-1.5">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider">
                        Driving License No.
                      </span>
                      <p className="text-sm font-mono font-bold text-commuter-900">
                        {currentUser?.drivingLicenseNo || "TN-07-2018-0049102"}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Valid Commercial Badge
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-1.5">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider">
                        {isAdmin ? "Driver Revenue Tracking" : "Today's Gross Earnings"}
                      </span>
                      <p className="text-lg font-black text-emerald-800">
                        ₹{(currentUser?.todayEarnings ?? 2450).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-commuter-500">
                        {isAdmin ? "Settlement audit status: Balanced" : "Direct instant payout to linked UPI"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 space-y-1.5">
                      <span className="text-xs font-bold text-commuter-500 uppercase tracking-wider">
                        Duty & Verification Status
                      </span>
                      <p className="text-sm font-bold text-emerald-700 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse" />
                        Online & Verified
                      </p>
                      <p className="text-[11px] text-commuter-500">Connected to TN Corridor Dispatch</p>
                    </div>
                  </div>

                  <div>
                    {isDriver ? (
                      <Link href="/driver">
                        <Button className="w-full font-bold bg-commuter-900 hover:bg-black text-white flex items-center justify-center space-x-2">
                          <Car className="w-4 h-4" />
                          <span>Open Driver Console & Live Trips</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/admin">
                        <Button variant="outline" className="w-full font-bold border-commuter-300 text-commuter-900 flex items-center justify-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-rose-700" />
                          <span>Review All Driver KYC & Verifications in Admin Portal</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Registered Fleet & Vehicles (VISIBLE TO BOTH DRIVERS AND ADMINS) */}
              <Card className="bg-white border-commuter-200 shadow-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-commuter-100">
                    <div>
                      <h2 className="text-lg font-bold text-commuter-900">
                        {isAdmin ? "Authorized Vehicles & Commercial Fleet (Admin Oversight)" : "Registered Vehicles & Fleet"}
                      </h2>
                      <p className="text-xs text-commuter-500 mt-0.5">
                        {isAdmin
                          ? "Review, verify, and register authorized commercial vehicles for Tamil Nadu Auto, Bike, Cab, or Shuttle dispatches."
                          : "Authorized commercial vehicles for Auto, Bike Taxi, Cab, or Shuttle dispatches."}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsAddVehicleOpen(true)}
                      className="space-x-1.5 font-bold bg-commuter-900 hover:bg-black text-white"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Vehicle</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((v) => {
                      const tier = VEHICLE_TIERS.find((t) => t.type === v.type) ?? VEHICLE_TIERS[3];
                      return (
                        <div
                          key={v.id}
                          className="p-4 rounded-2xl border border-commuter-200 bg-commuter-50/50 flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-2xl">{tier.emoji}</span>
                              <div>
                                <h3 className="font-bold text-sm text-commuter-900">
                                  {v.make} {v.model}
                                </h3>
                                <p className="text-xs text-commuter-500">
                                  {tier.name} · {v.year} · {v.color}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs font-bold bg-white">
                              {v.licensePlate}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs text-commuter-600 pt-2 border-t border-commuter-200/60">
                            <span>Capacity: <strong>{v.capacity} passenger(s)</strong></span>
                            <span className="text-emerald-700 font-bold flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              RC Verified
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* 4. EDIT PERSONAL PROFILE FORM (ALL USERS)                         */}
          {/* ================================================================= */}
          <Card className="bg-white border-commuter-200 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-commuter-100">
                <h2 className="text-lg font-bold text-commuter-900">
                  Edit Personal Details
                </h2>
                <p className="text-xs text-commuter-500 mt-0.5">
                  Update your contact details and communication preferences.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mahesh K."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                      Mobile Number
                    </label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 9XXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                    Bio / Travel Notes
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Add brief notes about your daily commutes, preferred corridors, or schedule."
                    className="w-full px-3 py-2 rounded-xl border border-commuter-200 text-xs text-commuter-900 focus:outline-none focus:ring-2 focus:ring-mobility-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="font-bold bg-commuter-900 hover:bg-black text-white space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Add Vehicle Modal (For Drivers & Admins) */}
          {isAddVehicleOpen && (isDriver || isAdmin) && (
            <Modal
              isOpen={true}
              onClose={() => setIsAddVehicleOpen(false)}
              title={isAdmin ? "Register Authorized Fleet Vehicle (Admin)" : "Register Vehicle (Tamil Nadu)"}
              description="Enter vehicle specifications to authorize commercial transit dispatches."
            >
              <form onSubmit={handleAddVehicle} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                    Vehicle Category
                  </label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value as VehicleType)}
                    className="w-full h-10 px-3 rounded-lg border border-commuter-200 text-xs font-bold text-commuter-900 bg-white"
                  >
                    <option value="bike">🛵 Bike Taxi (Rapido style - 1 seat)</option>
                    <option value="auto">🛺 Namma Auto (Metered - 3 seats)</option>
                    <option value="mini">🚗 Mini Hatchback (WagonR/Swift - 4 seats)</option>
                    <option value="sedan">🚘 Prime Sedan (Dzire/Etios - 4 seats)</option>
                    <option value="suv">🚙 Prime SUV XL (Innova Crysta - 6 seats)</option>
                    <option value="shuttle">🚐 Corridor Shuttle (Force Urbania - 12 seats)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                      Make / Brand
                    </label>
                    <Input
                      value={vMake}
                      onChange={(e) => setVMake(e.target.value)}
                      placeholder="e.g. Maruti Suzuki"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                      Model
                    </label>
                    <Input
                      value={vModel}
                      onChange={(e) => setVModel(e.target.value)}
                      placeholder="e.g. Swift Dzire"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                      Tamil Nadu Registration
                    </label>
                    <Input
                      value={vPlate}
                      onChange={(e) => setVPlate(e.target.value)}
                      placeholder="e.g. TN 10 BX 9014"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1">
                      Color
                    </label>
                    <Input
                      value={vColor}
                      onChange={(e) => setVColor(e.target.value)}
                      placeholder="e.g. Arctic White"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsAddVehicleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="font-bold bg-commuter-900 text-white">
                    Register Vehicle
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
