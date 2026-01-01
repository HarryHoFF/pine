/*
  # Add Demo Data for Testing
  
  1. Demo Users
    - Creates several demo user profiles for roleplay scenarios
    - Each demo user has a name and starting balance
  
  2. Demo Transactions
    - Creates sample transactions to show activity
    - Includes both received and sent transactions
    - Various amounts and notes for realistic testing
  
  3. Important Notes
    - These are demo accounts for the roleplay environment
    - Demo users have realistic German names
    - Transactions span different time periods
*/

DO $$
DECLARE
  demo_user_1 uuid := gen_random_uuid();
  demo_user_2 uuid := gen_random_uuid();
  demo_user_3 uuid := gen_random_uuid();
  demo_user_4 uuid := gen_random_uuid();
  demo_user_5 uuid := gen_random_uuid();
  ines_user_id uuid;
BEGIN
  SELECT id INTO ines_user_id FROM profiles WHERE email = 'ines@beispiel.de';
  
  IF ines_user_id IS NOT NULL THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES 
      (demo_user_1, 'maria.schmidt@demo.de', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"name": "Maria Schmidt"}'::jsonb),
      (demo_user_2, 'thomas.mueller@demo.de', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"name": "Thomas Müller"}'::jsonb),
      (demo_user_3, 'lisa.weber@demo.de', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"name": "Lisa Weber"}'::jsonb),
      (demo_user_4, 'max.bauer@demo.de', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"name": "Max Bauer"}'::jsonb),
      (demo_user_5, 'anna.fischer@demo.de', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"name": "Anna Fischer"}'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (id, email, name, balance)
    VALUES 
      (demo_user_1, 'maria.schmidt@demo.de', 'Maria Schmidt', 150.00),
      (demo_user_2, 'thomas.mueller@demo.de', 'Thomas Müller', 200.00),
      (demo_user_3, 'lisa.weber@demo.de', 'Lisa Weber', 120.00),
      (demo_user_4, 'max.bauer@demo.de', 'Max Bauer', 180.00),
      (demo_user_5, 'anna.fischer@demo.de', 'Anna Fischer', 95.00)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO transactions (from_user_id, to_user_id, amount, note, created_at)
    VALUES
      (demo_user_1, ines_user_id, 25.50, 'Kinokarten', now() - interval '2 hours'),
      (ines_user_id, demo_user_2, 15.00, 'Pizza gestern Abend', now() - interval '1 day'),
      (demo_user_3, ines_user_id, 50.00, 'Geburtstagsgeschenk', now() - interval '3 days'),
      (ines_user_id, demo_user_4, 30.00, 'Tankgeld', now() - interval '5 days'),
      (demo_user_5, ines_user_id, 12.50, 'Kaffee und Kuchen', now() - interval '1 week'),
      (ines_user_id, demo_user_1, 40.00, 'Konzertkarten', now() - interval '10 days'),
      (demo_user_2, ines_user_id, 8.50, 'Mittagessen', now() - interval '2 weeks'),
      (ines_user_id, demo_user_3, 22.00, 'Buch geliehen', now() - interval '3 weeks')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;