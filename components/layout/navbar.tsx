"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Car,
  CalendarCheck,
  PlusCircle,
  Bell,
  Menu,
  X,
  ShieldAlert,
  User,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InAppNotification } from "@/features/types";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<InAppNotification[]>([]);
  const [userMode, setUserMode] = React.useState<"passenger" | "driver">("passenger");

  React.useEffect(() => {
    // Fetch notifications
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Update mode based on current URL path
  React.useEffect(() => {
    if (pathname?.startsWith("/driver")) {
      setUserMode("driver");
    } else {
      setUserMode("passenger");
    }
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-commuter-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mobility-600 to-mobility-800 text-white shadow-sm transition-transform group-hover:scale-105">
                {/* Connected routes icon */}
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="6" r="3" />
                  <path d="M9 18h3a6 6 0 0 0 6-6V9" />
                  <path d="M14 12l4-4 4 4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-commuter-900 group-hover:text-mobility-700 transition-colors">
                  RouteShare
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-commuter-500 -mt-1">
                  Commuter Network
                </span>
              </div>
            </Link>

            {/* Mode Switcher Pill */}
            <div className="hidden md:flex items-center p-1 rounded-full bg-commuter-100 border border-commuter-200 text-xs font-semibold">
              <Link
                href="/rides"
                className={cn(
                  "px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center space-x-1.5",
                  userMode === "passenger"
                    ? "bg-white text-commuter-900 shadow-sm"
                    : "text-commuter-600 hover:text-commuter-900"
                )}
              >
                <Compass className="w-3.5 h-3.5 text-mobility-600" />
                <span>Find Rides</span>
              </Link>
              <Link
                href="/driver"
                className={cn(
                  "px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center space-x-1.5",
                  userMode === "driver"
                    ? "bg-white text-commuter-900 shadow-sm"
                    : "text-commuter-600 hover:text-commuter-900"
                )}
              >
                <Car className="w-3.5 h-3.5 text-mobility-600" />
                <span>Offer Rides</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-commuter-700">
            <Link
              href="/rides"
              className={cn(
                "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                pathname === "/rides" && "text-mobility-700 font-semibold bg-mobility-50/50"
              )}
            >
              Search Rides
            </Link>
            <Link
              href="/bookings"
              className={cn(
                "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                pathname === "/bookings" && "text-mobility-700 font-semibold bg-mobility-50/50"
              )}
            >
              My Bookings
            </Link>
            <Link
              href="/driver"
              className={cn(
                "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                pathname === "/driver" && "text-mobility-700 font-semibold bg-mobility-50/50"
              )}
            >
              Driver Dashboard
            </Link>
          </nav>

          {/* Action Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Publish Ride CTA */}
            <Link href="/driver/publish" className="hidden sm:inline-flex">
              <Button size="sm" className="space-x-1.5 font-semibold">
                <PlusCircle className="w-4 h-4" />
                <span>Publish Ride</span>
              </Button>
            </Link>

            {/* Notification Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg text-commuter-600 hover:bg-commuter-100 hover:text-commuter-900 focus:outline-none focus:ring-2 focus:ring-mobility-600"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-commuter-200 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-commuter-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-commuter-900">
                        In-App Notifications
                      </span>
                      {unreadCount > 0 && (
                        <Badge variant="warning">{unreadCount} new</Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-mobility-600 hover:text-mobility-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-commuter-500 py-4 text-center">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.linkUrl || "#"}
                          onClick={() => setIsNotificationsOpen(false)}
                          className={cn(
                            "block p-2.5 rounded-lg border transition-colors",
                            n.isRead
                              ? "border-commuter-100 bg-white hover:bg-commuter-50"
                              : "border-mobility-200 bg-mobility-50/40 hover:bg-mobility-50"
                          )}
                        >
                          <p className="text-xs font-semibold text-commuter-900">
                            {n.title}
                          </p>
                          <p className="text-xs text-commuter-600 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-commuter-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Quick Link */}
            <Link
              href="/profile"
              className="flex items-center space-x-2 p-1 rounded-full border border-commuter-200 hover:border-mobility-500 transition-colors"
              title="User Profile & Settings"
            >
              <div className="w-8 h-8 rounded-full bg-commuter-800 text-white flex items-center justify-center font-bold text-xs">
                AL
              </div>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-commuter-600 hover:bg-commuter-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-commuter-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <Link
              href="/rides"
              className={cn(
                "p-2.5 text-center rounded-lg border text-xs font-bold transition-colors",
                userMode === "passenger"
                  ? "bg-mobility-50 border-mobility-500 text-mobility-900"
                  : "bg-commuter-50 border-commuter-200 text-commuter-700"
              )}
            >
              Passenger Mode
            </Link>
            <Link
              href="/driver"
              className={cn(
                "p-2.5 text-center rounded-lg border text-xs font-bold transition-colors",
                userMode === "driver"
                  ? "bg-mobility-50 border-mobility-500 text-mobility-900"
                  : "bg-commuter-50 border-commuter-200 text-commuter-700"
              )}
            >
              Driver Mode
            </Link>
          </div>

          <div className="space-y-1 text-sm font-medium">
            <Link
              href="/rides"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <Compass className="w-4 h-4 text-mobility-600" />
              <span>Search Available Rides</span>
            </Link>
            <Link
              href="/bookings"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <CalendarCheck className="w-4 h-4 text-mobility-600" />
              <span>My Passenger Bookings</span>
            </Link>
            <Link
              href="/driver"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <Car className="w-4 h-4 text-mobility-600" />
              <span>Driver Dashboard & Requests</span>
            </Link>
            <Link
              href="/driver/publish"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <PlusCircle className="w-4 h-4 text-mobility-600" />
              <span>Publish New Journey</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <User className="w-4 h-4 text-mobility-600" />
              <span>Profile & Vehicle Management</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <ShieldAlert className="w-4 h-4 text-mobility-600" />
              <span>Admin Moderation</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
