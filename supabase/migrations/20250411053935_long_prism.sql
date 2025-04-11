/*
  # Fix policy conflicts and update RLS

  1. Changes
    - Drop existing policies that might conflict
    - Recreate policies with proper conditions
    - Update storage policies to use proper user authentication checks

  2. Security
    - Maintain RLS on all tables
    - Ensure proper user authentication checks
*/

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can view their own disputes" ON disputes;
DROP POLICY IF EXISTS "Users can create disputes" ON disputes;
DROP POLICY IF EXISTS "Users can insert their own disputes" ON disputes;
DROP POLICY IF EXISTS "Users can upload dispute documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own dispute documents" ON storage.objects;

-- Recreate policies with proper conditions
CREATE POLICY "Users can view their own disputes"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disputes"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Recreate storage policies with proper conditions
CREATE POLICY "Users can upload dispute documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dispute-documents' AND
    auth.uid() = (
      SELECT user_id 
      FROM disputes 
      WHERE id::text = (regexp_match(name, '^([^/]+)\..*$'))[1]::text
    )
  );

CREATE POLICY "Users can view their own dispute documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dispute-documents' AND
    auth.uid() = (
      SELECT user_id 
      FROM disputes 
      WHERE id::text = (regexp_match(name, '^([^/]+)\..*$'))[1]::text
    )
  );