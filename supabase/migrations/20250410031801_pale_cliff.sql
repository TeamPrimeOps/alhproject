/*
  # Create disputes table

  1. New Tables
    - `disputes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `description_hash` (text)
      - `ai_analysis` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on disputes table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  description_hash text,
  ai_analysis text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create disputes"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own disputes"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);