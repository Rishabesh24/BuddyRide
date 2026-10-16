import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const completed = await rideRepository.completeBooking(id);

    return NextResponse.json({
      success: true,
      data: completed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'COMPLETE_ERROR', message: error.message } },
      { status: 400 }
    );
  }
}
