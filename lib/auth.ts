// Central Authentication & RBAC Verification for RouteShare
import { Profile } from '@/features/types';
import { SEED_USERS } from './fixtures/rides';

export interface AuthSession {
  user: Profile;
  token: string;
  expiresAt: string;
}

export interface RegisteredAccount {
  id: string;
  email: string;
  phone: string;
  password: string;
  role: 'passenger' | 'driver' | 'admin';
  profile: Profile;
}

// In-memory store for newly created accounts (persists across Next.js route chunks)
const globalForAuth = globalThis as unknown as {
  routeshare_registered_accounts?: RegisteredAccount[];
};

export const REGISTERED_ACCOUNTS: RegisteredAccount[] =
  globalForAuth.routeshare_registered_accounts ?? [];

if (!globalForAuth.routeshare_registered_accounts) {
  globalForAuth.routeshare_registered_accounts = REGISTERED_ACCOUNTS;
}

// Authorized demo accounts with verified credentials
export const DEMO_CREDENTIALS = [
  {
    role: 'passenger' as const,
    email: 'rider@routeshare.in',
    phone: '+91 98409 88123',
    password: 'Password123!',
    profile: SEED_USERS[10] || SEED_USERS[6], // Anand Subramanian
    name: 'Anand Subramanian',
    label: 'Rider / Commuter',
    description: 'Books Auto, Bike Taxi, Mini, and OMR Corridor rides',
  },
  {
    role: 'driver' as const,
    email: 'driver@routeshare.in',
    phone: '+91 98401 23456',
    password: 'Password123!',
    profile: SEED_USERS[0], // Karthik Raja
    name: 'Karthik Raja',
    label: 'Driver Partner',
    description: 'Accepts rides, goes online/offline, enters passenger OTPs',
  },
  {
    role: 'admin' as const,
    email: 'admin@routeshare.in',
    phone: '+91 94444 00000',
    password: 'AdminSecure2026!',
    profile: SEED_USERS[11] || SEED_USERS[7], // Operations Admin
    name: 'Chennai Operations Admin',
    label: 'Operations & Safety Lead',
    description: 'Verifies driver KYC, inspects safety disputes, monitors revenue',
  },
];

/**
 * Registers a new user account with their own custom profile and credentials
 */
export function registerAccount(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'passenger' | 'driver' | 'admin';
  id?: string;
}): { success: boolean; session?: AuthSession; message?: string } {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.trim().replace(/\s+/g, '').replace(/^\+91/, '');
  const cleanName = data.fullName.trim();
  const cleanPass = data.password.trim();

  if (!cleanEmail || !cleanPass || !cleanName) {
    return { success: false, message: 'Name, email, and password are required.' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'A valid email address is required.' };
  }

  if (!data.phone || cleanPhone.length !== 10 || !/^\d{10}$/.test(cleanPhone)) {
    return { success: false, message: 'Phone number must be exactly 10 characters.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  // Check for duplicate in registered accounts
  const existingRegistered = REGISTERED_ACCOUNTS.find(
    (a) => a.email === cleanEmail || (cleanPhone && a.phone.replace(/\s+/g, '') === cleanPhone)
  );

  if (existingRegistered) {
    return {
      success: false,
      message: 'An account with this email or mobile number already exists. Please sign in.',
    };
  }

  // Use provided ID or generate unique User ID
  const userId = data.id || `u-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const newProfile: Profile = {
    id: userId,
    email: cleanEmail,
    fullName: cleanName,
    phoneNumber: data.phone.trim() || undefined,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    bio:
      data.role === 'driver'
        ? `Verified Driver Partner operating across Tamil Nadu transit corridors.`
        : `Verified Commuter on RouteShare Tamil Nadu.`,
    role: data.role,
    ratingAverage: 5.0,
    ratingCount: 0,
    isOnline: true,
    drivingLicenseNo:
      data.role === 'driver'
        ? `TN-${Math.floor(10 + Math.random() * 89)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
        : undefined,
    isKycVerified: true,
    todayEarnings: 0,
    createdAt: new Date().toISOString(),
  };

  const registeredAccount: RegisteredAccount = {
    id: userId,
    email: cleanEmail,
    phone: data.phone.trim(),
    password: cleanPass,
    role: data.role,
    profile: newProfile,
  };

  REGISTERED_ACCOUNTS.unshift(registeredAccount);

  const session: AuthSession = {
    user: newProfile,
    token: `jwt-${data.role}-${Date.now().toString(36)}`,
    expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
  };

  return {
    success: true,
    session,
  };
}

/**
 * Validates credentials against registered user accounts and authorized demo credentials
 */
export function verifyCredentials(
  identifier: string,
  secret: string,
  expectedRole?: 'passenger' | 'driver' | 'admin'
): { success: boolean; session?: AuthSession; message?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = secret.trim();
  const digitsOnly = cleanId.replace(/\D/g, '');

  const matchesPhone = (accountPhone?: string) => {
    if (!accountPhone || !digitsOnly) return false;
    const accDigits = accountPhone.replace(/\D/g, '');
    return accDigits === digitsOnly || (accDigits.length === 12 && accDigits.endsWith(digitsOnly)) || (digitsOnly.length === 12 && digitsOnly.endsWith(accDigits));
  };

  // 1. Check newly registered accounts first
  const regAccount = REGISTERED_ACCOUNTS.find(
    (acc) =>
      (acc.email.toLowerCase() === cleanId || matchesPhone(acc.phone)) &&
      acc.password === cleanPass
  );

  const suspendedIds: Set<string> = (globalThis as any).__routeshare_suspended_user_ids || new Set();

  if (regAccount) {
    if (regAccount.profile.isSuspended || suspendedIds.has(regAccount.id)) {
      return {
        success: false,
        message: 'Account is suspended. Please contact safety support.',
      };
    }

    if (expectedRole && regAccount.role !== expectedRole) {
      return {
        success: false,
        message: `Unauthorized role. This portal requires ${expectedRole.toUpperCase()} credentials. Your account is registered as ${regAccount.role.toUpperCase()}.`,
      };
    }

    return {
      success: true,
      session: {
        user: regAccount.profile,
        token: `jwt-${regAccount.role}-${Date.now().toString(36)}`,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
      },
    };
  }

  // 2. Check demo evaluation credentials
  const demoAccount = DEMO_CREDENTIALS.find(
    (acc) =>
      (acc.email.toLowerCase() === cleanId || matchesPhone(acc.phone)) &&
      acc.password === cleanPass
  );

  if (demoAccount) {
    if (demoAccount.profile.isSuspended || suspendedIds.has(demoAccount.profile.id)) {
      return {
        success: false,
        message: 'Account is suspended. Please contact safety support.',
      };
    }

    if (expectedRole && demoAccount.role !== expectedRole) {
      return {
        success: false,
        message: `Unauthorized role. This portal requires ${expectedRole.toUpperCase()} credentials. Your account is registered as ${demoAccount.role.toUpperCase()}.`,
      };
    }

    return {
      success: true,
      session: {
        user: demoAccount.profile,
        token: `jwt-${demoAccount.role}-${Date.now().toString(36)}`,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
      },
    };
  }

  return {
    success: false,
    message: 'Invalid email/phone or password. Please check your credentials or register a new account.',
  };
}

export function getRegisteredAccountById(id: string): RegisteredAccount | undefined {
  return REGISTERED_ACCOUNTS.find((a) => a.id === id);
}

export function getAllRegisteredAccounts(): RegisteredAccount[] {
  return [...REGISTERED_ACCOUNTS];
}
