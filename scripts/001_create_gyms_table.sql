-- Create gyms table to store gym locations
CREATE TABLE IF NOT EXISTS gyms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample gym locations
INSERT INTO gyms (name, address, latitude, longitude) VALUES
('Gold''s Gym Downtown', '123 Main St, Downtown', 40.7128, -74.0060),
('Planet Fitness Central', '456 Oak Ave, Central District', 40.7589, -73.9851),
('LA Fitness Westside', '789 Pine Rd, Westside', 40.7505, -73.9934),
('Anytime Fitness North', '321 Elm St, North End', 40.7831, -73.9712),
('CrossFit Box East', '654 Maple Dr, East Side', 40.7282, -73.9942);
