'use client'

import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

interface Friend {
  id: string
  user_id: string
  friend_id: string
  friend?: {
    id: string
    username: string | null
    avatar_url: string | null
  }
}

interface FriendsListProps {
  friends: Friend[]
  currentUserId: string
}

export default function FriendsList({ friends, currentUserId }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          You haven&apos;t added any friends yet.
        </p>
        <Link href="/friends/search" className="link">
          Find friends to challenge
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {friends.map((friendship) => {
        const friend = friendship.friend
        if (!friend) return null

        return (
          <div
            key={friendship.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Link
              href={`/profile/${friend.username}`}
              className="flex items-center space-x-3 flex-1"
            >
              <Avatar
                src={friend.avatar_url}
                name={friend.username || 'User'}
                size="md"
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {friend.username || 'Anonymous'}
              </span>
            </Link>
            <Link href={`/challenges/new?user=${friend.id}`}>
              <Button size="sm" variant="outline">
                Challenge
              </Button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
