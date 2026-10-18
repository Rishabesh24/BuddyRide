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
