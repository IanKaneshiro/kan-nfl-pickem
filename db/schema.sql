-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE users (
    id TEXT PRIMARY KEY,      -- Clerk user ID
    username TEXT NOT NULL,   -- Display name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Games table
CREATE TABLE games (
    id TEXT PRIMARY KEY,      -- Game ID from NFL API
    week INTEGER NOT NULL,    -- NFL week number (1-18)
    scheduled TIMESTAMP WITH TIME ZONE NOT NULL,
    home_team TEXT NOT NULL,  -- Team ID
    away_team TEXT NOT NULL,  -- Team ID
    winner_team TEXT,         -- Team ID of winner (null until game ends)
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Picks table
CREATE TABLE picks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    picked_team TEXT NOT NULL, -- Team ID that was picked
    is_correct BOOLEAN,        -- null until game ends
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    -- Ensure users can only have one pick per game
    UNIQUE(user_id, game_id)
);

-- Add indexes for common queries
CREATE INDEX picks_user_id_week_idx ON picks(user_id, week);
CREATE INDEX games_week_idx ON games(week);
CREATE INDEX picks_game_id_idx ON picks(game_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_picks_updated_at
    BEFORE UPDATE ON picks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
