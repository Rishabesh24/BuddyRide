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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SEED_USERS, SEED_VEHICLES } from "@/lib/fixtures/rides";
import { Vehicle } from "@/features/types";

export default function ProfilePage() {
  const { showToast } = useToast();

  const user = SEED_USERS[0]; // Alex Mercer default demo profile
  const [fullName, setFullName] = React.useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = React.useState(user.phoneNumber || "");
  const [bio, setBio] = React.useState(user.bio || "");
  const [isSaving, setIsSaving] = React.useState(false);

  // Vehicles state
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(SEED_VEHICLES);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = React.useState(false);

  // New vehicle form state
  const [vMake, setVMake] = React.useState("");
  const [vModel, setVModel] = React.useState("");
  const [vYear, setVYear] = React.useState(2023);
  const [vPlate, setVPlate] = React.useState("");
  const [vColor, setVColor] = React.useState("");
  const [vCapacity, setVCapacity] = React.useState(4);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile information and commuter preferences have been saved.",
      });
    }, 400);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vMake || !vModel || !vPlate) return;

    const newV: Vehicle = {
      id: `v-${Date.now().toString(36)}`,
      driverId: user.id,
      make: vMake,
      model: vModel,
      year: vYear,
      licensePlate: vPlate,
      color: vColor || "Black",
      capacity: vCapacity,
      isActive: true,
    };

    setVehicles([...vehicles, newV]);
    setIsAddVehicleOpen(false);
    showToast({
      type: "success",
      title: "Vehicle Registered",
      message: `${newV.make} ${newV.model} has been added to your garage.`,
    });
    // Reset
    setVMake("");
    setVModel("");
    setVPlate("");
  };

  return (
    <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Card */}
        <Card className="bg-white border-commuter-200">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-commuter-900">
                    {user.fullName}
                  </h1>
                  <Badge variant="mobility">Verified Commuter</Badge>
                  <Badge variant="success">Dual Driver / Passenger</Badge>
                </div>
                <p className="text-xs text-commuter-500">{user.email}</p>

                {/* Rating & Stats */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-commuter-700">
                  <span className="flex items-center text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {user.ratingAverage.toFixed(2)} rating ({user.ratingCount} reviews)
                  </span>
                  <span>·</span>
                  <span>58 Rides Completed</span>
                  <span>·</span>
                  <span>100% On-Time Record</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Profile Form */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-commuter-700 mb-4 flex items-center">
                <User className="w-4 h-4 text-mobility-600 mr-2" />
                Personal Information & Bio
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-commuter-700 mb-1.5">
                    Commuter Bio
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-lg border border-commuter-200 text-xs font-medium text-commuter-900 focus:outline-none focus:border-mobility-600"
                    placeholder="Tell co-riders about your daily route, commute habits, and music/talking preferences."
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" size="sm" isLoading={isSaving} className="font-bold space-x-1.5">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Registered Vehicles */}
          <Card className="bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-commuter-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-commuter-700 flex items-center">
                  <Car className="w-4 h-4 text-mobility-600 mr-2" />
                  Registered Commute Vehicles
                </h3>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Car
                </Button>
              </div>

              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl border border-commuter-200 bg-commuter-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-commuter-900">
                          {v.make} {v.model}
                        </span>
                        <span className="text-xs text-commuter-500">({v.year})</span>
                        {v.isActive && (
                          <Badge variant="success" className="text-[10px]">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-commuter-500 mt-0.5">
                        Plate: {v.licensePlate} · Color: {v.color} · Up to {v.capacity} passengers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Vehicle Modal */}
        <Modal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          title="Register New Commuter Vehicle"
          description="Add a vehicle to offer seats to fellow commuters."
        >
          <form onSubmit={handleAddVehicle} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Make"
                placeholder="e.g. Toyota"
                value={vMake}
                onChange={(e) => setVMake(e.target.value)}
                required
              />
              <Input
                label="Model"
                placeholder="e.g. Prius Prime"
                value={vModel}
                onChange={(e) => setVModel(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                label="Year"
                value={vYear}
                onChange={(e) => setVYear(Number(e.target.value))}
                required
              />
              <Input
                label="Color"
                placeholder="e.g. Silver"
                value={vColor}
                onChange={(e) => setVColor(e.target.value)}
              />
              <Input
                type="number"
                label="Capacity"
                min={1}
                max={8}
                value={vCapacity}
                onChange={(e) => setVCapacity(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="License Plate"
              placeholder="e.g. 7XYZ892"
              value={vPlate}
              onChange={(e) => setVPlate(e.target.value)}
              required
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-commuter-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddVehicleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Register Vehicle
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
