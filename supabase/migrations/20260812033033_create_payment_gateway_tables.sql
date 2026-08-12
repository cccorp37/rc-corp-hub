/*
# Create payment gateway tables

## Purpose
The admin panel lets the administrator register multiple payment gateways
(e.g. Orange Money, Mobile Money, etc.) and choose which one is active.
The edge function `initiate-payment` reads the active gateway server-side
(using the service-role key, which bypasses RLS) and redirects the user to
the gateway's checkout URL. The gateway identity is never exposed to the
frontend, so these tables must be admin-only.

## 1. New Tables

### payment_gateways
- `id` (uuid, primary key)
- `name` (text, not null) — human-readable gateway name (e.g. "Orange Money")
- `code` (text, not null) — short machine code (e.g. "orange_money")
- `config` (jsonb, default '{}') — gateway-specific config, currently stores `checkout_url`
- `is_enabled` (boolean, default true) — whether the gateway can be selected
- `created_at` (timestamptz, default now())

### payment_settings
- `id` (uuid, primary key)
- `singleton` (boolean, default true, unique) — ensures only one settings row exists
- `active_gateway_id` (uuid, nullable, foreign key → payment_gateways.id ON DELETE SET NULL)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## 2. Security
- Enable RLS on both tables.
- Only admins (via has_role check) can SELECT, INSERT, UPDATE, DELETE.
- The edge function reads these tables with the service-role key, which
  bypasses RLS, so the anon/authenticated frontend never needs direct access.

## 3. Important Notes
- The `payment_settings` table uses a `singleton` boolean with a unique
  constraint to guarantee at most one row. The admin page updates this
  single row to switch the active gateway.
- `active_gateway_id` is nullable so the admin can disable payments by
  clearing it (ON DELETE SET NULL if the referenced gateway is removed).
*/

CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view payment_gateways" ON payment_gateways;
CREATE POLICY "Admins can view payment_gateways"
  ON payment_gateways FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert payment_gateways" ON payment_gateways;
CREATE POLICY "Admins can insert payment_gateways"
  ON payment_gateways FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update payment_gateways" ON payment_gateways;
CREATE POLICY "Admins can update payment_gateways"
  ON payment_gateways FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete payment_gateways" ON payment_gateways;
CREATE POLICY "Admins can delete payment_gateways"
  ON payment_gateways FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true,
  active_gateway_id uuid REFERENCES payment_gateways(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Ensure only one settings row can exist
CREATE UNIQUE INDEX IF NOT EXISTS payment_settings_singleton_idx
  ON payment_settings (singleton) WHERE singleton = true;

DROP POLICY IF EXISTS "Admins can view payment_settings" ON payment_settings;
CREATE POLICY "Admins can view payment_settings"
  ON payment_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert payment_settings" ON payment_settings;
CREATE POLICY "Admins can insert payment_settings"
  ON payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update payment_settings" ON payment_settings;
CREATE POLICY "Admins can update payment_settings"
  ON payment_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed the single settings row so the admin can immediately start updating it
INSERT INTO payment_settings (singleton, active_gateway_id)
SELECT true, NULL
WHERE NOT EXISTS (SELECT 1 FROM payment_settings WHERE singleton = true);
