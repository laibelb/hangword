'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/game/Header'

export default function PlayPage() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('hangword-stats')
    if (saved) {
      const stats = JSON.parse(saved)
      setStreak(stats.streak || 0)
    }
  }, [])

  return (
    <>
      <Header streak={streak} />
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
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Choose Your Mode</h2>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Daily Challenge */}
          <Link href="/play/daily" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '20px 24px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--correct)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#fef3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  📅
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Daily Challenge</span>
                    <span style={{
                      padding: '2px 8px',
                      background: '#fef3c7',
                      color: '#92400e',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>Featured</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Same word for everyone. One attempt per day.
                  </p>
                </div>
                <svg width="20" height="20" fill="none" stroke="var(--text-light)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Practice Mode */}
          <Link href="/play/practice" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '20px 24px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--correct)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#dcfce7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🔄
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Practice Mode</span>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Unlimited games with random words.
                  </p>
                </div>
                <svg width="20" height="20" fill="none" stroke="var(--text-light)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Live Multiplayer */}
          <Link href="/play/live" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '20px 24px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--correct)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#ede9fe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  👥
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Play Live</span>
                    <span style={{
                      padding: '2px 8px',
                      background: '#ede9fe',
                      color: '#7c3aed',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>New</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Turn-based multiplayer with a friend.
                  </p>
                </div>
                <svg width="20" height="20" fill="none" stroke="var(--text-light)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <QuickStats />
      </main>
    </>
  )
}

function QuickStats() {
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('hangword-stats')
    if (saved) {
      const data = JSON.parse(saved)
      setStats({
        played: data.played || 0,
        won: data.won || 0,
        streak: data.streak || 0
      })
    }
  }, [])

  if (stats.played === 0) return null

  return (
    <div style={{
      marginTop: '32px',
      padding: '20px',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      width: '100%',
      background: 'white'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Your Stats
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <div className="stat-value">{stats.played}</div>
          <div className="stat-label">Played</div>
        </div>
        <div>
          <div className="stat-value">{stats.won}</div>
          <div className="stat-label">Won</div>
        </div>
        <div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Streak</div>
        </div>
      </div>
    </div>
  )
}
