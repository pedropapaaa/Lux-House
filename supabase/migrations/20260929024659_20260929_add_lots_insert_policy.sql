/*
# Add INSERT policy for lots table

1. Security changes
- Adds `admin_insert_lots` policy so authenticated admins can create new lots.
- Without this, the new "Create Event" page cannot add initial lots to a new event.
*/

DROP POLICY IF EXISTS "admin_insert_lots" ON lots;
CREATE POLICY "admin_insert_lots"
ON lots FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));
