import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'
import FriendsList from '@/components/social/FriendsList'

export default async function FriendsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/friends')
  }

  // Get friendships where user is the user_id (sent requests)
  const { data: sentFriendships } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
    `)
    .eq('user_id', user.id)

  // Get friendships where user is the friend_id (received requests)
  const { data: receivedFriendships } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:profiles!friendships_user_id_fkey(id, username, avatar_url)
    `)
    .eq('friend_id', user.id)

  // Combine and categorize friendships
  const allFriendships = [...(sentFriendships || []), ...(receivedFriendships || [])]

  const friends = allFriendships.filter((f) => f.status === 'accepted')
  const pendingReceived = (receivedFriendships || []).filter((f) => f.status === 'pending')
  const pendingSent = (sentFriendships || []).filter((f) => f.status === 'pending')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Friends</h1>
        <SearchFriendButton />
      </div>

      {/* Pending Requests */}
      {pendingReceived.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Friend Requests ({pendingReceived.length})
          </h2>
          <div className="space-y-3">
            {pendingReceived.map((friendship) => (
              <FriendRequestCard key={friendship.id} friendship={friendship} />
            ))}
          </div>
        </Card>
      )}

      {/* Pending Sent */}
      {pendingSent.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Requests ({pendingSent.length})
          </h2>
          <div className="space-y-3">
            {pendingSent.map((friendship) => (
              <div
                key={friendship.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={friendship.friend?.avatar_url}
                    name={friendship.friend?.username || 'User'}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {friendship.friend?.username || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sent {formatRelativeTime(friendship.created_at)}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Friends ({friends.length})
        </h2>
        <FriendsList friends={friends} currentUserId={user.id} />
      </Card>
    </div>
  )
}

function SearchFriendButton() {
  return (
    <Link href="/friends/search">
      <Button>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Find Friends
      </Button>
    </Link>
  )
}

async function FriendRequestCard({ friendship }: { friendship: any }) {
  return (
    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
      <div className="flex items-center space-x-3">
        <Avatar
          src={friendship.friend?.avatar_url}
          name={friendship.friend?.username || 'User'}
          size="md"
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {friendship.friend?.username || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatRelativeTime(friendship.created_at)}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <AcceptFriendButton friendshipId={friendship.id} />
        <DeclineFriendButton friendshipId={friendship.id} />
      </div>
    </div>
  )
}

function AcceptFriendButton({ friendshipId }: { friendshipId: string }) {
  return (
    <form
      action={async () => {
        'use server'
        const supabase = await createClient()
        await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', friendshipId)
      }}
    >
      <Button type="submit" size="sm">Accept</Button>
    </form>
  )
}

function DeclineFriendButton({ friendshipId }: { friendshipId: string }) {
  return (
    <form
      action={async () => {
        'use server'
        const supabase = await createClient()
        await supabase
          .from('friendships')
          .delete()
          .eq('id', friendshipId)
      }}
    >
      <Button type="submit" variant="ghost" size="sm">Decline</Button>
    </form>
  )
}
