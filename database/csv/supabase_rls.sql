-- Run in Supabase SQL Editor if RLS blocks reads/writes with the anon key.
-- Server actions use the service_role key and bypass RLS.

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
