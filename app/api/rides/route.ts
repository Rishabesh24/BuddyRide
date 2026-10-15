import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { SEED_USERS, SEED_VEHICLES } from '@/lib/fixtures/rides';

export async function GET() {
  try {
    // Return sample scheduled rides
    const results = await rideRepository.searchRides({
      originLat: 37.7749,
      originLng: -122.4194,
      destLat: 37.3382,
      destLng: -121.8863,
      date: new Date().toISOString().split('T')[0],
      seats: 1,
    });

    return NextResponse.json({
      success: true,
      data: results.map((m) => m.ride),
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

    // Validate essential fields
    if (!body.origin || !body.destination || !body.departureTime || !body.totalSeats) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Origin, Destination, Departure Time, and Seats are required.',
          },
        },
        { status: 400 }
      );
    }

    const driver = SEED_USERS[0]; // Active driver session
    const vehicle = SEED_VEHICLES[0];

    const newRide = await rideRepository.createRide({
      driverId: driver.id,
      driver,
      vehicleId: vehicle.id,
      vehicle,
      origin: body.origin,
      destination: body.destination,
      waypoints: body.waypoints || [],
      departureTime: body.departureTime,
      totalSeats: Number(body.totalSeats),
      availableSeats: Number(body.totalSeats),
      basePricePerKm: Number(body.basePricePerKm || 0.18),
      totalDistanceKm: Number(body.totalDistanceKm || 65.0),
      estimatedDurationMinutes: Number(body.estimatedDurationMinutes || 55),
      maxDetourKm: Number(body.maxDetourKm || 12.0),
      status: 'scheduled',
      notes: body.notes || '',
    });

    return NextResponse.json(
      {
        success: true,
        data: newRide,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PUBLISH_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
