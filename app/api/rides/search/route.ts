import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { SearchQuery, TAMIL_NADU_HUBS } from '@/features/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const originText = searchParams.get('origin') || '';
    const destText = searchParams.get('destination') || '';

    // Smart coordinate resolution from Tamil Nadu Hubs
    let resolvedOriginLat = 13.0827; // Chennai Central
    let resolvedOriginLng = 80.2754;
    let resolvedDestLat = 12.8465; // OMR Siruseri
    let resolvedDestLng = 80.2263;

    if (originText) {
      const match = TAMIL_NADU_HUBS.find((h) =>
        originText.toLowerCase().includes(h.city.toLowerCase()) ||
        h.name.toLowerCase().includes(originText.toLowerCase()) ||
        originText.toLowerCase().includes(h.name.toLowerCase().split(' ')[0])
      );
      if (match) {
        resolvedOriginLat = match.latitude;
        resolvedOriginLng = match.longitude;
      }
    }

    if (destText) {
      const match = TAMIL_NADU_HUBS.find((h) =>
        destText.toLowerCase().includes(h.city.toLowerCase()) ||
        h.name.toLowerCase().includes(destText.toLowerCase()) ||
        destText.toLowerCase().includes(h.name.toLowerCase().split(' ')[0])
      );
      if (match) {
        resolvedDestLat = match.latitude;
        resolvedDestLng = match.longitude;
      }
    }

    const originLat = parseFloat(searchParams.get('originLat') || resolvedOriginLat.toString());
    const originLng = parseFloat(searchParams.get('originLng') || resolvedOriginLng.toString());
    const destLat = parseFloat(searchParams.get('destLat') || resolvedDestLat.toString());
    const destLng = parseFloat(searchParams.get('destLng') || resolvedDestLng.toString());
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
