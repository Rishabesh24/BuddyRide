import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { SearchQuery } from '@/features/types';
import { resolveTamilNaduCoordinates } from '@/features/locations/geocoder';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const originText = searchParams.get('origin') || '';
    const destText = searchParams.get('destination') || '';

    let originLat = searchParams.get('originLat') ? parseFloat(searchParams.get('originLat')!) : NaN;
    let originLng = searchParams.get('originLng') ? parseFloat(searchParams.get('originLng')!) : NaN;
    let destLat = searchParams.get('destLat') ? parseFloat(searchParams.get('destLat')!) : NaN;
    let destLng = searchParams.get('destLng') ? parseFloat(searchParams.get('destLng')!) : NaN;

    // Intelligent geocoding across all 38 districts of Tamil Nadu
    if (isNaN(originLat) || isNaN(originLng)) {
      if (originText) {
        const resolved = await resolveTamilNaduCoordinates(originText);
        originLat = resolved.latitude;
        originLng = resolved.longitude;
      } else {
        originLat = 13.0827; // Default Chennai Central
        originLng = 80.2754;
      }
    }

    if (isNaN(destLat) || isNaN(destLng)) {
      if (destText) {
        const resolved = await resolveTamilNaduCoordinates(destText);
        destLat = resolved.latitude;
        destLng = resolved.longitude;
      } else {
        destLat = 12.8465; // Default OMR Siruseri
        destLng = 80.2263;
      }
    }

    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const seats = parseInt(searchParams.get('seats') || '1', 10);
    const maxDetourKm = searchParams.get('maxDetourKm')
      ? parseFloat(searchParams.get('maxDetourKm')!)
      : undefined;

    // Coordinate boundaries check: latitude [-90, 90], longitude [-180, 180]
    if (
      originLat < -90 ||
      originLat > 90 ||
      originLng < -180 ||
      originLng > 180 ||
      destLat < -90 ||
      destLat > 90 ||
      destLng < -180 ||
      destLng > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_COORDINATES',
            message: 'Coordinates out of bounds. Latitude must be between -90 and 90, and longitude between -180 and 180.',
          },
        },
        { status: 400 }
      );
    }

    // Origin equals destination check
    if (
      (originLat === destLat && originLng === destLng) ||
      (originText && destText && originText.trim().toLowerCase() === destText.trim().toLowerCase())
    ) {
      return NextResponse.json({
        success: true,
        data: {
          totalMatches: 0,
          results: [],
          message: 'Origin and destination cannot be identical.',
        },
      });
    }

    // Seat count boundary check (valid range 1 to 6)
    if (isNaN(seats) || seats <= 0 || seats > 6) {
      return NextResponse.json({
        success: true,
        data: {
          totalMatches: 0,
          results: [],
          message: 'Requested seat count must be between 1 and 6.',
        },
      });
    }

    const query: SearchQuery = {
      originLat,
      originLng,
      originAddress: originText,
      destLat,
      destLng,
      destAddress: destText,
      date,
      seats,
      maxDetourKm,
    };

    const results = await rideRepository.searchRides(query);

    return NextResponse.json({
      success: true,
      data: {
        totalMatches: results.length,
        results,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error.message || 'Failed to search rides',
        },
      },
      { status: 500 }
    );
  }
}
