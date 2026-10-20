import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: { message: 'driverId query parameter is required' } },
        { status: 400 }
      );
    }

    const vehicles = await rideRepository.getVehiclesForDriver(driverId);
    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to fetch vehicles' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, type, make, model, year, licensePlate, color, capacity } = body;

    if (!driverId || !type || !make || !model || !licensePlate || capacity === undefined || capacity === null || capacity === '') {
      return NextResponse.json(
        { success: false, error: { message: 'Type, make, model, registration (licensePlate), and capacity are required.' } },
        { status: 400 }
      );
    }

    const capNum = Number(capacity);
    if (isNaN(capNum) || capNum < 1 || capNum > 8) {
      return NextResponse.json(
        { success: false, error: { message: 'Vehicle capacity must be between 1 and 8 seats.' } },
        { status: 400 }
      );
    }

    const vehicle = await rideRepository.addVehicle({
      driverId,
      type: type || 'sedan',
      make,
      model,
      year: Number(year) || new Date().getFullYear(),
      licensePlate,
      color: color || 'White',
      capacity: Number(capacity) || 4,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to add vehicle' } },
      { status: 500 }
    );
  }
}
