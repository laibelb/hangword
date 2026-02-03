'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'

export default function SearchFriendsPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id || '')
        .limit(10)

      if (error) throw error

      setResults(data || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      })

      if (error) throw error

      setSentRequests((prev) => new Set([...prev, friendId]))
    } catch (err) {
      console.error('Add friend error:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/friends" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Friends</h1>
      </div>

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="input flex-1"
          />
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </form>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Results ({results.length})
          </h2>
          <div className="space-y-3">
            {results.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <Link
                  href={`/profile/${profile.username}`}
                  className="flex items-center space-x-3"
                >
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.username || 'User'}
                    size="md"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {profile.username}
                  </span>
                </Link>
                {sentRequests.has(profile.id) ? (
                  <span className="text-sm text-gray-500">Request Sent</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddFriend(profile.id)}
                  >
                    Add Friend
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {query && results.length === 0 && !loading && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No users found matching &quot;{query}&quot;
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
