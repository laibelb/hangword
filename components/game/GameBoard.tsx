'use client'

import { useState, useCallback } from 'react'
import { GameState } from '@/types'
import { processGuess } from '@/lib/game-logic'
import Gallows from './Gallows'
import WordDisplay from './WordDisplay'
import Keyboard from './Keyboard'
import GameOver from './GameOver'

interface GameBoardProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  isDaily: boolean
  onPlayAgain?: () => void
  onGameComplete?: (won: boolean, wrongCount: number, duration: number) => void
}

export default function GameBoard({
  gameState,
  setGameState,
  isDaily,
  onPlayAgain,
  onGameComplete,
}: GameBoardProps) {
  const [showHint, setShowHint] = useState(false)

  const handleGuess = useCallback(
    (letter: string) => {
      setGameState((prevState) => {
        const newState = processGuess(prevState, letter)

        // Check if game just ended
        if (prevState.status === 'playing' && newState.status !== 'playing') {
          const duration = Math.floor((newState.endTime! - newState.startTime) / 1000)
          onGameComplete?.(newState.status === 'won', newState.wrongGuesses, duration)
        }

        return newState
      })
    },
    [setGameState, onGameComplete]
  )

  const handleShowHint = () => {
    setShowHint(true)
  }

  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Category */}
      <p className="category">{gameState.category}</p>

      {/* Gallows */}
      <Gallows wrongGuesses={gameState.wrongGuesses} />

      {/* Word Display */}
      <WordDisplay
        word={gameState.word}
        revealedLetters={gameState.revealedLetters}
        status={gameState.status}
      />

      {/* Guesses Remaining */}
      <div className="guesses-remaining">
        <span>Guesses left:</span>
        <div className="guess-dots">
          {Array.from({ length: gameState.maxWrongGuesses }).map((_, i) => (
            <div
              key={i}
              className={`guess-dot ${i < gameState.wrongGuesses ? 'used' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="hint-container">
        <button
          className="hint-btn"
          onClick={handleShowHint}
          disabled={showHint || gameState.status !== 'playing'}
        >
          Show Hint
        </button>
        {showHint && (
          <p className="hint-text">{gameState.hint}</p>
        )}
      </div>

      {/* Keyboard */}
      <Keyboard
        word={gameState.word}
        guessedLetters={gameState.guessedLetters}
        confirmedLetters={gameState.confirmedLetters}
        revealedLetters={gameState.revealedLetters}
        status={gameState.status}
        onGuess={handleGuess}
      />

      {/* Game Over Modal */}
      <GameOver
        gameState={gameState}
        isDaily={isDaily}
        onPlayAgain={() => {
          setShowHint(false)
          onPlayAgain?.()
        }}
        showPlayAgain={!isDaily}
      />
    </main>
  )
}
