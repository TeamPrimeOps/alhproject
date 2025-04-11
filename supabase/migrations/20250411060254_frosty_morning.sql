/*
  # Add status field to disputes table

  1. Changes
    - Add status field to disputes table
    - Add default value for status
    - Update existing rows to have default status

  2. Security
    - Allow users to update status of their own disputes
*/

ALTER TABLE disputes ADD COLUMN IF NOT EXISTS status text 
  CHECK (status IN ('in_progress', 'cancelled', 'completed'))
  DEFAULT 'in_progress';

-- Create policy for users to update their own disputes
CREATE POLICY "Users can update their own disputes"
  ON disputes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);