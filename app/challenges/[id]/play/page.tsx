'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGame } from '@/hooks/useGame'
import { Challenge, Word } from '@/types'
import GameBoard from '@/components/game/GameBoard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'

interface PlayChallengePageProps {
  params: Promise<{
    id: string
  }>
}

export default function PlayChallengePage({ params }: PlayChallengePageProps) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const { gameState, setGameState, startGame } = useGame()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login?redirectTo=/challenges/' + id + '/play')
          return
        }

        // Fetch challenge
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select(`
            *,
            challenger:profiles!challenges_challenger_id_fkey(id, username, avatar_url),
            challenged:profiles!challenges_challenged_id_fkey(id, username, avatar_url),
            word:words(id, word, category, hint, difficulty)
          `)
          .eq('id', id)
          .single()

        if (challengeError || !challengeData) {
          throw new Error('Challenge not found')
        }

        // Check if user is part of this challenge
        if (challengeData.challenger_id !== user.id && challengeData.challenged_id !== user.id) {
          throw new Error('Not authorized to view this challenge')
        }

        setChallenge(challengeData)

        // Check if user has already played
        const isChallenger = challengeData.challenger_id === user.id
        const myResult = isChallenger ? challengeData.challenger_result : challengeData.challenged_result

        if (myResult) {
          setAlreadyPlayed(true)
        } else if (challengeData.word) {
          // Start the game
          startGame({
            id: challengeData.word.id,
            word: challengeData.word.word,
            category: challengeData.word.category,
            hint: challengeData.word.hint,
            difficulty: challengeData.word.difficulty,
            created_at: '',
          })
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenge()
  }, [id, supabase, router, startGame])

  const handleGameComplete = useCallback(
    async (won: boolean, wrongCount: number, duration: number) => {
      if (!challenge) return

      try {
        const result = {
          won,
          wrong_count: wrongCount,
          duration,
        }

        const response = await fetch('/api/challenges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge_id: challenge.id,
            result,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save result')
        }

        // Refresh challenge data
        const data = await response.json()
        setChallenge(data.challenge)
      } catch (err) {
        console.error('Failed to save game:', err)
      }
    },
    [challenge]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <Card>
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/challenges')}>Back to Challenges</Button>
        </Card>
      </div>
    )
  }

  if (alreadyPlayed && challenge) {
    const { data: { user } } = { data: { user: null } } // Will be set by effect
    const opponent = challenge.challenger ? challenge.challenged : challenge.challenger

    return (
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Challenge Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You&apos;ve already played this challenge.
            </p>
            <Button onClick={() => router.push('/challenges')}>View Results</Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!gameState || !challenge) {
    return null
  }

  const opponent = challenge.challenger
    ? challenge.challenged
    : challenge.challenger

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Avatar
            src={opponent?.avatar_url}
            name={opponent?.username || 'Opponent'}
            size="sm"
          />
          <span className="text-gray-600 dark:text-gray-400">vs</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {opponent?.username || 'Opponent'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Challenge
        </h1>
      </div>

      <Card>
        <GameBoard
          gameState={gameState}
          setGameState={setGameState}
          isDaily={false}
          onGameComplete={handleGameComplete}
        />
      </Card>
    </div>
  )
}
