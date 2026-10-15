import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let reason = 'Cancelled by passenger';
    try {
      const body = await request.json();
      if (body.reason) reason = body.reason;
    } catch {}

    const updated = await rideRepository.updateBookingStatus(id, 'cancelled', reason);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CANCEL_ERROR', message: error.message },
      },
      { status: 400 }
    );
  }
}
