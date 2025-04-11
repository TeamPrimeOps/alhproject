/*
  # Refresh Schema Cache

  This migration is designed to force a schema cache refresh by making a minimal, safe change.
  
  1. Changes
    - Add a harmless comment to the disputes table
    - This will trigger a schema cache refresh without modifying data
*/

COMMENT ON TABLE disputes IS 'Table storing dispute records and their current status';