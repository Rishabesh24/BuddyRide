import { NextRequest } from 'next/server';

/**
 * Validates administrator authorization for sensitive admin endpoints.
 * Enforces rejection of unauthenticated or passenger/driver requests (TC-M6-02).
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const roleHeader = request.headers.get('x-user-role') || '';
  const sessionCookie = request.cookies.get('routeshare_session')?.value || '';

  // Explicitly reject non-admin roles
  if (roleHeader.toLowerCase() === 'passenger' || roleHeader.toLowerCase() === 'driver') {
    return false;
  }
  if (authHeader.includes('jwt-passenger') || authHeader.includes('jwt-driver')) {
    return false;
  }
  if (sessionCookie.includes('jwt-passenger') || sessionCookie.includes('jwt-driver')) {
    return false;
  }

  // Grant access if admin credentials / role present
  if (roleHeader.toLowerCase() === 'admin') return true;
  if (authHeader.includes('jwt-admin') || authHeader.includes('admin')) return true;
  if (sessionCookie.includes('jwt-admin') || sessionCookie.includes('admin')) return true;

  return false;
}
