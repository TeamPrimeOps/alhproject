/*
  # Add status column to disputes table

  1. Changes
    - Add status column to disputes table with valid states
    - Set default value for status
    - Add check constraint for valid status values

  2. Security
    - No changes to security policies needed
*/

-- Add status column if it doesn't exist
ALTER TABLE disputes 
ADD COLUMN IF NOT EXISTS status text 
CHECK (status IN ('in_progress', 'cancelled', 'completed'))
DEFAULT 'in_progress';

-- Update existing rows to have the default status if null
UPDATE disputes 
SET status = 'in_progress' 
WHERE status IS NULL;