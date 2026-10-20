import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const otp = body?.otp;

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 4 || !/^\d{4}$/.test(otp.trim())) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP_FORMAT', message: 'OTP must be exactly 4 numeric digits.' } },
        { status: 400 }
      );
    }

    const verification = await rideRepository.verifyStartOtp(id, otp);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: verification.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: verification.message },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'VERIFICATION_ERROR', message: error.message } },
      { status: 400 }
    );
  }
}
