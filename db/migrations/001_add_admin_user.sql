-- Add admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add check constraint to winner_team to ensure it's either a team ID or 'TIE'
ALTER TABLE games ADD CONSTRAINT winner_team_check
    CHECK (winner_team IS NULL OR winner_team = 'TIE' OR
           winner_team IN (home_team, away_team));
