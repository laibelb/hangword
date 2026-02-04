'use client'

import { useEffect, useCallback } from 'react'
import { GameStatus } from '@/types'
import { getLetterStatus } from '@/lib/game-logic'

const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

interface KeyboardProps {
  word: string
  guessedLetters: Set<string>
  confirmedLetters: Set<string>
  revealedLetters: Set<string>
  status: GameStatus
  onGuess: (letter: string) => void
}

export default function Keyboard({
  word,
  guessedLetters,
  confirmedLetters,
  revealedLetters,
  status,
  onGuess,
}: KeyboardProps) {
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (status !== 'playing') return

      const key = e.key.toUpperCase()
      if (/^[A-Z]$/.test(key)) {
        // Allow pressing confirmed letters again to reveal them
        const letterStatus = getLetterStatus(key, word, guessedLetters, confirmedLetters, revealedLetters)
        if (letterStatus === 'unused' || letterStatus === 'confirmed') {
          onGuess(key)
        }
      }
    },
    [status, word, guessedLetters, confirmedLetters, revealedLetters, onGuess]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const getKeyClass = (letter: string) => {
    const letterStatus = getLetterStatus(letter, word, guessedLetters, confirmedLetters, revealedLetters)

    switch (letterStatus) {
      case 'revealed':
        return 'key revealed'  // Green
      case 'confirmed':
        return 'key confirmed'  // Yellow
      case 'wrong':
        return 'key wrong'
      default:
        return 'key'
    }
  }

  const isKeyDisabled = (letter: string) => {
    if (status !== 'playing') return true
    const letterStatus = getLetterStatus(letter, word, guessedLetters, confirmedLetters, revealedLetters)
    // Only disable if wrong or already revealed
    return letterStatus === 'wrong' || letterStatus === 'revealed'
  }

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={isKeyDisabled(letter)}
              className={getKeyClass(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
