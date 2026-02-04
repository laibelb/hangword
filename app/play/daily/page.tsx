'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGame } from '@/hooks/useGame'
import { Word, Game } from '@/types'
import { getDayNumber, formatDuration } from '@/lib/utils'
import GameBoard from '@/components/game/GameBoard'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ShareButton from '@/components/social/ShareButton'
import { generateShareText } from '@/lib/game-logic'

export default function DailyPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [previousGame, setPreviousGame] = useState<Game | null>(null)
  const [word, setWord] = useState<Word | null>(null)
  const { gameState, setGameState, startGame } = useGame()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchDailyWord = async () => {
      try {
        const response = await fetch('/api/daily-word')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch daily word')
        }

        setWord(data.word)
        setAlreadyPlayed(data.already_played)
        setPreviousGame(data.previous_game)

        if (!data.already_played) {
          startGame(data.word)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDailyWord()
  }, [startGame])

  const handleGameComplete = useCallback(
    async (won: boolean, wrongCount: number, duration: number) => {
      if (!word) return

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const allGuessedLetters = gameState
          ? [...Array.from(gameState.guessedLetters), ...Array.from(gameState.confirmedLetters), ...Array.from(gameState.revealedLetters)]
          : []

        await fetch('/api/submit-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word_id: word.id,
            is_daily: true,
            won,
            guesses_used: allGuessedLetters,
            wrong_count: wrongCount,
            duration_seconds: duration,
          }),
        })
      } catch (err) {
        console.error('Failed to save game:', err)
      }
    },
    [word, gameState, supabase.auth]
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/play')}>Back to Play</Button>
        </Card>
      </div>
    )
  }

  if (alreadyPlayed && previousGame && word) {
    const dayNumber = getDayNumber()
    const shareText = generateShareText(
      dayNumber,
      previousGame.won ?? false,
      previousGame.wrong_count,
      6,
      true
    )

    return (
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-4">
              {previousGame.won ? '🎉' : '😔'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Daily #{dayNumber} {previousGame.won ? 'Complete!' : 'Played'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You already played today&apos;s challenge.
            </p>

            {/* Result Summary */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">The word was</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{word.word}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {previousGame.wrong_count}/6
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wrong Guesses</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(previousGame.duration_seconds || 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
              </div>
            </div>

            <ShareButton text={shareText} />

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Come back tomorrow for a new challenge!
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push('/play/practice')}
                className="w-full"
              >
                Practice Mode
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!gameState || !word) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Daily Challenge #{getDayNumber()}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Everyone plays the same word today
        </p>
      </div>

      <Card>
        <GameBoard
          gameState={gameState}
          setGameState={setGameState}
          isDaily={true}
          onGameComplete={handleGameComplete}
        />
      </Card>
    </div>
  )
}
