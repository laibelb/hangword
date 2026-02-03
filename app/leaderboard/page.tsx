'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/game/Header'

type LeaderboardType = 'daily' | 'weekly' | 'alltime'

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  value: number
}

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('daily')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const saved = localStorage.getItem('hangword-stats')
    if (saved) {
      const stats = JSON.parse(saved)
      setStreak(stats.streak || 0)
    }
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_leaderboard', {
          p_type: leaderboardType,
          p_limit: 20,
        })

        if (error) throw error
        setEntries(data || [])
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [leaderboardType, supabase])

  const tabs = [
    { type: 'daily' as LeaderboardType, label: 'Today' },
    { type: 'weekly' as LeaderboardType, label: 'This Week' },
    { type: 'alltime' as LeaderboardType, label: 'All Time' },
  ]

  const formatValue = (type: LeaderboardType, value: number) => {
    if (type === 'daily') {
      const mins = Math.floor(value / 60)
      const secs = value % 60
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    }
    return value.toString()
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <>
      <Header streak={streak} />
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
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Leaderboard</h2>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          background: '#f3f4f6',
          borderRadius: '12px',
          marginBottom: '24px',
          width: '100%'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setLeaderboardType(tab.type)}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                background: leaderboardType === tab.type ? 'white' : 'transparent',
                color: leaderboardType === tab.type ? 'var(--text)' : 'var(--text-light)',
                boxShadow: leaderboardType === tab.type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div style={{
          width: '100%',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'white'
        }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p className="category">Loading...</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
                No entries yet. Be the first to play!
              </p>
              <Link href="/play" style={{ color: 'var(--correct)', fontWeight: 500 }}>
                Play Now
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px',
                padding: '12px 16px',
                background: '#f9fafb',
                borderBottom: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div>Rank</div>
                <div>Player</div>
                <div style={{ textAlign: 'right' }}>
                  {leaderboardType === 'daily' ? 'Time' : 'Wins'}
                </div>
              </div>

              {/* Entries */}
              {entries.map((entry) => (
                <div
                  key={entry.user_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 80px',
                    padding: '12px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    background: entry.rank <= 3 ? (entry.rank === 1 ? '#fefce8' : entry.rank === 2 ? '#f9fafb' : '#fff7ed') : 'white'
                  }}
                >
                  <div style={{ fontSize: entry.rank <= 3 ? '20px' : '14px', fontWeight: 600, color: 'var(--text-light)' }}>
                    {getRankDisplay(entry.rank)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--correct)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {(entry.username || 'U')[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                      {entry.username || 'Anonymous'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                    {formatValue(leaderboardType, entry.value)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '24px' }}>
          <Link href="/play" className="btn-primary" style={{ display: 'inline-block', padding: '12px 32px' }}>
            Play Now
          </Link>
        </div>
      </main>
    </>
  )
}
