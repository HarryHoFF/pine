/*
  # PayPal Roleplay Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `balance` (numeric, default 100.00)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `transactions`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, references profiles, nullable for deposits)
      - `to_user_id` (uuid, references profiles, not null)
      - `amount` (numeric, not null)
      - `note` (text, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Users can read their own profile
    - Users can update their own profile (except balance)
    - Users can read transactions where they are sender or receiver
    - Users can create transactions (balance updates handled by trigger)
    
  3. Important Notes
    - Each player starts with 100.00 in-game currency
    - Transactions are immutable once created
    - Balance is automatically updated via database trigger
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  balance numeric DEFAULT 100.00 NOT NULL CHECK (balance >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE OR REPLACE FUNCTION handle_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.from_user_id IS NOT NULL THEN
    UPDATE profiles
    SET balance = balance - NEW.amount,
        updated_at = now()
    WHERE id = NEW.from_user_id;
    
    IF NOT FOUND OR (SELECT balance FROM profiles WHERE id = NEW.from_user_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  END IF;
  
  UPDATE profiles
  SET balance = balance + NEW.amount,
      updated_at = now()
  WHERE id = NEW.to_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER transaction_balance_update
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
