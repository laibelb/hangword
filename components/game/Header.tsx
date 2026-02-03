'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  streak?: number
}

export default function Header({ streak = 0 }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <header className="header">
      {streak > 0 && (
        <div className="streak-badge">
          <span>🔥</span>
          <span>{streak}</span>
        </div>
      )}
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>Hangword</Link>

      {/* Menu Button */}
      <button
        className="menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ fontSize: '24px' }}
      >
        ☰
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99
            }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '16px',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            minWidth: '160px',
            overflow: 'hidden'
          }}>
            <Link
              href="/play"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '14px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              🎮 Play
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '14px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              🏆 Leaderboard
            </Link>
            {loading ? null : user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  👤 Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    color: 'var(--text-light)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  color: 'var(--correct)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  )
}
