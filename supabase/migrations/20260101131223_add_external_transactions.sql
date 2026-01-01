/*
  # External Transactions Table

  1. New Table
    - `external_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `merchant_name` (text, not null) - Name des Händlers/Empfängers
      - `amount` (numeric, not null) - Positiv für Einnahmen, negativ für Ausgaben
      - `currency` (text, not null, default 'EUR') - Währung (EUR, USD, DKK, etc.)
      - `transaction_type` (text, not null) - Art der Transaktion
      - `description` (text) - Optional zusätzliche Beschreibung
      - `created_at` (timestamptz, not null)

  2. Security
    - Enable RLS
    - Users can read their own external transactions
    - Users can create their own external transactions

  3. Important Notes
    - Diese Tabelle speichert Transaktionen mit externen Händlern/Dienstleistern
    - Negative Beträge = Ausgaben, Positive Beträge = Einnahmen/Rückzahlungen
    - Verschiedene Währungen werden unterstützt
*/

CREATE TABLE IF NOT EXISTS external_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  merchant_name text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  transaction_type text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE external_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own external transactions"
  ON external_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own external transactions"
  ON external_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_external_transactions_user_id ON external_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_external_transactions_created_at ON external_transactions(created_at DESC);