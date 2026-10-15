import { NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';

export async function GET() {
  try {
    const stats = await rideRepository.getAdminStats();
    return NextResponse.json({
      success: true,
      data: stats,
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
