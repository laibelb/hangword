import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface DailyWordResult {
  word_id: number
  word: string
  category: string
  hint: string
  difficulty: number
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get today's daily word
    const { data: dailyWord, error: wordError } = await supabase
      .rpc('get_daily_word')
      .single<DailyWordResult>()

    if (wordError || !dailyWord) {
      return NextResponse.json(
        { error: 'No daily word available' },
        { status: 404 }
      )
    }

    // Check if user has already played today
    let alreadyPlayed = false
    let previousGame = null

    if (user) {
      const { data: hasPlayed } = await supabase
        .rpc('has_played_daily_today', { p_user_id: user.id })

      alreadyPlayed = hasPlayed || false

      if (alreadyPlayed) {
        const { data: game } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', user.id)
          .eq('word_id', dailyWord.word_id)
          .eq('is_daily', true)
          .single()

        previousGame = game
      }
    }

    return NextResponse.json({
      word: {
        id: dailyWord.word_id,
        word: dailyWord.word,
        category: dailyWord.category,
        hint: dailyWord.hint,
        difficulty: dailyWord.difficulty,
      },
      already_played: alreadyPlayed,
      previous_game: previousGame,
    })
  } catch (error) {
    console.error('Error fetching daily word:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily word' },
      { status: 500 }
    )
  }
}
