-- Schema aligned with app code (table name `booking`, not `bookings`)

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  overview TEXT NOT NULL,
  image TEXT NOT NULL,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('online', 'offline', 'hybrid')),
  audience TEXT NOT NULL,
  agenda TEXT[] NOT NULL,
  organizer TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date_mode ON events(date, mode);
CREATE INDEX IF NOT EXISTS idx_booking_event_id ON booking(event_id);
CREATE INDEX IF NOT EXISTS idx_booking_email ON booking(email);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on booking"
  ON booking FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on booking"
  ON booking FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);
