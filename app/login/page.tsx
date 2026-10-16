"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, UserRole } from "@/context/role-context";
import { DEMO_CREDENTIALS } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, role: currentRole } = useAuth();

  const initialRole = (searchParams.get("role") as UserRole) || "passenger";
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Sync role if query parameter changes
  React.useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && (roleParam === "passenger" || roleParam === "driver" || roleParam === "admin")) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Handle preset autofill
  const fillPreset = (role: UserRole) => {
    const preset = DEMO_CREDENTIALS.find((c) => c.role === role);
    if (preset) {
      setSelectedRole(role);
      setIdentifier(preset.email);
      setPassword(preset.password);
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const res = await login(identifier, password, selectedRole);

    if (res.success) {
      if (selectedRole === "admin") {
        router.push("/admin");
      } else if (selectedRole === "driver") {
        router.push("/driver");
      } else {
        router.push("/rides");
      }
    } else {
      setErrorMsg(res.message || "Invalid credentials. Please verify your role and password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-white via-commuter-50 to-commuter-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Wordmark */}
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
            Sign In to Your Workspace
          </h1>
          <p className="text-xs text-commuter-500">
            Select your role and enter your verified credentials to enter.
          </p>
        </div>

        {/* Role Selector Tabs (Passenger, Driver Partner, Admin) */}
        <div className="bg-commuter-100/80 p-1.5 rounded-2xl border border-commuter-200 grid grid-cols-3 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSelectedRole("passenger");
              setErrorMsg("");
            }}
            className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center ${
              selectedRole === "passenger"
                ? "bg-white text-commuter-900 shadow-sm border border-commuter-200 font-black"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            <span className="text-base mb-0.5">👤</span>
            <span>Rider</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole("driver");
              setErrorMsg("");
            }}
            className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center ${
              selectedRole === "driver"
                ? "bg-white text-commuter-900 shadow-sm border border-commuter-200 font-black"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            <span className="text-base mb-0.5">🚕</span>
            <span>Driver</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole("admin");
              setErrorMsg("");
            }}
            className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center ${
              selectedRole === "admin"
                ? "bg-white text-commuter-900 shadow-sm border border-commuter-200 font-black"
                : "text-commuter-600 hover:text-commuter-900"
            }`}
          >
            <span className="text-base mb-0.5">🛡️</span>
            <span>Admin</span>
          </button>
        </div>

        {/* Demo Credential Quick-Fill Chips */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Quick Demo Autofill (1-Click Evaluation):
          </span>
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => fillPreset("passenger")}
              className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                selectedRole === "passenger"
                  ? "bg-white border-amber-400 shadow-xs font-bold text-commuter-900"
                  : "bg-amber-100/40 border-amber-200/80 text-commuter-700 hover:bg-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>👤</span>
                <div>
                  <span className="font-bold text-xs block">Anand Subramanian (Rider)</span>
                  <span className="text-[10px] text-commuter-500">rider@routeshare.in · Password123!</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Auto-Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillPreset("driver")}
              className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                selectedRole === "driver"
                  ? "bg-white border-amber-400 shadow-xs font-bold text-commuter-900"
                  : "bg-amber-100/40 border-amber-200/80 text-commuter-700 hover:bg-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>🚕</span>
                <div>
                  <span className="font-bold text-xs block">Karthik Raja (Dzire Driver)</span>
                  <span className="text-[10px] text-commuter-500">driver@routeshare.in · Password123!</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Auto-Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillPreset("admin")}
              className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                selectedRole === "admin"
                  ? "bg-white border-amber-400 shadow-xs font-bold text-commuter-900"
                  : "bg-amber-100/40 border-amber-200/80 text-commuter-700 hover:bg-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>🛡️</span>
                <div>
                  <span className="font-bold text-xs block">Chennai Operations Lead (Admin)</span>
                  <span className="text-[10px] text-commuter-500">admin@routeshare.in · AdminSecure2026!</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Auto-Fill</span>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-commuter-200 shadow-md space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 mb-1.5 flex items-center">
                <Mail className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                Email Address / Mobile Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. rider@routeshare.in or 9840988123"
                className="w-full h-11 px-3.5 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-commuter-700 flex items-center">
                  <Lock className="w-3.5 h-3.5 text-commuter-400 mr-1.5" />
                  Password
                </label>
                <span className="text-[11px] text-mobility-600 font-semibold cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-commuter-200 text-sm font-semibold text-commuter-900 focus:outline-none focus:border-mobility-600 focus:ring-2 focus:ring-mobility-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-commuter-400 hover:text-commuter-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold h-12 bg-commuter-900 hover:bg-black text-white shadow-md shadow-commuter-900/20 rounded-xl"
            >
              <span>Sign In as {selectedRole.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-4 border-t border-commuter-100 text-center text-xs text-commuter-500">
            <span>Don&apos;t have an account yet? </span>
            <Link href={`/signup?role=${selectedRole}`} className="font-bold text-mobility-700 hover:text-mobility-900">
              Create {selectedRole} Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm">Loading sign-in...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
