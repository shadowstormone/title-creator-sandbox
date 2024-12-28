-- Add is_banned column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;

-- Create policy to prevent banned users from accessing the application
CREATE POLICY "Prevent banned users from accessing the application"
  ON profiles FOR SELECT
  USING (
    is_banned = FALSE
  );