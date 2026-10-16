// Central Authentication & RBAC Verification for RouteShare
import { Profile } from '@/features/types';
import { SEED_USERS } from './fixtures/rides';

export interface AuthSession {
  user: Profile;
  token: string;
  expiresAt: string;
}

// Authorized demo accounts with verified credentials
export const DEMO_CREDENTIALS = [
  {
    role: 'passenger' as const,
    email: 'rider@routeshare.in',
    phone: '+91 98409 88123',
    password: 'Password123!',
    profile: SEED_USERS[6], // Anand Subramanian
    name: 'Anand Subramanian',
    label: 'Rider / Commuter',
    description: 'Books Auto, Bike Taxi, Mini, and OMR Corridor rides',
  },
  {
    role: 'driver' as const,
    email: 'driver@routeshare.in',
    phone: '+91 98401 23456',
    password: 'Password123!',
    profile: SEED_USERS[0], // Karthik Raja (Dzire Tour TN 10 BX 9014)
    name: 'Karthik Raja',
    label: 'Driver Partner',
    description: 'Accepts rides, goes online/offline, enters passenger OTPs',
  },
  {
    role: 'admin' as const,
    email: 'admin@routeshare.in',
    phone: '+91 94444 00000',
    password: 'AdminSecure2026!',
    profile: SEED_USERS[7], // Chennai Operations Admin
    name: 'Chennai Operations Admin',
    label: 'Operations & Safety Lead',
    description: 'Verifies driver KYC, inspects safety disputes, monitors revenue',
  },
];

/**
 * Validates credentials against authorized account database
 */
export function verifyCredentials(
  identifier: string,
  secret: string,
  expectedRole?: 'passenger' | 'driver' | 'admin'
): { success: boolean; session?: AuthSession; message?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = secret.trim();

  const account = DEMO_CREDENTIALS.find(
    (acc) =>
      (acc.email.toLowerCase() === cleanId || acc.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) &&
      acc.password === cleanPass
  );

  if (!account) {
    return {
      success: false,
      message: 'Invalid credentials. Please verify your email/phone and password.',
    };
  }

  // Check role authorization if role-specific portal
  if (expectedRole && account.role !== expectedRole) {
    return {
      success: false,
      message: `Unauthorized role. This portal requires ${expectedRole.toUpperCase()} credentials. Your account is registered as ${account.role.toUpperCase()}.`,
    };
  }

  const session: AuthSession = {
    user: account.profile,
    token: `jwt-${account.role}-${Date.now().toString(36)}`,
    expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
  };

  return {
    success: true,
    session,
  };
}
