import { NextRequest, NextResponse } from 'next/server';
import { searchTamilNaduLocations, resolveTamilNaduCoordinates } from '@/features/locations/geocoder';
import { ALL_TAMIL_NADU_LOCATIONS } from '@/features/locations/tamil-nadu-locations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const resolve = searchParams.get('resolve') === 'true';

    // If query requests full coordinate resolution
    if (resolve && query) {
      const resolved = await resolveTamilNaduCoordinates(query);
      return NextResponse.json({
        success: true,
        data: resolved,
      });
    }

    // Default: autocomplete search
    const results = searchTamilNaduLocations(query, limit);

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        results,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOCATION_SEARCH_ERROR',
          message: error.message || 'Failed to search Tamil Nadu locations',
        },
      },
      { status: 500 }
    );
  }
}
