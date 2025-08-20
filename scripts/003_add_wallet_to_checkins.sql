-- Add wallet_address column to checkins table
ALTER TABLE checkins 
ADD COLUMN wallet_address TEXT;

-- Add index for wallet address lookups
CREATE INDEX idx_checkins_wallet_address ON checkins(wallet_address);
