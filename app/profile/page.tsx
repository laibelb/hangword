'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/game/Header'

interface Stats {
  games_played: number
  games_won: number
  current_streak: number
  max_streak: number
  daily_games_played: number
  daily_games_won: number
}

interface Game {
  id: string
  won: boolean
  wrong_count: number
  is_daily: boolean
  completed_at: string
  word?: { word: string; category: string }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [localStats, setLocalStats] = useState({ played: 0, won: 0, streak: 0 })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Load local stats
    const saved = localStorage.getItem('hangword-stats')
    if (saved) {
      const data = JSON.parse(saved)
      setLocalStats({
        played: data.played || 0,
        won: data.won || 0,
        streak: data.streak || 0
      })
    }

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUser(user)

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setStats(statsData)

      // Get recent games
      const { data: gamesData } = await supabase
        .from('games')
        .select(`*, word:words(word, category)`)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10)

      setRecentGames(gamesData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <>
        <Header streak={localStats.streak} />
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <p className="category">Loading...</p>
        </main>
      </>
    )
  }

  // Show local stats for non-logged in users
  if (!user) {
    return (
      <>
        <Header streak={localStats.streak} />
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 20px',
          maxWidth: '400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Your Stats</h2>

          {/* Local Stats */}
          <div style={{
            width: '100%',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            background: 'white',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div className="stat-value">{localStats.played}</div>
                <div className="stat-label">Played</div>
              </div>
              <div>
                <div className="stat-value">{localStats.won}</div>
                <div className="stat-label">Won</div>
              </div>
              <div>
                <div className="stat-value">{localStats.streak}</div>
                <div className="stat-label">Streak</div>
              </div>
            </div>
          </div>

          {/* Sign in prompt */}
          <div style={{
            width: '100%',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            background: 'white',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
              Sign in to sync your stats across devices and appear on the leaderboard!
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', padding: '12px 32px' }}>
              Sign In
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header streak={stats?.current_streak || localStats.streak} />
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        maxWidth: '500px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--correct)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            {(profile?.username || user.email || 'U')[0].toUpperCase()}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
            {profile?.username || 'Player'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div style={{
          width: '100%',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'white',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            background: '#f9fafb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Stats
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <StatBox label="Played" value={stats?.games_played || localStats.played} />
              <StatBox label="Won" value={stats?.games_won || localStats.won} color="green" />
              <StatBox label="Current Streak" value={stats?.current_streak || localStats.streak} icon="🔥" />
              <StatBox label="Best Streak" value={stats?.max_streak || 0} icon="🏆" />
            </div>
          </div>
        </div>

        {/* Recent Games */}
        <div style={{
          width: '100%',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'white'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            background: '#f9fafb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Games
            </h3>
          </div>
          {recentGames.length > 0 ? (
            <div>
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      background: game.won ? '#dcfce7' : '#fef2f2',
                      color: game.won ? '#16a34a' : '#dc2626'
                    }}>
                      {game.won ? '✓' : '✗'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                        {game.word?.word || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                        {game.word?.category} • {game.is_daily ? 'Daily' : 'Practice'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    {game.wrong_count}/6
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '12px' }}>No games played yet</p>
              <Link href="/play" style={{ color: 'var(--correct)', fontWeight: 500 }}>Start playing!</Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function StatBox({ label, value, color, icon }: { label: string; value: number | string; color?: string; icon?: string }) {
  return (
    <div style={{
      background: '#f9fafb',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: color === 'green' ? 'var(--correct)' : 'var(--text)'
      }}>
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  )
}
