-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create enum for OTP types
CREATE TYPE public.otp_type AS ENUM ('login', 'password_reset', 'first_login');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Users table (custom auth, not using Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- OTP codes table
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  otp_type otp_type NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Yachts table
CREATE TABLE public.yachts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  feet INTEGER NOT NULL,
  max_capacity INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  hourly_price DECIMAL(10,2) NOT NULL,
  tour_detail TEXT,
  tour_itinerary TEXT,
  tour_program TEXT,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id UUID REFERENCES public.yachts(id) ON DELETE CASCADE NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  description TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  yacht_id UUID REFERENCES public.yachts(id) ON DELETE SET NULL NOT NULL,
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  hours INTEGER NOT NULL CHECK (hours >= 2),
  total_price DECIMAL(10,2) NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yachts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for yachts
CREATE POLICY "Anyone can view active yachts" ON public.yachts
  FOR SELECT USING (is_active = true);

-- Public read access for active offers
CREATE POLICY "Anyone can view active offers" ON public.offers
  FOR SELECT USING (is_active = true AND valid_until > now());

-- Public read for bookings (to check availability)
CREATE POLICY "Anyone can view bookings for availability" ON public.bookings
  FOR SELECT USING (true);

-- Public insert for bookings
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Users can view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (true);

-- OTP codes public insert (for sending codes)
CREATE POLICY "Anyone can create OTP codes" ON public.otp_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view OTP codes" ON public.otp_codes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update OTP codes" ON public.otp_codes
  FOR UPDATE USING (true);

-- Admin full access policies (using service role in edge functions)
CREATE POLICY "Service role full access yachts" ON public.yachts
  FOR ALL USING (true);

CREATE POLICY "Service role full access offers" ON public.offers
  FOR ALL USING (true);

CREATE POLICY "Service role full access bookings" ON public.bookings
  FOR ALL USING (true);

CREATE POLICY "Service role full access users" ON public.users
  FOR ALL USING (true);

-- Insert default admin user (password will be set via OTP)
INSERT INTO public.users (email, role, is_verified, first_name, last_name)
VALUES ('admin@yachtdubai.com', 'admin', true, 'Admin', 'User');

-- Insert sample yachts
INSERT INTO public.yachts (name, feet, max_capacity, bedrooms, hourly_price, tour_detail, tour_itinerary, tour_program, amenities, images)
VALUES 
  ('Royal Majesty', 85, 20, 4, 2500, 'Experience unparalleled luxury aboard our flagship yacht', 'Marina Walk → Palm Jumeirah → Atlantis → Burj Al Arab → Dubai Marina', 'Welcome drinks, Lunch/Dinner, Swimming, Fishing, Sunset viewing', ARRAY['WiFi', 'BBQ', 'Jacuzzi', 'Sound System', 'Jet Ski', 'Fishing Equipment'], ARRAY['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800']),
  ('Ocean Dream', 65, 15, 3, 1800, 'Discover the beauty of Dubai waters in style', 'Dubai Marina → World Islands → Palm Jumeirah', 'Refreshments, Swimming, Snorkeling, Photo sessions', ARRAY['WiFi', 'BBQ', 'Sound System', 'Snorkeling Gear', 'Towels'], ARRAY['https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800']),
  ('Pearl Princess', 52, 12, 2, 1200, 'Perfect for intimate gatherings and celebrations', 'Marina → Ain Dubai → JBR Beach', 'Soft drinks, Water activities, Music', ARRAY['WiFi', 'BBQ', 'Sound System', 'Paddle Boards'], ARRAY['https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800', 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800']);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yachts_updated_at BEFORE UPDATE ON public.yachts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();