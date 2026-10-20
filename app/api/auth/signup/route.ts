import { NextRequest, NextResponse } from 'next/server';
import { registerAccount } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password, role } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Name, email, and password are required.' } },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || '').trim().replace(/\s+/g, '').replace(/^\+91/, '');
    if (!phone || cleanPhone.length !== 10 || !/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: { message: 'Phone number must be exactly 10 characters.' } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must be at least 6 characters.' } },
        { status: 400 }
      );
    }

    const assignedRole = role === 'admin' ? 'admin' : role === 'driver' ? 'driver' : 'passenger';

    let supabaseUserId: string | undefined;

    // 1. If Supabase is configured with valid credentials, attempt cloud registration
    const { isSupabaseConfigured, supabase, supabaseAdmin } = await import('@/lib/supabase/client');
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone_number: phone || '',
              role: assignedRole,
            },
          },
        });

        if (authError) {
          // If Supabase returns an error (e.g. user already registered), surface it
          return NextResponse.json(
            { success: false, error: { message: authError.message } },
            { status: 400 }
          );
        }

        if (authData?.user?.id) {
          supabaseUserId = authData.user.id;
        }
      } catch (sbErr: any) {
        // Fall back gracefully to local account registration
        console.warn('Supabase auth signup warning, falling back to local registration:', sbErr.message);
      }
    }

    // 2. Register account in repository / session store
    const registration = registerAccount({
      id: supabaseUserId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone || '',
      password,
      role: assignedRole,
    });

    if (!registration.success || !registration.session) {
      return NextResponse.json(
        { success: false, error: { message: registration.message || 'Failed to create account.' } },
        { status: 400 }
      );
    }

    // If newly created account is a driver, provision vehicle in Supabase if configured
    if (assignedRole === 'driver' && isSupabaseConfigured && supabaseAdmin && supabaseUserId) {
      try {
        const rto = Math.floor(10 + Math.random() * 80);
        const chars = ['AB', 'BX', 'CM', 'DL', 'EK'][Math.floor(Math.random() * 5)];
        const num = Math.floor(1000 + Math.random() * 9000);
        await supabaseAdmin.from('vehicles').insert({
          driver_id: supabaseUserId,
          type: 'sedan',
          make: 'Maruti Suzuki',
          model: 'Swift Dzire Tour (AC)',
          year: 2024,
          license_plate: `TN ${rto} ${chars} ${num}`,
          color: 'Pearl Arctic White',
          capacity: 4,
          is_active: true,
        });
      } catch (vehErr: any) {
        console.warn('Supabase vehicle auto-provisioning notice:', vehErr.message);
      }
    }

    // Sync to repository
    const { rideRepository } = await import('@/lib/db/repository');
    await rideRepository.addUser(registration.session.user);

    const response = NextResponse.json({
      success: true,
      data: {
        user: registration.session.user,
        token: registration.session.token,
      },
    });

    // Set authentication session cookie
    response.cookies.set('routeshare_session', registration.session.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to register account' } },
      { status: 500 }
    );
  }
}
