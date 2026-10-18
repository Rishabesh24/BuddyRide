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

    // 1. If Supabase is configured, attempt cloud authentication
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase/client');
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password,
        });

        if (!authError && authData?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileData) {
            const session = {
              user: {
                id: profileData.id,
                email: profileData.email,
                fullName: profileData.full_name,
                phoneNumber: profileData.phone_number,
                avatarUrl: profileData.avatar_url,
                role: profileData.role,
                drivingLicenseNo: profileData.driving_license_no,
                isKycVerified: profileData.is_kyc_verified,
                todayEarnings: Number(profileData.today_earnings || 0),
                createdAt: profileData.created_at,
              },
              token: authData.session?.access_token || `jwt-${profileData.role}-${Date.now().toString(36)}`,
              expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
            };

            const response = NextResponse.json({
              success: true,
              data: session,
            });

            response.cookies.set('routeshare_session', session.token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
            });

            return response;
          }
        }
      } catch (sbErr: any) {
        console.warn('Supabase auth fallback:', sbErr.message);
      }
    }

    // 2. Validate against local / demo credentials
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
