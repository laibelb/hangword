'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGame } from '@/hooks/useGame'
import GameBoard from '@/components/game/GameBoard'
import Header from '@/components/game/Header'

export default function PracticePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const { gameState, setGameState, startGame } = useGame()
  const supabase = createClient()

  useEffect(() => {
    // Load streak from localStorage
    const saved = localStorage.getItem('hangword-stats')
    if (saved) {
      const stats = JSON.parse(saved)
      setStreak(stats.streak || 0)
    }
  }, [])

  const fetchNewWord = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/random-word')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch word')
      }

      startGame(data.word)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startGame])

  useEffect(() => {
    fetchNewWord()
  }, [fetchNewWord])

  const handleGameComplete = useCallback(
    async (won: boolean, wrongCount: number, duration: number) => {
      // Update streak display
      setTimeout(() => {
        const saved = localStorage.getItem('hangword-stats')
        if (saved) {
          const stats = JSON.parse(saved)
          setStreak(stats.streak || 0)
        }
      }, 100)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const guessedLetters = gameState ? Array.from(gameState.guessedLetters) : []

        await fetch('/api/submit-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word_id: 1,
            is_daily: false,
            won,
            guesses_used: guessedLetters,
            wrong_count: wrongCount,
            duration_seconds: duration,
          }),
        })
      } catch (err) {
        console.error('Failed to save game:', err)
      }
    },
    [gameState, supabase.auth]
  )

  const handlePlayAgain = () => {
    fetchNewWord()
  }

  if (loading) {
    return (
      <>
        <Header streak={streak} />
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <p className="category">Loading...</p>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header streak={streak} />
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <p style={{ color: '#c53030', marginBottom: '16px' }}>{error}</p>
          <button className="btn-primary" onClick={handlePlayAgain} style={{ maxWidth: '200px' }}>
            Try Again
          </button>
        </main>
      </>
    )
  }

  if (!gameState) {
    return null
  }

  return (
    <>
      <Header streak={streak} />
      <GameBoard
        gameState={gameState}
        setGameState={setGameState}
        isDaily={false}
        onPlayAgain={handlePlayAgain}
        onGameComplete={handleGameComplete}
      />
    </>
  )
}
