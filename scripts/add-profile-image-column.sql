-- Add profile_image column to players table if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add location_address column to matches table if it doesn't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Update existing records to have empty strings instead of null
UPDATE players SET profile_image = '' WHERE profile_image IS NULL;
UPDATE matches SET location_address = '' WHERE location_address IS NULL;
