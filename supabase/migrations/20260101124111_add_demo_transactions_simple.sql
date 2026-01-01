/*
  # Add Demo Transactions (Simple Approach)
  
  1. Demo Transactions
    - Creates incoming transactions (deposits) with NULL sender
    - Uses realistic notes to simulate different people sending money
    - Provides activity data for testing the roleplay environment
  
  2. Important Notes
    - Transactions with from_user_id = NULL represent incoming deposits
    - Each transaction includes a note explaining the source
    - Amounts and timing are varied for realism
*/

DO $$
DECLARE
  ines_user_id uuid;
BEGIN
  SELECT id INTO ines_user_id FROM profiles WHERE email LIKE '%example.com' OR email LIKE '%beispiel%' LIMIT 1;
  
  IF ines_user_id IS NOT NULL THEN
    INSERT INTO transactions (from_user_id, to_user_id, amount, note, created_at)
    VALUES
      (NULL, ines_user_id, 25.50, 'Von Maria Schmidt - Kinokarten', now() - interval '2 hours'),
      (NULL, ines_user_id, 50.00, 'Von Lisa Weber - Geburtstagsgeschenk 🎉', now() - interval '3 days'),
      (NULL, ines_user_id, 12.50, 'Von Anna Fischer - Kaffee und Kuchen', now() - interval '1 week'),
      (NULL, ines_user_id, 8.50, 'Von Thomas Müller - Mittagessen', now() - interval '2 weeks'),
      (NULL, ines_user_id, 35.00, 'Von Max Bauer - Konzertticket', now() - interval '18 days'),
      (NULL, ines_user_id, 15.00, 'Von Sarah Klein - Buch zurück', now() - interval '25 days'),
      (NULL, ines_user_id, 20.00, 'Von Julia Braun - Benzingeld', now() - interval '1 month')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;