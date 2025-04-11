/*
  # Add storage bucket for dispute documents and RLS policies

  1. Changes
    - Create storage bucket for dispute documents
    - Ensure document_path column exists in disputes table
    - Add storage policies for authenticated users
    - Add RLS policies for disputes table

  2. Security
    - Enable RLS on storage bucket and disputes table
    - Add policies for authenticated users to manage their own files and disputes
*/

-- First ensure the document_path column exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disputes' 
    AND column_name = 'document_path'
  ) THEN
    ALTER TABLE disputes ADD COLUMN document_path text;
  END IF;
END $$;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('dispute-documents', 'dispute-documents')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on disputes table
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own disputes
CREATE POLICY "Users can insert their own disputes"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to view their own disputes
CREATE POLICY "Users can view their own disputes"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on the storage bucket
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