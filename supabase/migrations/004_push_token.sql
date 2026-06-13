-- Add push token column to members table for Expo push notifications
ALTER TABLE members ADD COLUMN IF NOT EXISTS push_token TEXT;
