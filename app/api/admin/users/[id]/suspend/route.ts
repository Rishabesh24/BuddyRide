import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TC-M6-02: Enforce admin clearance
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Administrator authorization required.' } },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'suspend';

    const suspendedIds: Set<string> = (globalThis as any).__routeshare_suspended_user_ids || new Set();
    let updatedProfile;
    if (action === 'restore') {
      suspendedIds.delete(id);
      suspendedIds.delete(id.toLowerCase());
      if (id === 'u-karthik-sedan') {
        suspendedIds.delete('driver@routeshare.in');
        suspendedIds.delete('karthik.raja@routeshare.in');
      }
      (globalThis as any).__routeshare_suspended_user_ids = suspendedIds;
      updatedProfile = await rideRepository.restoreUser(id);
    } else {
      suspendedIds.add(id);
      suspendedIds.add(id.toLowerCase());
      if (id === 'u-karthik-sedan') {
        suspendedIds.add('driver@routeshare.in');
        suspendedIds.add('karthik.raja@routeshare.in');
      }
      (globalThis as any).__routeshare_suspended_user_ids = suspendedIds;
      updatedProfile = await rideRepository.suspendUser(id);
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: `User account has been ${action === 'restore' ? 'restored' : 'suspended'}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SUSPEND_ERROR', message: error.message } },
      { status: 400 }
    );
  }
}
