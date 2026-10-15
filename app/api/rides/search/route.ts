import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { SearchQuery } from '@/features/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const originLat = parseFloat(searchParams.get('originLat') || '37.7749');
    const originLng = parseFloat(searchParams.get('originLng') || '-122.4194');
    const destLat = parseFloat(searchParams.get('destLat') || '37.3382');
    const destLng = parseFloat(searchParams.get('destLng') || '-121.8863');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const seats = parseInt(searchParams.get('seats') || '1', 10);
    const maxDetourKm = searchParams.get('maxDetourKm')
      ? parseFloat(searchParams.get('maxDetourKm')!)
      : undefined;

    const query: SearchQuery = {
      originLat,
      originLng,
      destLat,
      destLng,
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
