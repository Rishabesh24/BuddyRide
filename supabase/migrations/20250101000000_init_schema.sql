-- RouteShare PostgreSQL Schema & Migrations
-- Target: Supabase PostgreSQL 15+ with Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    rating_count INT NOT NULL DEFAULT 0,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    driving_license_no TEXT,
    is_kyc_verified BOOLEAN NOT NULL DEFAULT TRUE,
    today_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. VEHICLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'sedan' CHECK (type IN ('bike', 'auto', 'mini', 'sedan', 'suv', 'shuttle')),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    capacity INT NOT NULL CHECK (capacity BETWEEN 1 AND 8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. RIDES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    origin_address TEXT NOT NULL,
    origin_city TEXT NOT NULL,
    origin_lat NUMERIC(9, 6) NOT NULL,
    origin_lng NUMERIC(9, 6) NOT NULL,
    dest_address TEXT NOT NULL,
    dest_city TEXT NOT NULL,
    dest_lat NUMERIC(9, 6) NOT NULL,
    dest_lng NUMERIC(9, 6) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    total_seats INT NOT NULL CHECK (total_seats BETWEEN 1 AND 8),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    base_price_per_km NUMERIC(6, 2) NOT NULL CHECK (base_price_per_km > 0),
    total_distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_min INT NOT NULL,
    max_detour_km NUMERIC(5, 2) NOT NULL DEFAULT 15.0,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. RIDE WAYPOINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ride_waypoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    order_index INT NOT NULL,
    stop_type TEXT NOT NULL DEFAULT 'stopover' CHECK (stop_type IN ('pickup', 'dropoff', 'stopover')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seats_booked INT NOT NULL CHECK (seats_booked > 0),
    pickup_address TEXT NOT NULL,
    pickup_lat NUMERIC(9, 6) NOT NULL,
    pickup_lng NUMERIC(9, 6) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_lat NUMERIC(9, 6) NOT NULL,
    dropoff_lng NUMERIC(9, 6) NOT NULL,
    segment_distance_km NUMERIC(8, 2) NOT NULL,
    detour_distance_km NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    fare_amount NUMERIC(8, 2) NOT NULL,
    platform_fee NUMERIC(8, 2) NOT NULL,
    total_paid NUMERIC(8, 2) NOT NULL,
    start_otp VARCHAR(4),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'rejected', 'cancelled', 'completed')),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking_request', 'booking_confirmed', 'booking_rejected', 'booking_cancelled', 'trip_reminder', 'system')),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. REPORTS & AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'ride', 'review')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_rides_departure ON public.rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride ON public.bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON public.bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view verified info; user can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles: Viewable if active; managed by owner driver
CREATE POLICY "Vehicles viewable by everyone" ON public.vehicles FOR SELECT USING (is_active = true);
CREATE POLICY "Drivers manage own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = driver_id);

-- Rides: Publicly discoverable; driver manages own rides
CREATE POLICY "Rides viewable by everyone" ON public.rides FOR SELECT USING (true);
CREATE POLICY "Drivers can insert rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Drivers can update own rides" ON public.rides FOR UPDATE USING (auth.uid() = driver_id);

-- Bookings: Passenger and Ride Driver can view and update
CREATE POLICY "Bookings viewable by participant" ON public.bookings FOR SELECT 
USING (auth.uid() = passenger_id OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id));

CREATE POLICY "Passengers can insert bookings" ON public.bookings FOR INSERT 
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Participants can update booking state" ON public.bookings FOR UPDATE 
USING (auth.uid() = passenger_id OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id));

-- Notifications: User can only access own notifications
CREATE POLICY "Users see own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STORED PROCEDURES / CONCURRENCY FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION confirm_booking(p_booking_id UUID, p_driver_id UUID)
RETURNS JSON AS $$
DECLARE
    v_ride_id UUID;
    v_seats INT;
    v_avail INT;
BEGIN
    SELECT b.ride_id, b.seats_booked, r.available_seats
    INTO v_ride_id, v_seats, v_avail
    FROM public.bookings b
    JOIN public.rides r ON b.ride_id = r.id
    WHERE b.id = p_booking_id AND r.driver_id = p_driver_id
    FOR UPDATE OF r;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized or booking not found');
    END IF;

    IF v_avail < v_seats THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient available seats');
    END IF;

    UPDATE public.rides 
    SET available_seats = available_seats - v_seats, updated_at = NOW()
    WHERE id = v_ride_id;

    UPDATE public.bookings
    SET status = 'confirmed', updated_at = NOW()
    WHERE id = p_booking_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. AUTH TRIGGER TO AUTO-CREATE USER PROFILE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'passenger');
    v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone_number,
        avatar_url,
        role,
        driving_license_no,
        is_kyc_verified,
        today_earnings
    )
    VALUES (
        NEW.id,
        NEW.email,
        v_name,
        NEW.raw_user_meta_data->>'phone_number',
        'https://api.dicebear.com/7.x/initials/svg?seed=' || v_name,
        v_role,
        CASE WHEN v_role = 'driver' THEN 'TN-' || LPAD((FLOOR(RANDOM() * 88) + 10)::text, 2, '0') || '-2026-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::text, 6, '0') ELSE NULL END,
        TRUE,
        0.00
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
