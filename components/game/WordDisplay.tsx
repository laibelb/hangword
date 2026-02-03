'use client'

import { GameStatus } from '@/types'

interface WordDisplayProps {
  word: string
  guessedLetters: Set<string>
  status: GameStatus
}

export default function WordDisplay({ word, guessedLetters, status }: WordDisplayProps) {
  const isRevealed = status === 'lost'

  return (
    <div className="word-container">
      {word.split('').map((char, index) => {
        if (char === ' ') {
          return <div key={index} className="letter-slot space" />
        }

        const isLetter = /[A-Z]/i.test(char)
        const upperChar = char.toUpperCase()
        const wasGuessed = isLetter && guessedLetters.has(upperChar)
        const shouldReveal = isRevealed && isLetter && !wasGuessed

        let className = 'letter-slot'
        if (wasGuessed) {
          className += ' revealed correct'
        } else if (shouldReveal) {
          className += ' revealed wrong'
        }

        return (
          <div key={index} className={className}>
            {wasGuessed ? upperChar : shouldReveal ? upperChar : ''}
          </div>
        )
      })}
    </div>
  )
}
