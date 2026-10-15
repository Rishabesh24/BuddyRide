import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ride = await rideRepository.getRideById(id);

    if (!ride) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ride not found' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ride,
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const driverId = 'u-alex-mercer'; // Authenticated driver

    const success = await rideRepository.cancelRide(id, driverId);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ride not found or unauthorized' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Ride successfully cancelled' },
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
