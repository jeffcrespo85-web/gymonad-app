-- Create check-ins table to store location-based check-ins
CREATE TABLE IF NOT EXISTS checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  gym_id UUID REFERENCES gyms(id),
  user_latitude DECIMAL(10, 8),
  user_longitude DECIMAL(11, 8),
  distance_meters INTEGER,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, DATE(checked_in_at));
CREATE INDEX IF NOT EXISTS idx_checkins_gym ON checkins(gym_id);
