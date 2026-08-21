
-- Remove the corrupted user created via raw SQL INSERT
DELETE FROM auth.identities WHERE user_id = '4bf37b98-3db4-4012-aa7a-59b24c47d1b4';
DELETE FROM auth.users     WHERE id       = '4bf37b98-3db4-4012-aa7a-59b24c47d1b4';
