import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface RandomWordResult {
  word_id: number
  word: string
  category: string
  hint: string
  difficulty: number
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user (optional for practice mode)
    const { data: { user } } = await supabase.auth.getUser()

    let word: RandomWordResult | null = null

    if (user) {
      // Get random word excluding recently played
      const { data, error } = await supabase
        .rpc('get_random_word', { p_user_id: user.id, p_exclude_recent: 10 })
        .single<RandomWordResult>()

      if (error) throw error
      word = data
    } else {
      // Get any random word for non-authenticated users
      const { data, error } = await supabase
        .rpc('get_any_random_word')
        .single<RandomWordResult>()

      if (error) throw error
      word = data
    }

    if (!word) {
      return NextResponse.json(
        { error: 'No words available' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      word: {
        id: word.word_id,
        word: word.word,
        category: word.category,
        hint: word.hint,
        difficulty: word.difficulty,
      },
    })
  } catch (error) {
    console.error('Error fetching random word:', error)
    return NextResponse.json(
      { error: 'Failed to fetch random word' },
      { status: 500 }
    )
  }
}
