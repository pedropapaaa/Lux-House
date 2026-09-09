/*
# Fix Public Events RLS Policy for New Status Lifecycle

## Purpose
The public SELECT policy on `events` still references the old status values
('active', 'live') which were renamed in a later migration to
('coming_soon', 'sales_open', 'last_tickets', 'live', 'ended', 'cancelled').
As a result, anon-key requests (the public landing page on mobile/desktop)
get ZERO rows back — the page falls back to the hardcoded "A NOITE" headline
and the countdown timer has no event date, so it never renders.

## Changes
1. Drop the stale `public_select_active_events` policy.
2. Recreate it with the full set of public-visible statuses, excluding only
   `cancelled` (and implicitly `draft` which no longer exists in the constraint).
   Also enforce `is_archived = false` so archived events are never public.
*/

DROP POLICY IF EXISTS "public_select_active_events" ON events;

CREATE POLICY "public_select_active_events"
ON events FOR SELECT
TO anon, authenticated
USING (
  is_archived = false
  AND status IN ('coming_soon', 'sales_open', 'last_tickets', 'live', 'ended')
);
