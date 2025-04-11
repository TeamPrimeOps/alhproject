/*
  # Force Schema Cache Refresh

  This migration is designed to force another schema cache refresh since the previous attempt
  did not successfully update the cache for the 'status' column.
  
  1. Changes
    - Modify the comment on the status column
    - This will trigger a schema cache refresh without affecting data or functionality
*/

-- Update column comment to force schema refresh
COMMENT ON COLUMN disputes.status IS 'Current status of the dispute: in_progress, cancelled, or completed';