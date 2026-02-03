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
    wrongGuesses: 0,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    status: 'playing',
    startTime: Date.now(),
    endTime: null,
  }
}

export function processGuess(state: GameState, letter: string): GameState {
  const upperLetter = letter.toUpperCase()

  // Already guessed this letter
  if (state.guessedLetters.has(upperLetter)) {
    return state
  }

  // Game already over
  if (state.status !== 'playing') {
    return state
  }

  const newGuessedLetters = new Set(state.guessedLetters)
  newGuessedLetters.add(upperLetter)

  const isWrongGuess = !state.word.includes(upperLetter)
  const newWrongGuesses = isWrongGuess
    ? state.wrongGuesses + 1
    : state.wrongGuesses

  const newStatus = calculateGameStatus(
    state.word,
    newGuessedLetters,
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

function calculateGameStatus(
  word: string,
  guessedLetters: Set<string>,
  wrongGuesses: number,
  maxWrongGuesses: number
): GameStatus {
  // Lost - too many wrong guesses
  if (wrongGuesses >= maxWrongGuesses) {
    return 'lost'
  }

  // Won - all letters guessed
  const wordLetters = new Set(word.replace(/[^A-Z]/g, ''))
  const allLettersGuessed = Array.from(wordLetters).every((letter) =>
    guessedLetters.has(letter)
  )

  if (allLettersGuessed) {
    return 'won'
  }

  return 'playing'
}

export function getDisplayWord(word: string, guessedLetters: Set<string>): string[] {
  return word.split('').map((char) => {
    if (char === ' ') return ' '
    if (!/[A-Z]/.test(char)) return char
    return guessedLetters.has(char) ? char : '_'
  })
}

export function getLetterStatus(
  letter: string,
  word: string,
  guessedLetters: Set<string>
): 'unused' | 'correct' | 'wrong' {
  const upperLetter = letter.toUpperCase()

  if (!guessedLetters.has(upperLetter)) {
    return 'unused'
  }

  return word.includes(upperLetter) ? 'correct' : 'wrong'
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
