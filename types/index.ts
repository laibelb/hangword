// Database types

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface Word {
  id: number
  word: string
  category: string
  hint: string
  difficulty: number
  created_at: string
}

export interface DailyWord {
  id: number
  word_id: number
  play_date: string
  word?: Word
}

export interface Game {
  id: string
  user_id: string
  word_id: number
  is_daily: boolean
  won: boolean | null
  guesses_used: string[]
  wrong_count: number
  duration_seconds: number | null
  completed_at: string | null
  word?: Word
}

export interface UserStats {
  user_id: string
  games_played: number
  games_won: number
  current_streak: number
  max_streak: number
  avg_wrong_guesses: number | null
  daily_games_played: number
  daily_games_won: number
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  friend?: Profile
}

export interface ChallengeResult {
  won: boolean
  wrong_count: number
  duration: number
}

export interface Challenge {
  id: string
  challenger_id: string
  challenged_id: string
  word_id: number
  challenger_result: ChallengeResult | null
  challenged_result: ChallengeResult | null
  status: 'pending' | 'completed' | 'expired'
  created_at: string
  expires_at: string
  challenger?: Profile
  challenged?: Profile
  word?: Word
}

// Game state types

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  word: string
  hint: string
  category: string
  guessedLetters: Set<string>
  confirmedLetters: Set<string>  // Yellow: in word but not revealed yet
  revealedLetters: Set<string>   // Green: revealed in word display
  wrongGuesses: number
  maxWrongGuesses: number
  status: GameStatus
  startTime: number
  endTime: number | null
}

// Leaderboard types

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  value: number
}

export type LeaderboardType = 'daily' | 'weekly' | 'alltime'

// API response types

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface DailyWordResponse {
  word: Word
  already_played: boolean
  previous_game?: Game
}

export interface RandomWordResponse {
  word: Word
}

export interface SubmitGameRequest {
  word_id: number
  is_daily: boolean
  won: boolean
  guesses_used: string[]
  wrong_count: number
  duration_seconds: number
}

export interface SubmitGameResponse {
  game: Game
  stats: UserStats
}
