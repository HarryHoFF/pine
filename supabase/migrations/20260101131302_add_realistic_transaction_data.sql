/*
  # Realistische Transaktionsdaten einfügen

  1. Transaktionen
    - 14 verschiedene Transaktionen von echten Händlern und Personen
    - Verschiedene Währungen (EUR, USD, DKK)
    - Mix aus Zahlungen, Rückzahlungen und erhaltenen Geldern
    - Zeitraum: 13. bis 27. Dezember 2025

  2. Transaktionstypen
    - Zahlung im Einzugsverfahren
    - Zahlung
    - Rückzahlung
    - Geld erhalten
    - Abbuchung
*/

DO $$
DECLARE
  user_id_var uuid;
BEGIN
  SELECT id INTO user_id_var FROM profiles WHERE email = 'ines@example.com';
  
  IF user_id_var IS NOT NULL THEN
    INSERT INTO external_transactions (user_id, merchant_name, amount, currency, transaction_type, description, created_at)
    VALUES
      (user_id_var, 'INFINITE STYLES SERVICES CO., LIMITED', -42.47, 'USD', 'Zahlung im Einzugsverfahren', NULL, '2025-12-27 14:30:00+00'),
      (user_id_var, 'Oilando', -396.00, 'DKK', 'Zahlung', NULL, '2025-12-27 11:15:00+00'),
      (user_id_var, 'Fever', -71.40, 'EUR', 'Zahlung', NULL, '2025-12-22 19:45:00+00'),
      (user_id_var, 'Meta Platforms, Inc.', -535.62, 'DKK', 'Zahlung im Einzugsverfahren', NULL, '2025-12-20 10:20:00+00'),
      (user_id_var, 'Oak ´n Ivy', 135.00, 'EUR', 'Rückzahlung', NULL, '2025-12-19 16:10:00+00'),
      (user_id_var, 'Oak ´n Ivy', -110.00, 'EUR', 'Zahlung', NULL, '2025-12-18 13:25:00+00'),
      (user_id_var, 'Google Payment Ireland Limited', -9.99, 'EUR', 'Zahlung im Einzugsverfahren', NULL, '2025-12-17 09:05:00+00'),
      (user_id_var, 'Union-Bank AG', -70.00, 'EUR', 'Abbuchung', NULL, '2025-12-17 08:00:00+00'),
      (user_id_var, 'INFINITE STYLES SERVICES CO., LIMITED', 38.07, 'USD', 'Rückzahlung', NULL, '2025-12-16 15:40:00+00'),
      (user_id_var, 'Filzwandlerin', -51.50, 'EUR', 'Zahlung', NULL, '2025-12-14 12:50:00+00'),
      (user_id_var, 'Iris Alexander', 70.00, 'EUR', 'Geld erhalten', 'krusmolle. . danke Engel', '2025-12-14 11:20:00+00'),
      (user_id_var, 'Tankas Naturwerkstatt', -51.80, 'EUR', 'Zahlung', NULL, '2025-12-13 17:30:00+00'),
      (user_id_var, 'PAYPAL ETSY IRELAND', -69.20, 'EUR', 'Zahlung', NULL, '2025-12-13 14:15:00+00'),
      (user_id_var, 'The Herstory Witch', -4999.00, 'EUR', 'Zahlung', NULL, '2025-12-13 10:00:00+00')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;