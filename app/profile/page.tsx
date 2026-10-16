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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SEED_VEHICLES } from "@/lib/fixtures/rides";
import { VEHICLE_TIERS, Vehicle, VehicleType } from "@/features/types";
import { useRole } from "@/context/role-context";
import { RoleGuard } from "@/components/auth/role-guard";

export default function ProfilePage() {
  const { showToast } = useToast();
  const { role, user, logout, currentUser } = useRole();

  const [fullName, setFullName] = React.useState(currentUser.fullName);
  const [phoneNumber, setPhoneNumber] = React.useState(currentUser.phoneNumber || "");
  const [bio, setBio] = React.useState(currentUser.bio || "");
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync state when role changes
  React.useEffect(() => {
    setFullName(currentUser.fullName);
    setPhoneNumber(currentUser.phoneNumber || "");
    setBio(currentUser.bio || "");
  }, [currentUser]);

  // Vehicles state
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(SEED_VEHICLES);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = React.useState(false);

  // New vehicle form state
  const [vType, setVType] = React.useState<VehicleType>("sedan");
  const [vMake, setVMake] = React.useState("Maruti Suzuki");
  const [vModel, setVModel] = React.useState("Swift Dzire Tour");
  const [vYear, setVYear] = React.useState(2023);
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
        title: "Profile Saved",
        message: "Your profile details have been saved for this session.",
      });
    }, 300);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vMake || !vModel || !vPlate) return;

    const newV: Vehicle = {
      id: `v-${Date.now().toString(36)}`,
      driverId: currentUser.id,
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
      message: `${newV.make} ${newV.model} (${newV.licensePlate}) added to your fleet.`,
    });
  };

  return (
    <RoleGuard requiredRole="any" portalName="Account & Vehicle Profile">
      <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Active Session & Security Clearance Card */}
          <Card className="bg-white border-commuter-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Verified Session Clearance
                  </span>
                  <h3 className="text-lg font-black text-commuter-900 mt-0.5">
                    Logged in as {user?.fullName || currentUser.fullName}
                  </h3>
                  <p className="text-xs text-commuter-500">
                    Role: <strong className="text-commuter-900 uppercase">{role || "Rider"}</strong> · Email: <span className="font-mono">{user?.email || currentUser.email}</span>
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
        <Card className="bg-white border-commuter-200">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"}
                alt={currentUser.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-commuter-200 shadow-sm"
              />

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-black text-commuter-900">
                      {currentUser.fullName}
                    </h1>
                    <p className="text-xs text-commuter-500">{currentUser.email}</p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <Badge variant="success" className="font-bold flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Active {role}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-commuter-600 pt-1">
                  <span className="flex items-center">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                    <strong>{currentUser.ratingAverage.toFixed(2)}</strong> ({currentUser.ratingCount} rides)
                  </span>
                  <span>·</span>
                  <span>Phone: <strong className="text-commuter-900">{currentUser.phoneNumber}</strong></span>
                  <span>·</span>
                  <span>Region: <strong className="text-commuter-900">Tamil Nadu (TN-01 to TN-99)</strong></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registered Fleet / Vehicles */}
        <Card className="bg-white border-commuter-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-commuter-100">
              <div>
                <h2 className="text-lg font-bold text-commuter-900">
                  Registered Vehicles & Fleet
                </h2>
                <p className="text-xs text-commuter-500 mt-0.5">
                  Vehicles authorized for Auto, Bike Taxi, Cab, or Corridor Shuttle services.
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

        {/* Add Vehicle Modal */}
        {isAddVehicleOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddVehicleOpen(false)}
            title="Register Vehicle (Tamil Nadu)"
            description="Enter vehicle specifications to enable published corridors or passenger trip dispatches."
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
