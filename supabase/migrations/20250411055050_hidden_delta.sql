/*
  # Add dispute messages table

  1. New Tables
    - `dispute_messages`
      - `id` (uuid, primary key)
      - `dispute_id` (uuid, foreign key)
      - `content` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on dispute_messages table
    - Add policies for authenticated users
*/

-- Create dispute_messages table
CREATE TABLE IF NOT EXISTS dispute_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  content text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert messages for their disputes"
  ON dispute_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (
      SELECT user_id
      FROM disputes
      WHERE id = dispute_id
    )
  );

CREATE POLICY "Users can view messages for their disputes"
  ON dispute_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id
      FROM disputes
      WHERE id = dispute_id
    )
  );