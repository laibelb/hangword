'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/game/Header'
import Gallows from '@/components/game/Gallows'

interface LiveGame {
  id: string
  room_code: string
  word_id: number
  player1_id: string
  player2_id: string | null
  current_turn: string
  guessed_letters: string[]
  wrong_count: number
  status: 'waiting' | 'playing' | 'won' | 'lost'
  winner_id: string | null
}

interface Word {
  word: string
  category: string
  hint: string
}

const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
const MAX_WRONG = 6

export default function LiveGamePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = (params.roomCode as string).toUpperCase()

  const [user, setUser] = useState<any>(null)
  const [game, setGame] = useState<LiveGame | null>(null)
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [players, setPlayers] = useState<{ [key: string]: string }>({})

  const supabase = createClient()

  // Check if it's my turn
  const isMyTurn = user && game && game.current_turn === user.id
  const isPlayer1 = user && game && game.player1_id === user.id
  const isPlayer2 = user && game && game.player2_id === user.id
  const isInGame = isPlayer1 || isPlayer2

  // Load game and subscribe to updates
  useEffect(() => {
    const init = async () => {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (!currentUser) {
        router.push(`/login?redirectTo=/play/live/${roomCode}`)
        return
      }

      // Load game
      const { data: gameData, error: gameError } = await supabase
        .from('live_games')
        .select('*')
        .eq('room_code', roomCode)
        .single()

      if (gameError || !gameData) {
        setError('Room not found')
        setLoading(false)
        return
      }

      setGame(gameData)

      // Load word
      const { data: wordData } = await supabase
        .from('words')
        .select('word, category, hint')
        .eq('id', gameData.word_id)
        .single()

      if (wordData) {
        setWord(wordData)
      }

      // Load player usernames
      const playerIds = [gameData.player1_id, gameData.player2_id].filter(Boolean)
      if (playerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', playerIds)

        if (profiles) {
          const playerMap: { [key: string]: string } = {}
          profiles.forEach((p: any) => {
            playerMap[p.id] = p.username || 'Player'
          })
          setPlayers(playerMap)
        }
      }

      setLoading(false)
    }

    init()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`live_game_${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_games',
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          console.log('Game update:', payload)
          if (payload.new) {
            setGame(payload.new as LiveGame)

            // Reload players if player2 just joined
            if ((payload.new as LiveGame).player2_id && !(payload.old as any)?.player2_id) {
              supabase
                .from('profiles')
                .select('id, username')
                .eq('id', (payload.new as LiveGame).player2_id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    setPlayers(prev => ({ ...prev, [data.id]: data.username || 'Player' }))
                  }
                })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode, supabase, router])

  const handleGuess = useCallback(async (letter: string) => {
    if (!game || !word || !isMyTurn || game.status !== 'playing') return
    if (game.guessed_letters.includes(letter)) return

    const newGuessedLetters = [...game.guessed_letters, letter]
    const isCorrect = word.word.toUpperCase().includes(letter)
    const newWrongCount = isCorrect ? game.wrong_count : game.wrong_count + 1

    // Check win/lose
    const wordLetters = new Set(word.word.toUpperCase().split(''))
    const guessedSet = new Set(newGuessedLetters)
    const allGuessed = [...wordLetters].every(l => guessedSet.has(l))

    let newStatus: 'waiting' | 'playing' | 'won' | 'lost' = game.status
    let winnerId: string | null = null

    if (allGuessed) {
      newStatus = 'won'
      winnerId = user.id
    } else if (newWrongCount >= MAX_WRONG) {
      newStatus = 'lost'
    }

    // Switch turn to other player
    const nextTurn = game.player1_id === user.id ? game.player2_id : game.player1_id

    const { error } = await supabase
      .from('live_games')
      .update({
        guessed_letters: newGuessedLetters,
        wrong_count: newWrongCount,
        current_turn: newStatus === 'playing' ? nextTurn : game.current_turn,
        status: newStatus,
        winner_id: winnerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', game.id)

    if (error) {
      console.error('Error updating game:', error)
    }
  }, [game, word, isMyTurn, user, supabase])

  // Keyboard handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isMyTurn || game?.status !== 'playing') return
      const letter = e.key.toUpperCase()
      if (/^[A-Z]$/.test(letter)) {
        handleGuess(letter)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isMyTurn, game?.status, handleGuess])

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="category">Loading...</p>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <p style={{ color: '#c53030', marginBottom: '16px' }}>{error}</p>
          <Link href="/play/live" style={{ color: 'var(--correct)' }}>Back to Lobby</Link>
        </main>
      </>
    )
  }

  if (!game || !word) return null

  const guessedSet = new Set(game.guessed_letters)

  return (
    <>
      <Header />
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
        {/* Room Code */}
        <div style={{
          background: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--text-light)'
        }}>
          Room: <span style={{ fontWeight: 600, letterSpacing: '2px' }}>{roomCode}</span>
        </div>

        {/* Waiting for player */}
        {game.status === 'waiting' && (
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center',
            width: '100%'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Waiting for opponent...</p>
            <p style={{ fontSize: '14px' }}>Share this code: <strong>{roomCode}</strong></p>
          </div>
        )}

        {/* Players */}
        {game.status !== 'waiting' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '16px',
            width: '100%'
          }}>
            <PlayerBadge
              name={players[game.player1_id] || 'Player 1'}
              isCurrentTurn={game.current_turn === game.player1_id}
              isYou={game.player1_id === user?.id}
            />
            <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>vs</span>
            <PlayerBadge
              name={players[game.player2_id!] || 'Player 2'}
              isCurrentTurn={game.current_turn === game.player2_id}
              isYou={game.player2_id === user?.id}
            />
          </div>
        )}

        {/* Turn indicator */}
        {game.status === 'playing' && (
          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 600,
            background: isMyTurn ? '#dcfce7' : '#f3f4f6',
            color: isMyTurn ? '#16a34a' : 'var(--text-light)'
          }}>
            {isMyTurn ? "Your turn!" : "Opponent's turn..."}
          </div>
        )}

        {/* Category */}
        <p className="category">{word.category}</p>

        {/* Gallows */}
        <Gallows wrongGuesses={game.wrong_count} />

        {/* Word Display */}
        <div className="word-container">
          {word.word.split('').map((char, index) => {
            const upper = char.toUpperCase()
            const isGuessed = guessedSet.has(upper)
            const showLetter = isGuessed || game.status === 'lost'

            return (
              <div
                key={index}
                className={`letter-slot ${isGuessed ? 'revealed correct' : ''} ${game.status === 'lost' && !isGuessed ? 'revealed wrong' : ''}`}
              >
                {showLetter ? upper : ''}
              </div>
            )
          })}
        </div>

        {/* Guesses remaining */}
        <div className="guesses-remaining">
          <span>Guesses left:</span>
          <div className="guess-dots">
            {Array.from({ length: MAX_WRONG }).map((_, i) => (
              <div key={i} className={`guess-dot ${i < game.wrong_count ? 'used' : ''}`} />
            ))}
          </div>
        </div>

        {/* Game Over */}
        {(game.status === 'won' || game.status === 'lost') && (
          <div style={{
            background: game.status === 'won' ? '#dcfce7' : '#fef2f2',
            color: game.status === 'won' ? '#16a34a' : '#dc2626',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '16px',
            textAlign: 'center',
            width: '100%'
          }}>
            {game.status === 'won' ? (
              <>
                <p style={{ fontSize: '24px', marginBottom: '4px' }}>🎉</p>
                <p style={{ fontWeight: 600 }}>
                  {game.winner_id === user?.id ? 'You won!' : `${players[game.winner_id!] || 'Opponent'} won!`}
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '24px', marginBottom: '4px' }}>😔</p>
                <p style={{ fontWeight: 600 }}>Game Over</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>The word was: <strong>{word.word}</strong></p>
              </>
            )}
          </div>
        )}

        {/* Keyboard */}
        {game.status === 'playing' && (
          <div className="keyboard" style={{ opacity: isMyTurn ? 1 : 0.5, pointerEvents: isMyTurn ? 'auto' : 'none' }}>
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {row.split('').map((letter) => {
                  const isGuessed = guessedSet.has(letter)
                  const isCorrect = isGuessed && word.word.toUpperCase().includes(letter)
                  const isWrong = isGuessed && !word.word.toUpperCase().includes(letter)

                  return (
                    <button
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={isGuessed || !isMyTurn}
                      className={`key ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* Play Again */}
        {(game.status === 'won' || game.status === 'lost') && (
          <Link href="/play/live" className="btn-primary" style={{ marginTop: '16px' }}>
            Play Again
          </Link>
        )}
      </main>
    </>
  )
}

function PlayerBadge({ name, isCurrentTurn, isYou }: { name: string; isCurrentTurn: boolean; isYou: boolean }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: isCurrentTurn ? 'var(--correct)' : 'var(--border)',
        color: isCurrentTurn ? 'white' : 'var(--text-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 600,
        border: isCurrentTurn ? '3px solid var(--correct)' : '3px solid transparent',
        boxShadow: isCurrentTurn ? '0 0 0 3px rgba(106, 170, 100, 0.3)' : 'none'
      }}>
        {name[0].toUpperCase()}
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
        {name} {isYou && '(you)'}
      </span>
    </div>
  )
}
