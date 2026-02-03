import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SubmitGameRequest } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SubmitGameRequest = await request.json()

    // Validate request
    if (!body.word_id || body.won === undefined || !body.guesses_used) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // For daily games, check if already played
    if (body.is_daily) {
      const { data: hasPlayed } = await supabase
        .rpc('has_played_daily_today', { p_user_id: user.id })

      if (hasPlayed) {
        return NextResponse.json(
          { error: 'Already played today\'s daily challenge' },
          { status: 400 }
        )
      }
    }

    // Insert game record
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        user_id: user.id,
        word_id: body.word_id,
        is_daily: body.is_daily,
        won: body.won,
        guesses_used: body.guesses_used,
        wrong_count: body.wrong_count,
        duration_seconds: body.duration_seconds,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (gameError) {
      console.error('Error inserting game:', gameError)
      throw gameError
    }

    // Get updated stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (statsError) {
      console.error('Error fetching stats:', statsError)
    }

    return NextResponse.json({
      game,
      stats,
    })
  } catch (error) {
    console.error('Error submitting game:', error)
    return NextResponse.json(
      { error: 'Failed to submit game' },
      { status: 500 }
    )
  }
}
