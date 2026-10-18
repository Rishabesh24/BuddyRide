import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { SEED_USERS, SEED_VEHICLES } from '@/lib/fixtures/rides';
import { getRegisteredAccountById } from '@/lib/auth';
import { Vehicle } from '@/features/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    // 1. If filtering by specific driver
    if (driverId) {
      const driverRides = await rideRepository.getRidesByDriver(driverId);
      return NextResponse.json({
        success: true,
        data: driverRides,
      });
    }

    // 2. If search query coordinates are provided
    const originLat = searchParams.get('originLat');
    const destLat = searchParams.get('destLat');
    if (originLat && destLat) {
      const results = await rideRepository.searchRides({
        originLat: parseFloat(originLat),
        originLng: parseFloat(searchParams.get('originLng') || '80.2707'),
        destLat: parseFloat(destLat),
        destLng: parseFloat(searchParams.get('destLng') || '76.9558'),
        date: searchParams.get('date') || new Date().toISOString().split('T')[0],
        seats: parseInt(searchParams.get('seats') || '1', 10),
      });

      return NextResponse.json({
        success: true,
        data: results.map((m) => m.ride),
      });
    }

    // 3. Return all published rides across the transit network
    const allRides = await rideRepository.getAllRides();
    return NextResponse.json({
      success: true,
      data: allRides,
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

    // Resolve driver dynamically
    const driverId = body.driverId || SEED_USERS[0].id;
    let driver = await rideRepository.getUserById(driverId);
    if (!driver) {
      const reg = getRegisteredAccountById(driverId);
      if (reg) {
        driver = reg.profile;
        await rideRepository.addUser(driver);
      } else {
        driver = SEED_USERS.find((u) => u.id === driverId) || SEED_USERS[0];
      }
    }

    // Resolve vehicle dynamically for this driver
    let vehicle: Vehicle | undefined;
    const driverVehicles = await rideRepository.getVehiclesForDriver(driver.id);
    if (body.vehicleId) {
      vehicle = driverVehicles.find((v) => v.id === body.vehicleId) || driverVehicles[0];
    } else {
      vehicle = driverVehicles[0] || SEED_VEHICLES[0];
    }

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
      basePricePerKm: Number(body.basePricePerKm || 18.0),
      totalDistanceKm: Number(body.totalDistanceKm || 65.0),
      estimatedDurationMinutes: Number(body.estimatedDurationMinutes || 55),
      maxDetourKm: Number(body.maxDetourKm || 4.0),
      status: 'scheduled',
      notes: body.notes || '',
    });

    // Sync ride to Supabase PostgreSQL if cloud credentials active and user has Supabase UUID
    const { isSupabaseConfigured, supabaseAdmin } = await import('@/lib/supabase/client');
    if (isSupabaseConfigured && supabaseAdmin && driver.id.length === 36) {
      try {
        const { data: vRow } = await supabaseAdmin
          .from('vehicles')
          .select('id')
          .eq('driver_id', driver.id)
          .limit(1)
          .maybeSingle();

        if (vRow?.id) {
          await supabaseAdmin.from('rides').insert({
            driver_id: driver.id,
            vehicle_id: vRow.id,
            origin_address: body.origin.address,
            origin_city: body.origin.city,
            origin_lat: body.origin.latitude,
            origin_lng: body.origin.longitude,
            dest_address: body.destination.address,
            dest_city: body.destination.city,
            dest_lat: body.destination.latitude,
            dest_lng: body.destination.longitude,
            departure_time: body.departureTime,
            total_seats: Number(body.totalSeats),
            available_seats: Number(body.totalSeats),
            base_price_per_km: Number(body.basePricePerKm || 18.0),
            total_distance_km: Number(body.totalDistanceKm || 65.0),
            estimated_duration_min: Number(body.estimatedDurationMinutes || 55),
            max_detour_km: Number(body.maxDetourKm || 4.0),
            status: 'scheduled',
            notes: body.notes || '',
          });
        }
      } catch (sbRideErr: any) {
        console.warn('Supabase ride insert notice:', sbRideErr.message);
      }
    }

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
