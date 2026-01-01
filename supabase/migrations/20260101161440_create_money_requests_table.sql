/*
  # Create money requests table

  1. New Tables
    - `money_requests`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, references profiles) - User requesting money
      - `to_user_id` (uuid, references profiles) - User being asked for money
      - `amount` (decimal) - Amount requested
      - `note` (text, optional) - Message with the request
      - `status` (text) - Request status: pending, paid, declined
      - `created_at` (timestamptz) - When request was created
      - `updated_at` (timestamptz) - When request was last updated

  2. Security
    - Enable RLS on `money_requests` table
    - Add policies for users to:
      - View requests they sent or received
      - Create new requests
      - Update status of requests they received
*/

CREATE TABLE IF NOT EXISTS money_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE money_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON money_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create requests"
  ON money_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipients can update request status"
  ON money_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

CREATE INDEX IF NOT EXISTS idx_money_requests_from_user ON money_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_money_requests_to_user ON money_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_money_requests_status ON money_requests(status);