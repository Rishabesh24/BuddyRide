"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/context/role-context";
import { useToast } from "@/components/ui/toast";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const initialRole = (searchParams.get("role") as UserRole) || "passenger";
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(initialRole);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    // Validate phone number (must be exactly 10 characters / digits)
    const cleanPhone = phone.trim().replace(/\s+/g, "").replace(/^\+91/, "");
    if (!phone.trim() || cleanPhone.length !== 10 || !/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg("Phone number must be exactly 10 characters.");
      return;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const res = await signup({
      fullName,
      email,
      phone: cleanPhone,
      password,
      role: selectedRole,
    });

    setIsLoading(false);

    if (res.success) {
      showToast({
        type: "success",
        title: "Account Created!",
        message: `Welcome, ${fullName}! Your account has been registered as a verified ${selectedRole}.`,
      });

      if (selectedRole === "admin") {
        router.push("/admin");
      } else if (selectedRole === "driver") {
        router.push("/driver");
      } else {
        router.push("/rides");
      }
    } else {
      setErrorMsg(res.message || "Failed to register account. Please check your details and try again.");
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-white via-commuter-50 to-commuter-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-mobility-600 to-commuter-900 text-white shadow-md text-2xl">
              🛺
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-commuter-900 tracking-tight block">
                RouteShare
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                Tamil Nadu
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-commuter-900 pt-2">
            Register New Account
          </h1>
          <p className="text-xs text-commuter-500">
            Join thousands of daily commuters and verified captains in Tamil Nadu.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-commuter-100/80 p-1.5 rounded-2xl border border-commuter-200 grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedRole("passenger")}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === "passenger"
                ? "bg-white text-commuter-900 shadow-sm border border-commuter-200 font-black"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            👤 Passenger / Rider
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("driver")}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === "driver"
                ? "bg-white text-commuter-900 shadow-sm border border-commuter-200 font-black"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            🚕 Driver Partner
          </button>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-commuter-200 shadow-md space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center space-x-2 animate-in fade-in-50">
              <span className="text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
                <User className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Anand Subramanian"
                className="w-full h-11 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
                <Mail className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. anand@example.com"
                className="w-full h-11 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-phone" className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
                <Phone className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                Mobile Number (10 digits)
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full h-11 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
                required
              />
              <p className="text-[11px] text-commuter-500 mt-1">Must be exactly 10 characters.</p>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
                <Lock className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                Create Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full h-11 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
                required
              />
              <p className="text-[11px] text-commuter-500 mt-1">Must be at least 6 characters.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold h-12 bg-commuter-900 hover:bg-black text-white shadow-md shadow-commuter-900/20 rounded-xl"
            >
              <span>Create {selectedRole.toUpperCase()} Account</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-4 border-t border-commuter-100 text-center text-xs text-commuter-500">
            <span>Already registered? </span>
            <Link href={`/login?role=${selectedRole}`} className="font-bold text-mobility-700 hover:text-mobility-900">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm">Loading registration...</div>}>
      <SignupForm />
    </React.Suspense>
  );
}
