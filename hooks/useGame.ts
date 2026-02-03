'use client'

import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react'
import { GameState, Word } from '@/types'
import { createInitialGameState } from '@/lib/game-logic'

export function useGame(initialWord?: Word) {
  const [gameState, setGameStateInternal] = useState<GameState | null>(
    initialWord
      ? createInitialGameState(initialWord.word, initialWord.hint, initialWord.category)
      : null
  )
  const [currentWord, setCurrentWord] = useState<Word | null>(initialWord || null)

  const startGame = useCallback((word: Word) => {
    setCurrentWord(word)
    setGameStateInternal(createInitialGameState(word.word, word.hint, word.category))
  }, [])

  const resetGame = useCallback(() => {
    if (currentWord) {
      setGameStateInternal(createInitialGameState(currentWord.word, currentWord.hint, currentWord.category))
    }
  }, [currentWord])

  // Create a type-safe setter that only accepts non-null GameState
  // This is safe to use after checking that gameState is not null
  const setGameState = useMemo(() => {
    return setGameStateInternal as Dispatch<SetStateAction<GameState>>
  }, [])

  return {
    gameState,
    setGameState,
    currentWord,
    startGame,
    resetGame,
  }
}
