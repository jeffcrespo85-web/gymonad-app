-- Function to update user workout statistics
CREATE OR REPLACE FUNCTION update_user_workout_stats(
  user_id UUID,
  tokens_earned DECIMAL
)
RETURNS VOID AS $$
DECLARE
  last_workout DATE;
  current_streak_val INTEGER;
BEGIN
  -- Get user's last workout date and current streak
  SELECT last_workout_date, current_streak 
  INTO last_workout, current_streak_val
  FROM users 
  WHERE id = user_id;

  -- Calculate new streak
  IF last_workout IS NULL OR last_workout < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Reset streak if more than 1 day gap
    IF last_workout IS NULL OR last_workout < CURRENT_DATE - INTERVAL '1 day' THEN
      current_streak_val := 1;
    ELSE
      -- Continue streak if workout yesterday
      current_streak_val := current_streak_val + 1;
    END IF;
  END IF;

  -- Update user statistics
  UPDATE users 
  SET 
    total_workouts = total_workouts + 1,
    total_gym_tokens = total_gym_tokens + tokens_earned,
    current_streak = current_streak_val,
    longest_streak = GREATEST(longest_streak, current_streak_val),
    last_workout_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = user_id;

  -- Update or create streak record
  INSERT INTO streaks (user_id, start_date, streak_length, is_active)
  VALUES (user_id, CURRENT_DATE, current_streak_val, TRUE)
  ON CONFLICT (user_id, start_date) 
  DO UPDATE SET 
    streak_length = current_streak_val,
    is_active = TRUE;
END;
$$ LANGUAGE plpgsql;
