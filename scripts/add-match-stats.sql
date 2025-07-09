-- Add columns for goal scorers and assists to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS goal_scorers TEXT,
ADD COLUMN IF NOT EXISTS assists TEXT;

-- These will store JSON data for goal scorers and assists
-- Example format:
-- goal_scorers: [{"playerId": "123", "goals": 2}, {"playerId": "456", "goals": 1}]
-- assists: [{"playerId": "789", "assists": 1}, {"playerId": "101", "assists": 2}]
