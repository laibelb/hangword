'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'

function NewChallengeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedUserId = searchParams.get('user')

  const [friends, setFriends] = useState<Profile[]>([])
  const [selectedFriend, setSelectedFriend] = useState<string | null>(preselectedUserId)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login?redirectTo=/challenges/new')
          return
        }

        // Get accepted friendships
        const { data: sentFriendships } = await supabase
          .from('friendships')
          .select(`
            friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
          `)
          .eq('user_id', user.id)
          .eq('status', 'accepted')

        const { data: receivedFriendships } = await supabase
          .from('friendships')
          .select(`
            friend:profiles!friendships_user_id_fkey(id, username, avatar_url)
          `)
          .eq('friend_id', user.id)
          .eq('status', 'accepted')

        const allFriends: Profile[] = []

        sentFriendships?.forEach((f: any) => {
          if (f.friend) allFriends.push(f.friend)
        })

        receivedFriendships?.forEach((f: any) => {
          if (f.friend) allFriends.push(f.friend)
        })

        setFriends(allFriends)
      } catch (err) {
        console.error('Error fetching friends:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFriends()
  }, [supabase, router])

  const handleCreateChallenge = async () => {
    if (!selectedFriend) return

    setCreating(true)
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenged_id: selectedFriend,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create challenge')
      }

      // Redirect to play the challenge
      router.push(`/challenges/${data.challenge.id}/play`)
    } catch (err: any) {
      console.error('Create challenge error:', err)
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/challenges" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Challenge</h1>
      </div>

      {friends.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Friends Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add friends to challenge them to word games!
            </p>
            <Link href="/friends/search" className="btn-primary">
              Find Friends
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select a Friend to Challenge
            </h2>
            <div className="space-y-2">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    selectedFriend === friend.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Avatar
                    src={friend.avatar_url}
                    name={friend.username || 'User'}
                    size="md"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {friend.username}
                  </span>
                  {selectedFriend === friend.id && (
                    <svg className="w-5 h-5 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Button
            onClick={handleCreateChallenge}
            disabled={!selectedFriend}
            loading={creating}
            className="w-full"
            size="lg"
          >
            Start Challenge
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            You&apos;ll play the word first, then your friend will try to beat your score!
          </p>
        </>
      )}
    </div>
  )
}

export default function NewChallengePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <NewChallengeContent />
    </Suspense>
  )
}
