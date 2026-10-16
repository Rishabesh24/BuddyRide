"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Car,
  CalendarCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Lock,
  DollarSign,
  TrendingUp,
  FileCheck,
  PhoneCall,
  Activity,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AdminStats, Profile, ReportItem } from "@/features/types";
import { SEED_USERS } from "@/lib/fixtures/rides";
import { formatCurrency } from "@/lib/utils";
import { useRole } from "@/context/role-context";
import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const { role, switchRole } = useRole();

  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [reports, setReports] = React.useState<ReportItem[]>([]);
  const [drivers, setDrivers] = React.useState<Profile[]>(
    SEED_USERS.filter((u) => u.role === "driver")
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"overview" | "drivers" | "safety">("overview");

  const fetchAdminData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/reports"),
      ]);
      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (reportsData.success) setReports(reportsData.data);
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleResolveReport = async (reportId: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: "success",
          title: "Report Resolved",
          message: "The incident report has been marked as reviewed and closed.",
        });
        fetchAdminData();
      }
    } catch {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to resolve report.",
      });
    }
  };

  const toggleDriverKyc = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isKycVerified: !d.isKycVerified } : d))
    );
    showToast({
      type: "success",
      title: "Driver KYC Status Updated",
      message: "The driver's verification status has been toggled in the system.",
    });
  };

  return (
    <RoleGuard requiredRole="admin" portalName="Operations Command & Safety Center">
      <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-commuter-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-mobility-700">
              <ShieldAlert className="w-4 h-4 text-mobility-600" />
              <span>Operations Command · Tamil Nadu Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-commuter-900 mt-1">
              Platform Governance & Safety
            </h1>
            <p className="text-xs sm:text-sm text-commuter-500 mt-0.5">
              Live oversight across Chennai, Coimbatore, Madurai, and outstation transit corridors.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-commuter-900 text-white shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Role Authenticated</span>
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-commuter-200 pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-commuter-900 text-white shadow-xs"
                : "text-commuter-600 hover:bg-commuter-100"
            }`}
          >
            Network KPIs & Revenue
          </button>
          <button
            onClick={() => setActiveTab("drivers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "drivers"
                ? "bg-commuter-900 text-white shadow-xs"
                : "text-commuter-600 hover:bg-commuter-100"
            }`}
          >
            Driver KYC Queue ({drivers.length})
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "safety"
                ? "bg-commuter-900 text-white shadow-xs"
                : "text-commuter-600 hover:bg-commuter-100"
            }`}
          >
            Safety & Incident Center ({reports.length})
          </button>
        </div>

        {/* Content by Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* High-Level Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
                  Gross Booking Volume
                </span>
                <span className="text-3xl font-black text-commuter-900">
                  ₹4,82,500
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  +18.4% this week across TN
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
                  Platform Commission (5%)
                </span>
                <span className="text-3xl font-black text-emerald-700">
                  ₹24,125
                </span>
                <span className="text-[11px] text-commuter-500 font-medium block mt-1">
                  Net transaction cut
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
                  Active Commuters
                </span>
                <span className="text-3xl font-black text-commuter-900">
                  {stats ? stats.activeUsers : "348"}
                </span>
                <span className="text-[11px] text-commuter-500 font-medium block mt-1">
                  Verified mobile accounts
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-commuter-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-400 block mb-1">
                  Corridor Occupancy Rate
                </span>
                <span className="text-3xl font-black text-mobility-700">
                  {stats ? `${stats.occupancyRatePercent}%` : "76.4%"}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  Optimal seat utilization
                </span>
              </div>
            </div>

            {/* Algorithmic Engine & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-commuter-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-commuter-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Geospatial Matching Engine Performance</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-commuter-50 border border-commuter-200">
                    <span className="text-commuter-500 block">Avg Match Latency</span>
                    <span className="text-xl font-black text-commuter-900">42 ms</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Spherical Haversine</span>
                  </div>
                  <div className="p-4 rounded-xl bg-commuter-50 border border-commuter-200">
                    <span className="text-commuter-500 block">Detour Rejection</span>
                    <span className="text-xl font-black text-commuter-900">98.2%</span>
                    <span className="text-[10px] text-commuter-500 block mt-0.5">Strict ≤ 4 km limit</span>
                  </div>
                  <div className="p-4 rounded-xl bg-commuter-50 border border-commuter-200">
                    <span className="text-commuter-500 block">Start OTP Success</span>
                    <span className="text-xl font-black text-emerald-700">100%</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Zero unverified trips</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-commuter-200 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-commuter-900">
                  Corridor Distribution
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-commuter-100">
                    <span className="text-commuter-700">OMR IT Corridor (Chennai)</span>
                    <span className="font-bold text-commuter-900">42%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-commuter-100">
                    <span className="text-commuter-700">Airport ➔ Central (GST Road)</span>
                    <span className="font-bold text-commuter-900">26%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-commuter-100">
                    <span className="text-commuter-700">ECR Chennai ➔ Pondicherry</span>
                    <span className="font-bold text-commuter-900">18%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-commuter-100">
                    <span className="text-commuter-700">Coimbatore IT SEZ</span>
                    <span className="font-bold text-commuter-900">14%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Driver KYC Queue Tab */}
        {activeTab === "drivers" && (
          <div className="bg-white rounded-3xl border border-commuter-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-commuter-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-commuter-900">
                  Driver Partner Verification Queue
                </h3>
                <p className="text-xs text-commuter-500 mt-0.5">
                  Inspect driving licenses, vehicle RC books, and commercial insurance permits.
                </p>
              </div>
              <Badge variant="success" className="font-bold">
                {drivers.filter((d) => d.isKycVerified).length} Verified
              </Badge>
            </div>

            <div className="divide-y divide-commuter-100 text-xs">
              {drivers.map((driver) => (
                <div key={driver.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-commuter-50/50 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={driver.avatarUrl}
                      alt={driver.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-commuter-200"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-commuter-900">
                          {driver.fullName}
                        </span>
                        {driver.isKycVerified ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                            <CheckCircle className="w-3 h-3 mr-0.5" />
                            KYC Verified
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-commuter-500 text-[11px] mt-0.5">
                        License: <strong className="text-commuter-800 font-mono">{driver.drivingLicenseNo || "TN-07-2018-0049102"}</strong> · Rating: ★ {driver.ratingAverage} ({driver.ratingCount} trips)
                      </p>
                      <p className="text-commuter-400 text-[10px]">
                        Phone: {driver.phoneNumber} · Email: {driver.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant={driver.isKycVerified ? "outline" : "default"}
                      onClick={() => toggleDriverKyc(driver.id)}
                      className="text-xs font-bold"
                    >
                      {driver.isKycVerified ? "Revoke Verification" : "Approve KYC"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Incident Center Tab */}
        {activeTab === "safety" && (
          <div className="bg-white rounded-3xl border border-commuter-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-commuter-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-commuter-900">
                  Trust, Safety & Incident Inquiries
                </h3>
                <p className="text-xs text-commuter-500 mt-0.5">
                  Passenger inquiries, pickup landmark disputes, and emergency support logs.
                </p>
              </div>
            </div>

            <div className="divide-y divide-commuter-100 text-xs">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-commuter-500">
                  No open safety reports or disputes currently recorded.
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-commuter-800">{report.id}</span>
                        <Badge variant={report.status === "resolved" ? "default" : "warning"}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-commuter-900">
                        {report.reason}
                      </p>
                      <span className="text-[10px] text-commuter-400 block">
                        Logged on {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {report.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => handleResolveReport(report.id)}
                        className="text-xs font-bold bg-commuter-900 text-white"
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}
