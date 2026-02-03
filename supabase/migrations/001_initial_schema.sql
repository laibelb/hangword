-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extended user profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Word bank
CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  category TEXT NOT NULL,
  hint TEXT NOT NULL,
  difficulty INT DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily word schedule
CREATE TABLE daily_words (
  id SERIAL PRIMARY KEY,
  word_id INT REFERENCES words(id) ON DELETE CASCADE,
  play_date DATE UNIQUE NOT NULL
);

-- Game history
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word_id INT REFERENCES words(id) ON DELETE SET NULL,
  is_daily BOOLEAN DEFAULT false,
  won BOOLEAN,
  guesses_used TEXT[] DEFAULT '{}',
  wrong_count INT DEFAULT 0,
  duration_seconds INT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats (materialized for performance)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  avg_wrong_guesses FLOAT,
  daily_games_played INT DEFAULT 0,
  daily_games_won INT DEFAULT 0
);

-- Friendships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Word challenges between friends
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenged_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word_id INT REFERENCES words(id) ON DELETE SET NULL,
  challenger_result JSONB,
  challenged_result JSONB,
  status TEXT CHECK (status IN ('pending', 'completed', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for performance
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_word_id ON games(word_id);
CREATE INDEX idx_games_is_daily ON games(is_daily);
CREATE INDEX idx_games_completed_at ON games(completed_at DESC);
CREATE INDEX idx_daily_words_play_date ON daily_words(play_date);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_challenges_challenger_id ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged_id ON challenges(challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Words policies (read-only for users)
CREATE POLICY "Words are viewable by everyone"
  ON words FOR SELECT
  USING (true);

-- Daily words policies (read-only for users)
CREATE POLICY "Daily words are viewable by everyone"
  ON daily_words FOR SELECT
  USING (true);

-- Games policies
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view daily games for leaderboard"
  ON games FOR SELECT
  USING (is_daily = true);

-- User stats policies
CREATE POLICY "User stats are viewable by everyone"
  ON user_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendship requests"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Users can view challenges they're part of"
  ON challenges FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update challenges they're part of"
  ON challenges FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Functions

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user stats after game completion
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  prev_game_won BOOLEAN;
  prev_daily_date DATE;
BEGIN
  -- Update basic stats
  UPDATE user_stats
  SET
    games_played = games_played + 1,
    games_won = CASE WHEN NEW.won THEN games_won + 1 ELSE games_won END,
    daily_games_played = CASE WHEN NEW.is_daily THEN daily_games_played + 1 ELSE daily_games_played END,
    daily_games_won = CASE WHEN NEW.is_daily AND NEW.won THEN daily_games_won + 1 ELSE daily_games_won END,
    avg_wrong_guesses = (
      SELECT AVG(wrong_count)::FLOAT
      FROM games
      WHERE user_id = NEW.user_id
    )
  WHERE user_id = NEW.user_id;

  -- Update streak for daily games
  IF NEW.is_daily THEN
    -- Get previous daily game result
    SELECT g.won, dw.play_date INTO prev_game_won, prev_daily_date
    FROM games g
    JOIN daily_words dw ON g.word_id = dw.word_id
    WHERE g.user_id = NEW.user_id
      AND g.is_daily = true
      AND g.id != NEW.id
    ORDER BY dw.play_date DESC
    LIMIT 1;

    IF NEW.won THEN
      -- Check if this continues a streak (played yesterday and won)
      IF prev_daily_date = CURRENT_DATE - INTERVAL '1 day' AND prev_game_won THEN
        UPDATE user_stats
        SET
          current_streak = current_streak + 1,
          max_streak = GREATEST(max_streak, current_streak + 1)
        WHERE user_id = NEW.user_id;
      ELSE
        -- Start new streak
        UPDATE user_stats
        SET
          current_streak = 1,
          max_streak = GREATEST(max_streak, 1)
        WHERE user_id = NEW.user_id;
      END IF;
    ELSE
      -- Lost - reset current streak
      UPDATE user_stats
      SET current_streak = 0
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for game completion
CREATE TRIGGER on_game_completed
  AFTER INSERT ON games
  FOR EACH ROW
  WHEN (NEW.won IS NOT NULL)
  EXECUTE FUNCTION update_user_stats();

-- Function to check if user has played today's daily
CREATE OR REPLACE FUNCTION has_played_daily_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM games g
    JOIN daily_words dw ON g.word_id = dw.word_id
    WHERE g.user_id = p_user_id
      AND g.is_daily = true
      AND dw.play_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's daily word
CREATE OR REPLACE FUNCTION get_daily_word()
RETURNS TABLE (
  word_id INT,
  word TEXT,
  category TEXT,
  hint TEXT,
  difficulty INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id as word_id, w.word, w.category, w.hint, w.difficulty
  FROM daily_words dw
  JOIN words w ON dw.word_id = w.id
  WHERE dw.play_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a random word (excluding recently played)
CREATE OR REPLACE FUNCTION get_random_word(p_user_id UUID, p_exclude_recent INT DEFAULT 10)
RETURNS TABLE (
  word_id INT,
  word TEXT,
  category TEXT,
  hint TEXT,
  difficulty INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id as word_id, w.word, w.category, w.hint, w.difficulty
  FROM words w
  WHERE w.id NOT IN (
    SELECT g.word_id
    FROM games g
    WHERE g.user_id = p_user_id
      AND g.word_id IS NOT NULL
    ORDER BY g.completed_at DESC
    LIMIT p_exclude_recent
  )
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_type TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  value BIGINT
) AS $$
BEGIN
  IF p_type = 'daily' THEN
    -- Daily leaderboard: fastest times for today's word
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY g.duration_seconds ASC, g.wrong_count ASC) as rank,
      g.user_id,
      p.username,
      p.avatar_url,
      g.duration_seconds::BIGINT as value
    FROM games g
    JOIN profiles p ON g.user_id = p.id
    JOIN daily_words dw ON g.word_id = dw.word_id
    WHERE dw.play_date = CURRENT_DATE
      AND g.is_daily = true
      AND g.won = true
    ORDER BY g.duration_seconds ASC, g.wrong_count ASC
    LIMIT p_limit;
  ELSIF p_type = 'weekly' THEN
    -- Weekly leaderboard: most daily wins this week
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
      g.user_id,
      p.username,
      p.avatar_url,
      COUNT(*)::BIGINT as value
    FROM games g
    JOIN profiles p ON g.user_id = p.id
    JOIN daily_words dw ON g.word_id = dw.word_id
    WHERE dw.play_date >= CURRENT_DATE - INTERVAL '7 days'
      AND g.is_daily = true
      AND g.won = true
    GROUP BY g.user_id, p.username, p.avatar_url
    ORDER BY COUNT(*) DESC
    LIMIT p_limit;
  ELSE
    -- All-time leaderboard: total wins
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY us.games_won DESC) as rank,
      us.user_id,
      p.username,
      p.avatar_url,
      us.games_won::BIGINT as value
    FROM user_stats us
    JOIN profiles p ON us.user_id = p.id
    WHERE us.games_won > 0
    ORDER BY us.games_won DESC
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
