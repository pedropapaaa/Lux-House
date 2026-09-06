-- Fix Sunset Lux 2026 banner_url: Pinterest pin URL is not a direct image link
UPDATE events
SET banner_url = '/images/IMG-20260901-WA0038.jpg'
WHERE id = 'd84a07d3-6dff-4c06-a1c3-884d81d884a9';
