'use client'

import { useEffect, useState } from 'react'
import { GameState } from '@/types'

interface GameOverProps {
  gameState: GameState
  isDaily: boolean
  onPlayAgain?: () => void
  showPlayAgain?: boolean
}

interface Stats {
  played: number
  won: number
  streak: number
  maxStreak: number
}

export default function GameOver({ gameState, isDaily, onPlayAgain, showPlayAgain = true }: GameOverProps) {
  const { word, status, hint } = gameState
  const won = status === 'won'
  const [stats, setStats] = useState<Stats>({ played: 0, won: 0, streak: 0, maxStreak: 0 })

  useEffect(() => {
    // Load stats from localStorage
    const saved = localStorage.getItem('hangword-stats')
    if (saved) {
      setStats(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Update stats when game ends
    if (status === 'won' || status === 'lost') {
      setStats(prev => {
        const newStats = {
          ...prev,
          played: prev.played + 1,
          won: won ? prev.won + 1 : prev.won,
          streak: won ? prev.streak + 1 : 0,
          maxStreak: won ? Math.max(prev.maxStreak, prev.streak + 1) : prev.maxStreak
        }
        localStorage.setItem('hangword-stats', JSON.stringify(newStats))
        return newStats
      })
    }
  }, [status, won])

  if (status === 'playing') {
    return null
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon" dangerouslySetInnerHTML={{ __html: won ? '&#127881;' : '&#128532;' }} />
        <h2>{won ? 'Excellent!' : 'So Close!'}</h2>
        <div className={`word-reveal ${won ? '' : 'lost'}`}>{word}</div>
        <p>{hint}</p>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{stats.played}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.won}</div>
            <div className="stat-label">Won</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-label">Streak</div>
          </div>
        </div>
        {showPlayAgain && onPlayAgain && (
          <button className="btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
        {isDaily && (
          <p style={{ marginTop: '16px', fontSize: '14px' }}>
            Come back tomorrow for a new daily challenge!
          </p>
        )}
      </div>
    </div>
  )
}
