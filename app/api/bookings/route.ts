import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { SEED_USERS } from '@/lib/fixtures/rides';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'passenger';
    const userId = searchParams.get('userId') || (role === 'driver' ? 'u-alex-mercer' : 'u-demo-passenger');

    const bookings =
      role === 'driver'
        ? await rideRepository.getBookingsForDriver(userId)
        : await rideRepository.getBookingsForPassenger(userId);

    return NextResponse.json({
      success: true,
      data: bookings,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.rideId || !body.pickupLocation || !body.dropoffLocation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Missing booking parameters' },
        },
        { status: 400 }
      );
    }

    const passenger = SEED_USERS[4]; // Default passenger session

    const newBooking = await rideRepository.createBooking({
      rideId: body.rideId,
      passengerId: passenger.id,
      passenger,
      seatsBooked: Number(body.seatsBooked || 1),
      pickupLocation: body.pickupLocation,
      dropoffLocation: body.dropoffLocation,
      segmentDistanceKm: Number(body.segmentDistanceKm || 25),
      detourDistanceKm: Number(body.detourDistanceKm || 1.2),
      fareAmount: Number(body.fareAmount || 5.0),
      platformFee: Number(body.platformFee || 0.5),
      totalPaid: Number(body.totalPaid || 5.5),
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BOOKING_FAILED', message: error.message },
      },
      { status: 400 }
    );
  }
}
