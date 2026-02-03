'use client'

import { useEffect, useCallback } from 'react'
import { GameStatus } from '@/types'

const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

interface KeyboardProps {
  word: string
  guessedLetters: Set<string>
  status: GameStatus
  onGuess: (letter: string) => void
}

export default function Keyboard({ word, guessedLetters, status, onGuess }: KeyboardProps) {
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (status !== 'playing') return

      const key = e.key.toUpperCase()
      if (/^[A-Z]$/.test(key) && !guessedLetters.has(key)) {
        onGuess(key)
      }
    },
    [status, guessedLetters, onGuess]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const getKeyClass = (letter: string) => {
    if (!guessedLetters.has(letter)) {
      return 'key'
    }
    if (word.toUpperCase().includes(letter)) {
      return 'key correct'
    }
    return 'key wrong'
  }

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={status !== 'playing' || guessedLetters.has(letter)}
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
