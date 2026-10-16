'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/context/role-context';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | 'any';
  portalName: string;
}

export function RoleGuard({ children, requiredRole = 'any', portalName }: RoleGuardProps) {
  const { isAuthenticated, role, user, logout } = useAuth();

  // 1. Not Authenticated Screen
  if (!isAuthenticated || !role) {
    const loginTarget = requiredRole === 'any' ? '/login' : `/login?role=${requiredRole}`;
    const roleLabel =
      requiredRole === 'admin'
        ? 'Operations Admin'
        : requiredRole === 'driver'
        ? 'Driver Partner'
        : requiredRole === 'passenger'
        ? 'Rider'
        : 'User';

    return (
      <div className="flex-1 bg-commuter-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-commuter-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Authentication Required
            </span>
            <h2 className="text-2xl font-black text-commuter-900 mt-2">
              Sign In to Access {portalName}
            </h2>
            <p className="text-xs text-commuter-600 mt-1 leading-relaxed">
              This area is protected. Please sign in with your verified credentials to enter.
            </p>
          </div>

          <div className="pt-3 border-t border-commuter-100 space-y-2">
            <Link href={loginTarget} className="block">
              <Button className="w-full font-bold bg-commuter-900 hover:bg-black text-white h-11 rounded-xl">
                <span>Sign In {requiredRole !== 'any' ? `as ${roleLabel}` : ''}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full text-xs h-10 rounded-xl">
                Return to Landing Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Wrong Role (403 Unauthorized)
  if (requiredRole !== 'any' && role !== requiredRole) {
    return (
      <div className="flex-1 bg-commuter-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-3xl shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              403 Unauthorized Access
            </span>
            <h2 className="text-2xl font-black text-commuter-900 mt-2">
              {requiredRole.toUpperCase()} Clearance Required
            </h2>
            <p className="text-xs text-commuter-600 mt-1 leading-relaxed">
              You are currently logged in as <strong>{user?.fullName}</strong> with role <strong>{role.toUpperCase()}</strong>.
              This account does not have authorization to view the <strong>{portalName}</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-commuter-50 text-[11px] text-commuter-600 text-left space-y-1">
            <div className="flex justify-between">
              <span>Current Account:</span>
              <strong className="text-commuter-900">{user?.email}</strong>
            </div>
            <div className="flex justify-between">
              <span>Current Role:</span>
              <strong className="text-rose-600">{role.toUpperCase()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Required Role:</span>
              <strong className="text-emerald-700">{requiredRole.toUpperCase()}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-commuter-100 space-y-2">
            <Link href={`/login?role=${requiredRole}`} className="block">
              <Button className="w-full font-bold bg-commuter-900 hover:bg-black text-white h-11 rounded-xl">
                <span>Switch / Sign in as {requiredRole}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <button
              onClick={logout}
              className="w-full py-2 text-xs font-bold text-commuter-500 hover:text-commuter-800"
            >
              Log Out of Current Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized -> Render protected page content
  return <>{children}</>;
}
