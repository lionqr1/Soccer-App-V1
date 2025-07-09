-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  color VARCHAR(7) DEFAULT '#000000',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add team assignments to matches
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS home_team_id UUID REFERENCES teams(id),
ADD COLUMN IF NOT EXISTS away_team_id UUID REFERENCES teams(id),
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stream_viewers TEXT DEFAULT '[]';

-- Create team_players junction table
CREATE TABLE IF NOT EXISTS team_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  position VARCHAR(50),
  jersey_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- Create live_stream_messages table
CREATE TABLE IF NOT EXISTS live_stream_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default teams
INSERT INTO teams (name, logo_url, color) VALUES 
('Team A', '/placeholder.svg?height=50&width=50', '#FF0000'),
('Team B', '/placeholder.svg?height=50&width=50', '#0000FF')
ON CONFLICT DO NOTHING;
