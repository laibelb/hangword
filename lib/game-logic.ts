import { GameState, GameStatus } from '@/types'

export const MAX_WRONG_GUESSES = 6

export function createInitialGameState(
  word: string,
  hint: string,
  category: string
): GameState {
  return {
    word: word.toUpperCase(),
    hint,
    category,
    guessedLetters: new Set(),
    confirmedLetters: new Set(),  // Yellow: in word but not revealed
    revealedLetters: new Set(),   // Green: shown in word display
    wrongGuesses: 0,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    status: 'playing',
    startTime: Date.now(),
    endTime: null,
  }
}

export function processGuess(state: GameState, letter: string): GameState {
  const upperLetter = letter.toUpperCase()

  // Game already over
  if (state.status !== 'playing') {
    return state
  }

  const isInWord = state.word.includes(upperLetter)

  // Letter already confirmed (yellow) - reveal it (green)
  if (state.confirmedLetters.has(upperLetter)) {
    const newConfirmedLetters = new Set(state.confirmedLetters)
    newConfirmedLetters.delete(upperLetter)

    const newRevealedLetters = new Set(state.revealedLetters)
    newRevealedLetters.add(upperLetter)

    const newStatus = calculateGameStatus(
      state.word,
      newRevealedLetters,
      state.wrongGuesses,
      state.maxWrongGuesses
    )

    return {
      ...state,
      confirmedLetters: newConfirmedLetters,
      revealedLetters: newRevealedLetters,
      status: newStatus,
      endTime: newStatus !== 'playing' ? Date.now() : null,
    }
  }

  // Already revealed or wrong - ignore
  if (state.revealedLetters.has(upperLetter) || state.guessedLetters.has(upperLetter)) {
    return state
  }

  // New guess
  if (isInWord) {
    // Correct - add to confirmed (yellow)
    const newConfirmedLetters = new Set(state.confirmedLetters)
    newConfirmedLetters.add(upperLetter)

    return {
      ...state,
      confirmedLetters: newConfirmedLetters,
    }
  } else {
    // Wrong guess
    const newGuessedLetters = new Set(state.guessedLetters)
    newGuessedLetters.add(upperLetter)

    const newWrongGuesses = state.wrongGuesses + 1

    const newStatus = calculateGameStatus(
      state.word,
      state.revealedLetters,
      newWrongGuesses,
      state.maxWrongGuesses
    )

    return {
      ...state,
      guessedLetters: newGuessedLetters,
      wrongGuesses: newWrongGuesses,
      status: newStatus,
      endTime: newStatus !== 'playing' ? Date.now() : null,
    }
  }
}

function calculateGameStatus(
  word: string,
  revealedLetters: Set<string>,
  wrongGuesses: number,
  maxWrongGuesses: number
): GameStatus {
  // Lost - too many wrong guesses
  if (wrongGuesses >= maxWrongGuesses) {
    return 'lost'
  }

  // Won - all letters revealed
  const wordLetters = new Set(word.replace(/[^A-Z]/g, ''))
  const allLettersRevealed = Array.from(wordLetters).every((letter) =>
    revealedLetters.has(letter)
  )

  if (allLettersRevealed) {
    return 'won'
  }

  return 'playing'
}

export function getDisplayWord(word: string, revealedLetters: Set<string>): string[] {
  return word.split('').map((char) => {
    if (char === ' ') return ' '
    if (!/[A-Z]/.test(char)) return char
    return revealedLetters.has(char) ? char : '_'
  })
}

export function getLetterStatus(
  letter: string,
  word: string,
  guessedLetters: Set<string>,
  confirmedLetters: Set<string>,
  revealedLetters: Set<string>
): 'unused' | 'confirmed' | 'revealed' | 'wrong' {
  const upperLetter = letter.toUpperCase()

  if (revealedLetters.has(upperLetter)) {
    return 'revealed'  // Green
  }

  if (confirmedLetters.has(upperLetter)) {
    return 'confirmed'  // Yellow
  }

  if (guessedLetters.has(upperLetter)) {
    return 'wrong'  // Gray/red
  }

  return 'unused'
}

export function calculateDuration(startTime: number, endTime: number | null): number {
  const end = endTime || Date.now()
  return Math.floor((end - startTime) / 1000)
}

export function generateShareText(
  gameNumber: number,
  won: boolean,
  wrongGuesses: number,
  maxWrongGuesses: number,
  isDaily: boolean
): string {
  const squares = Array(maxWrongGuesses)
    .fill('🟢')
    .map((_, i) => (i < wrongGuesses ? '🔴' : '🟢'))
    .join('')

  const result = won ? '✅' : '❌'
  const type = isDaily ? 'Daily' : 'Practice'

  return `Hangword ${type} #${gameNumber} ${result}\n${squares} ${wrongGuesses}/${maxWrongGuesses}\n\nPlay at hangword.app`
}

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]
