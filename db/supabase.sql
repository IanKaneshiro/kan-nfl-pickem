-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ...existing schema code from schema.sql...

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read all users
CREATE POLICY "Users can view all users"
ON users FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Everyone can view games
CREATE POLICY "Anyone can view games"
ON games FOR SELECT
TO authenticated
USING (true);

-- Only admins can update games
CREATE POLICY "Only admins can update games"
ON games FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Users can view all picks
CREATE POLICY "Users can view all picks"
ON picks FOR SELECT
TO authenticated
USING (true);

-- Users can only create/update their own picks
CREATE POLICY "Users can manage own picks"
ON picks FOR ALL
TO authenticated
USING (auth.uid() = user_id);
