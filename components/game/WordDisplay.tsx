'use client'

import { GameStatus } from '@/types'

interface WordDisplayProps {
  word: string
  revealedLetters: Set<string>
  status: GameStatus
}

export default function WordDisplay({ word, revealedLetters, status }: WordDisplayProps) {
  const gameLost = status === 'lost'

  return (
    <div className="word-container">
      {word.split('').map((char, index) => {
        if (char === ' ') {
          return <div key={index} className="letter-slot space" />
        }

        const isLetter = /[A-Z]/i.test(char)
        const upperChar = char.toUpperCase()
        const wasRevealed = isLetter && revealedLetters.has(upperChar)
        const shouldShowOnLoss = gameLost && isLetter && !wasRevealed

        let className = 'letter-slot'
        if (wasRevealed) {
          className += ' revealed correct'
        } else if (shouldShowOnLoss) {
          className += ' revealed wrong'
        }

        return (
          <div key={index} className={className}>
            {wasRevealed ? upperChar : shouldShowOnLoss ? upperChar : ''}
          </div>
        )
      })}
    </div>
  )
}
