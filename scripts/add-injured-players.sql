-- Add injured column to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS injured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS injury_date TIMESTAMP;

-- Create injured_players table for tracking injury history
CREATE TABLE IF NOT EXISTS injured_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  injury_date TIMESTAMP DEFAULT NOW(),
  recovery_date TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_injured_players_player_id ON injured_players(player_id);
CREATE INDEX IF NOT EXISTS idx_injured_players_injury_date ON injured_players(injury_date);

-- Update existing players to have injured = false if null
UPDATE players SET injured = FALSE WHERE injured IS NULL;
