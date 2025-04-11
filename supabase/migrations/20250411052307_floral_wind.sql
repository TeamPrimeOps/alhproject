/*
  # Add storage bucket for dispute documents

  1. Changes
    - Create storage bucket for dispute documents
    - Ensure document_path column exists in disputes table
    - Add storage policies for authenticated users

  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to manage their own files
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

-- Enable RLS on the bucket
CREATE POLICY "Users can upload dispute documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dispute-documents' AND
    auth.uid()::text = (SELECT user_id::text FROM disputes WHERE document_path = name LIMIT 1)
  );

CREATE POLICY "Users can view their own dispute documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dispute-documents' AND
    auth.uid()::text = (SELECT user_id::text FROM disputes WHERE document_path = name LIMIT 1)
  );