import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // TC-M6-02: Non-admin access to admin portal must be denied
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Administrator authorization required.' },
        },
        { status: 403 }
      );
    }

    const stats = await rideRepository.getAdminStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
