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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AdminStats, ReportItem } from "@/features/types";

export default function AdminDashboardPage() {
  const { showToast } = useToast();

  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [reports, setReports] = React.useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
          message: "The flagged item has been marked as reviewed.",
        });
        fetchAdminData();
      }
    } catch {}
  };

  return (
    <div className="flex-1 bg-commuter-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-commuter-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <ShieldAlert className="w-4 h-4" />
              <span>Platform Administration & Trust</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-commuter-900 mt-1">
              Operational Moderation Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-commuter-500 mt-0.5">
              Monitor active transit corridors, safety reports, and algorithmic network occupancy.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-commuter-900 text-white">
              <Lock className="w-3.5 h-3.5 text-mobility-400" />
              <span>Admin Role Authorized</span>
            </span>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        {isLoading || !stats ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-mobility-600 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardContent className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-500 block">
                  Registered Commuters
                </span>
                <p className="text-2xl font-black text-commuter-900 mt-1">
                  {stats.activeUsers}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-500 block">
                  Active Scheduled Rides
                </span>
                <p className="text-2xl font-black text-commuter-900 mt-1">
                  {stats.activeRides}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-500 block">
                  Seat Occupancy Rate
                </span>
                <p className="text-2xl font-black text-emerald-700 mt-1">
                  {stats.occupancyRatePercent}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-commuter-500 block">
                  Open Safety Reports
                </span>
                <p className="text-2xl font-black text-amber-700 mt-1">
                  {stats.flaggedReportsCount}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Moderation Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-commuter-900">
              Community Moderation & Incident Queue
            </h2>
            <span className="text-xs text-commuter-500">
              Review passenger/driver concerns regarding listings or route behavior.
            </span>
          </div>

          <Card className="bg-white">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-commuter-50 border-b border-commuter-200 text-commuter-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Report ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reason / Concern</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-commuter-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-commuter-50/50">
                      <td className="py-3 px-4 font-mono text-commuter-700">{r.id}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{r.targetType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-commuter-800 font-medium">{r.reason}</td>
                      <td className="py-3 px-4">
                        <Badge variant={r.status === "resolved" ? "success" : "warning"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {r.status === "open" ? (
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => handleResolveReport(r.id)}
                            className="text-xs font-semibold"
                          >
                            Mark Resolved
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
