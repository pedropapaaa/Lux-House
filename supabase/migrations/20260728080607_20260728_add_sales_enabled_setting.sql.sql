/*
# Add global sales on/off toggle to app settings

1. Modified Tables
- `app_settings`
  - New column `sales_enabled` (boolean, NOT NULL, default true)
  - Controls whether the public can purchase tickets at all.
  - When false, the purchase modal / buy button is disabled regardless of lot status.

2. Security
- No policy changes. Existing public SELECT and admin-only UPDATE policies cover the new column automatically.

3. Important Notes
- Default is `true` so existing behavior is unchanged on rollout.
- This is a global kill-switch for ticket sales, separate from individual lot status.
- The frontend reads `sales_enabled` alongside `show_remaining_tickets` from the single `app_settings` row.
*/

ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS sales_enabled boolean NOT NULL DEFAULT true;
