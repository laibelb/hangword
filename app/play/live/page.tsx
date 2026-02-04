'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/game/Header'

// Generate or get guest ID from localStorage
function getGuestId(): string {
  if (typeof window === 'undefined') return ''
  let guestId = localStorage.getItem('hangword-guest-id')
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('hangword-guest-id', guestId)
  }
  return guestId
}

export default function LiveLobbyPage() {
  const [user, setUser] = useState<any>(null)
  const [guestId, setGuestId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setGuestId(getGuestId())

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  const handleCreateRoom = async () => {
    setCreating(true)
    setError('')

    try {
      // Get a random word using database randomization
      const { data: wordData, error: wordError } = await supabase
        .rpc('get_any_random_word')
        .single()

      if (wordError || !wordData) throw wordError || new Error('No word found')

      const code = generateRoomCode()

      // Create the room - use user ID if signed in, guest ID if not
      const { data: room, error: roomError } = await supabase
        .from('live_games')
        .insert({
          room_code: code,
          word_id: wordData.word_id,
          player1_id: user?.id || null,
          player1_guest_id: user ? null : guestId,
          current_turn: user?.id || guestId,
          status: 'waiting'
        })
        .select()
        .single()

      if (roomError) throw roomError

      router.push(`/play/live/${code}`)
    } catch (err: any) {
      console.error('Error creating room:', err)
      setError(err.message || 'Failed to create room')
      setCreating(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setJoining(true)
    setError('')

    try {
      const code = roomCode.toUpperCase().trim()

      // Find the room
      const { data: room, error: findError } = await supabase
        .from('live_games')
        .select('*')
        .eq('room_code', code)
        .single()

      if (findError || !room) {
        throw new Error('Room not found')
      }

      if (room.status !== 'waiting') {
        throw new Error('This game has already started')
      }

      // Check if already in this room
      const isPlayer1 = (user && room.player1_id === user.id) ||
                        (!user && room.player1_guest_id === guestId)

      if (isPlayer1) {
        router.push(`/play/live/${code}`)
        return
      }

      // Join the room
      const { error: joinError } = await supabase
        .from('live_games')
        .update({
          player2_id: user?.id || null,
          player2_guest_id: user ? null : guestId,
          status: 'playing',
          updated_at: new Date().toISOString()
        })
        .eq('room_code', code)
        .eq('status', 'waiting')

      if (joinError) throw joinError

      router.push(`/play/live/${code}`)
    } catch (err: any) {
      console.error('Error joining room:', err)
      setError(err.message || 'Failed to join room')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p className="category">Loading...</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Play Live</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-light)', marginBottom: '32px', textAlign: 'center' }}>
          Take turns guessing letters with a friend in real-time!
        </p>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#c53030',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            width: '100%',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {!user && (
          <div style={{
            background: '#f0fdf4',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            width: '100%',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Playing as guest.{' '}
            <Link href="/login?redirectTo=/play/live" style={{ color: '#166534', fontWeight: 600 }}>
              Sign in
            </Link> to save your stats!
          </div>
        )}

        {/* Create Room */}
        <button
          onClick={handleCreateRoom}
          disabled={creating}
          className="btn-primary"
          style={{ marginBottom: '24px' }}
        >
          {creating ? 'Creating...' : 'Create Room'}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          margin: '0 0 24px 0',
          gap: '16px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>or join a room</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Join Room */}
        <form onSubmit={handleJoinRoom} style={{ width: '100%' }}>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            maxLength={6}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '18px',
              textAlign: 'center',
              letterSpacing: '4px',
              fontWeight: 600,
              marginBottom: '12px',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            disabled={joining || !roomCode.trim()}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'white',
              color: 'var(--text)',
              fontFamily: 'inherit',
              opacity: joining || !roomCode.trim() ? 0.5 : 1
            }}
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>

        <Link
          href="/play"
          style={{
            marginTop: '32px',
            fontSize: '14px',
            color: 'var(--text-light)'
          }}
        >
          ← Back to Play
        </Link>
      </main>
    </>
  )
}
