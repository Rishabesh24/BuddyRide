import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, expectedRole } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Email/phone and password are required' } },
        { status: 400 }
      );
    }

    const verification = verifyCredentials(identifier, password, expectedRole);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: { message: verification.message } },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: verification.session,
    });

    // Set secure auth cookie
    response.cookies.set('routeshare_session', verification.session?.token || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Authentication failed' } },
      { status: 500 }
    );
  }
}
