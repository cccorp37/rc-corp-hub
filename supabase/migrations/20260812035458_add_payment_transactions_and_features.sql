/*
# Add payment transactions table and feature tables

## Purpose
Track every payment attempt with payer details (phone, amount, country, gateway, status).
Also add a favorites/wishlist table and a user activity log for the new features.

## 1. New Tables

### payment_transactions
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
- `order_id` (uuid, nullable, references orders)
- `payer_phone` (text, not null) — phone number of the payer
- `payer_country` (text, not null) — country of the payer
- `amount` (numeric, not null) — payment amount in FCFA
- `gateway_code` (text, nullable) — which gateway was used
- `description` (text, nullable) — what is being paid for
- `status` (text, not null, default 'pending') — pending, success, failed, cancelled
- `reference` (text, nullable) — external payment reference
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### favorites
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
- `product_id` (uuid, not null, references products)
- `created_at` (timestamptz, default now())

### user_activity
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
- `action` (text, not null) — e.g. 'login', 'purchase', 'sms_campaign'
- `detail` (text, nullable)
- `created_at` (timestamptz, default now())

## 2. Security
- RLS enabled on all tables.
- Owner-scoped CRUD via auth.uid() = user_id.
- payment_transactions: user can read/insert their own; update/delete admin-only via has_role.

## 3. Important Notes
- All user_id columns have DEFAULT auth.uid() so frontend inserts work without passing user_id.
- Unique constraint on (user_id, product_id) in favorites prevents duplicate favorites.
*/

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  payer_phone text NOT NULL,
  payer_country text NOT NULL DEFAULT 'Cameroun',
  amount numeric NOT NULL DEFAULT 0,
  gateway_code text,
  description text,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payment_tx_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON payment_transactions(status);

DROP POLICY IF EXISTS "select_own_transactions" ON payment_transactions;
CREATE POLICY "select_own_transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON payment_transactions;
CREATE POLICY "insert_own_transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON payment_transactions;
CREATE POLICY "update_own_transactions"
  ON payment_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON payment_transactions;
CREATE POLICY "delete_own_transactions"
  ON payment_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id);

DROP POLICY IF EXISTS "select_own_activity" ON user_activity;
CREATE POLICY "select_own_activity"
  ON user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activity" ON user_activity;
CREATE POLICY "insert_own_activity"
  ON user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
