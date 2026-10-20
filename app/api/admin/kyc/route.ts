import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // TC-M6-02: Enforce admin clearance
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Administrator authorization required.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { driverId, action, reason } = body;

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'driverId is required' } },
        { status: 400 }
      );
    }

    if (action !== 'verified' && action !== 'rejected' && action !== 'pending' && action !== 'reset') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: "action must be 'verified', 'rejected', or 'pending'" } },
        { status: 400 }
      );
    }

    // TC-M6-08: Rejection requires reason
    if (action === 'rejected' && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Rejection reason is required.' } },
        { status: 400 }
      );
    }

    // TC-M6-07, TC-M6-09: Process review and enforce policy against duplicate transitions
    const updatedDriver = await rideRepository.reviewDriverKyc(driverId, action, reason);

    return NextResponse.json({
      success: true,
      data: updatedDriver,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'KYC_REVIEW_ERROR', message: error.message } },
      { status: 400 }
    );
  }
}
