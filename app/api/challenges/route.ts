import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Get user's challenges
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get challenges where user is either challenger or challenged
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger:profiles!challenges_challenger_id_fkey(id, username, avatar_url),
        challenged:profiles!challenges_challenged_id_fkey(id, username, avatar_url),
        word:words(id, word, category, hint, difficulty)
      `)
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

// POST - Create a new challenge
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { challenged_id, word_id, challenger_result } = await request.json()

    if (!challenged_id) {
      return NextResponse.json(
        { error: 'Challenged user ID is required' },
        { status: 400 }
      )
    }

    // If no word_id provided, get a random word
    let finalWordId = word_id
    if (!finalWordId) {
      const { data: randomWord, error: wordError } = await supabase
        .from('words')
        .select('id')
        .order('random()')
        .limit(1)
        .single()

      if (wordError) throw wordError
      finalWordId = randomWord.id
    }

    // Create the challenge
    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        challenger_id: user.id,
        challenged_id,
        word_id: finalWordId,
        challenger_result,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select(`
        *,
        challenger:profiles!challenges_challenger_id_fkey(id, username, avatar_url),
        challenged:profiles!challenges_challenged_id_fkey(id, username, avatar_url),
        word:words(id, word, category, hint, difficulty)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ challenge })
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}

// PATCH - Update challenge result
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { challenge_id, result } = await request.json()

    if (!challenge_id || !result) {
      return NextResponse.json(
        { error: 'Challenge ID and result are required' },
        { status: 400 }
      )
    }

    // Get the challenge
    const { data: challenge, error: fetchError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .single()

    if (fetchError) throw fetchError

    // Determine which field to update
    const isChallenger = challenge.challenger_id === user.id
    const isChallenged = challenge.challenged_id === user.id

    if (!isChallenger && !isChallenged) {
      return NextResponse.json(
        { error: 'Not authorized to update this challenge' },
        { status: 403 }
      )
    }

    const updateField = isChallenger ? 'challenger_result' : 'challenged_result'

    // Check if both results will be present after update
    const otherResultField = isChallenger ? 'challenged_result' : 'challenger_result'
    const newStatus = challenge[otherResultField] ? 'completed' : 'pending'

    // Update the challenge
    const { data: updatedChallenge, error: updateError } = await supabase
      .from('challenges')
      .update({
        [updateField]: result,
        status: newStatus,
      })
      .eq('id', challenge_id)
      .select(`
        *,
        challenger:profiles!challenges_challenger_id_fkey(id, username, avatar_url),
        challenged:profiles!challenges_challenged_id_fkey(id, username, avatar_url),
        word:words(id, word, category, hint, difficulty)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ challenge: updatedChallenge })
  } catch (error) {
    console.error('Error updating challenge:', error)
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    )
  }
}
