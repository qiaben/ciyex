-- Seed org_config for orgs 1,2,3 in master schema
SET search_path TO public;

-- Insert org_config entries if they do not exist
INSERT INTO public.org_config (integrations, org_id)
VALUES
  (
    $$
    {
      "storage_type": "fhir",
      "practice_db": { "schema": "practice_1" },
      "fhir": {
        "apiUrl": "https://ciyexstg-ciyex-fhir-stg.fhir.azurehealthcareapis.com",
        "clientId": "83f912f9-0187-4ae5-b518-264bc35a72b5",
        "tokenUrl": "https://login.microsoftonline.com/0f9a04c7-d5bb-4c47-9ed0-4ed2214337ed/oauth2/v2.0/token",
        "scope": "https://ciyexstg-ciyex-fhir-stg.fhir.azurehealthcareapis.com/.default",
        "clientSecret": "REDACTED"
      },
      "stripe": { "apiKey": "sk_test_ABC123" },
      "twilio": { "accountSid": "AC_PLACEHOLDER", "authToken": "AUTH_PLACEHOLDER" },
      "smtp": { "server": "smtp.sendgrid.net", "username": "apikey", "password": "REDACTED" }
    }
    $$::jsonb,
    1
  ),
  (
    $$
    {
      "storage_type": "fhir",
      "practice_db": { "schema": "practice_2" },
      "fhir": { "apiUrl": "https://ciyexstg-ciyex-fhir-stg.fhir.azurehealthcareapis.com" },
      "stripe": { "apiKey": "sk_test_ABC123" }
    }
    $$::jsonb,
    2
  ),
  (
    $$
    {
      "storage_type": "fhir",
      "practice_db": { "schema": "practice_3" },
      "fhir": { "apiUrl": "https://ciyexstg-ciyex-fhir-stg.fhir.azurehealthcareapis.com" },
      "stripe": { "apiKey": "sk_test_ABC123" }
    }
    $$::jsonb,
    3
  )
ON CONFLICT (org_id) DO NOTHING;
