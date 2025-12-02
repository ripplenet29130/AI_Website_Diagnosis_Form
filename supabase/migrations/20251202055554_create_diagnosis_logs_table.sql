/*
  # Create diagnosis_logs table

  1. New Tables
    - `diagnosis_logs`
      - `id` (uuid, primary key) - Unique identifier for each diagnosis log
      - `url` (text, not null) - The URL that was analyzed
      - `result` (jsonb, not null) - The AI analysis result in JSON format
      - `created_at` (timestamptz) - Timestamp when the diagnosis was created
  
  2. Security
    - Enable RLS on `diagnosis_logs` table
    - Add policy for service role to insert records
    - Add policy for authenticated users to read all records
*/

CREATE TABLE IF NOT EXISTS diagnosis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnosis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert diagnosis logs"
  ON diagnosis_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all diagnosis logs"
  ON diagnosis_logs
  FOR SELECT
  TO authenticated
  USING (true);
