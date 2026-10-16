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
  ShieldCheck,
  LogOut,
  LogIn,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InAppNotification } from "@/features/types";
import { useAuth } from "@/context/role-context";

export function Navbar() {
  const pathname = usePathname();
  const { role, user, isAuthenticated, logout, isOnline, toggleOnline, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<InAppNotification[]>([]);

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

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-commuter-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-mobility-600 to-commuter-900 text-white shadow-sm transition-transform group-hover:scale-105">
                <span className="text-xl">🛺</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-tight text-commuter-900 group-hover:text-mobility-700 transition-colors">
                    RouteShare
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                    Tamil Nadu
                  </span>
                </div>
                <span className="text-[10px] font-semibold tracking-wider text-commuter-500 -mt-0.5">
                  Smart Commute & Carpools
                </span>
              </div>
            </Link>

            {/* When Authenticated: Show Verified Persona Badge */}
            {isAuthenticated && role && (
              <div className="hidden md:flex items-center space-x-2">
                {role === "passenger" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-commuter-100 text-commuter-900 border border-commuter-200">
                    <span>👤</span>
                    <span>Rider Session</span>
                  </span>
                )}
                {role === "driver" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span>🚕</span>
                    <span>Driver Partner</span>
                  </span>
                )}
                {role === "admin" && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
                    <span>Admin Operations HQ</span>
                  </span>
                )}
              </div>
            )}

            {/* When NOT Authenticated: Show Portal Entry Shortcuts */}
            {!isAuthenticated && (
              <div className="hidden lg:flex items-center p-1 rounded-xl bg-commuter-50 border border-commuter-200 text-xs font-semibold">
                <Link
                  href="/login?role=passenger"
                  className="px-2.5 py-1 rounded-lg text-commuter-600 hover:text-commuter-900 hover:bg-white transition-all flex items-center space-x-1"
                >
                  <span>👤 Rider Login</span>
                </Link>
                <span className="text-commuter-300">|</span>
                <Link
                  href="/login?role=driver"
                  className="px-2.5 py-1 rounded-lg text-commuter-600 hover:text-commuter-900 hover:bg-white transition-all flex items-center space-x-1"
                >
                  <span>🚕 Driver Partner</span>
                </Link>
                <span className="text-commuter-300">|</span>
                <Link
                  href="/login?role=admin"
                  className="px-2.5 py-1 rounded-lg text-commuter-600 hover:text-commuter-900 hover:bg-white transition-all flex items-center space-x-1"
                >
                  <span>🛡️ Staff Admin</span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links based on active authentication state */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-commuter-700">
            {/* Public Links */}
            <Link
              href="/rides"
              className={cn(
                "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                pathname === "/rides" && "text-mobility-700 font-bold bg-mobility-50/60"
              )}
            >
              Explore Rides
            </Link>

            {/* Authenticated Persona Specific Links */}
            {isAuthenticated && role === "passenger" && (
              <Link
                href="/bookings"
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                  pathname === "/bookings" && "text-mobility-700 font-bold bg-mobility-50/60"
                )}
              >
                My Rides & OTP
              </Link>
            )}

            {isAuthenticated && role === "driver" && (
              <>
                <Link
                  href="/driver"
                  className={cn(
                    "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                    pathname === "/driver" && "text-mobility-700 font-bold bg-mobility-50/60"
                  )}
                >
                  Driver Console
                </Link>
                <Link
                  href="/driver/publish"
                  className={cn(
                    "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                    pathname === "/driver/publish" && "text-mobility-700 font-bold bg-mobility-50/60"
                  )}
                >
                  Publish Corridor
                </Link>
              </>
            )}

            {isAuthenticated && role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors hover:bg-commuter-50 hover:text-commuter-900",
                  pathname === "/admin" && "text-mobility-700 font-bold bg-mobility-50/60"
                )}
              >
                Operations HQ
              </Link>
            )}
          </nav>

          {/* Action Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <>
                {/* Driver Online Toggle */}
                {role === "driver" && (
                  <button
                    onClick={toggleOnline}
                    className={cn(
                      "hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
                      isOnline
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-commuter-100 text-commuter-600 border-commuter-300"
                    )}
                    title="Toggle Driver Availability"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isOnline ? "bg-emerald-500 animate-pulse" : "bg-commuter-400"
                      )}
                    />
                    <span>{isOnline ? "Online" : "Offline"}</span>
                  </button>
                )}

                {/* Notifications Popover */}
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

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-commuter-200 z-50 animate-in fade-in-50 zoom-in-95">
                      <div className="flex items-center justify-between pb-3 border-b border-commuter-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-commuter-900">
                            Live Alerts & OTPs
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

                {/* Profile Pill */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 p-1.5 rounded-full border border-commuter-200 hover:border-mobility-500 bg-commuter-50 hover:bg-white transition-all"
                  title={`${currentUser.fullName} (${role})`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-commuter-800 to-commuter-950 text-white flex items-center justify-center font-black text-xs shadow-inner">
                    {currentUser.fullName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="hidden xl:flex flex-col text-left pr-2">
                    <span className="text-xs font-bold text-commuter-900 leading-tight">
                      {currentUser.fullName.split(" ")[0]}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-mobility-700">
                      {role}
                    </span>
                  </div>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              /* Unauthenticated Controls */
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button size="sm" className="font-bold bg-commuter-900 hover:bg-black text-white px-4 h-9 rounded-xl shadow-xs">
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:inline-flex">
                  <Button size="sm" variant="outline" className="font-semibold border-commuter-300 text-commuter-700 h-9 rounded-xl">
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            )}

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
        <div className="lg:hidden border-b border-commuter-200 bg-white px-4 pt-3 pb-6 space-y-4">
          {isAuthenticated ? (
            <div className="p-3 rounded-2xl bg-commuter-50 border border-commuter-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-commuter-900 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.fullName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="text-xs font-black text-commuter-900">{currentUser.fullName}</p>
                  <p className="text-[10px] uppercase font-bold text-mobility-700">{role} Account</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 p-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pb-2 border-b border-commuter-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-commuter-500">
                Sign In to Your Workspace
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/login?role=passenger"
                  className="p-2.5 text-center rounded-xl border border-commuter-200 bg-commuter-50 text-xs font-bold text-commuter-800"
                >
                  <span className="block text-base">👤</span>
                  <span>Rider</span>
                </Link>
                <Link
                  href="/login?role=driver"
                  className="p-2.5 text-center rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900"
                >
                  <span className="block text-base">🚕</span>
                  <span>Driver</span>
                </Link>
                <Link
                  href="/login?role=admin"
                  className="p-2.5 text-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-900"
                >
                  <span className="block text-base">🛡️</span>
                  <span>Admin</span>
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-1 text-sm font-medium">
            <Link
              href="/rides"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
            >
              <Compass className="w-4 h-4 text-mobility-600" />
              <span>Explore Available Rides</span>
            </Link>

            {isAuthenticated && role === "passenger" && (
              <Link
                href="/bookings"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
              >
                <CalendarCheck className="w-4 h-4 text-mobility-600" />
                <span>My Passenger Bookings & OTP</span>
              </Link>
            )}

            {isAuthenticated && role === "driver" && (
              <>
                <Link
                  href="/driver"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
                >
                  <Car className="w-4 h-4 text-mobility-600" />
                  <span>Driver Console & Requests</span>
                </Link>
                <Link
                  href="/driver/publish"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
                >
                  <PlusCircle className="w-4 h-4 text-mobility-600" />
                  <span>Publish New Journey</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
              >
                <ShieldAlert className="w-4 h-4 text-mobility-600" />
                <span>Operations Moderation HQ</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-commuter-800 hover:bg-commuter-100"
              >
                <User className="w-4 h-4 text-mobility-600" />
                <span>Account & Vehicle Settings</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
