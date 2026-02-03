import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { formatDate, calculateWinRate } from '@/lib/utils'

interface PublicProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  // Check friendship status
  let friendshipStatus: string | null = null
  if (currentUser && currentUser.id !== profile.id) {
    const { data: friendship } = await supabase
      .from('friendships')
      .select('status')
      .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUser.id})`)
      .single()

    friendshipStatus = friendship?.status || null
  }

  const winRate = stats ? calculateWinRate(stats.games_won, stats.games_played) : 0
  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar
            src={profile.avatar_url}
            name={profile.username || 'User'}
            size="xl"
          />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.username}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && currentUser && (
            <div className="flex space-x-2">
              {friendshipStatus === 'accepted' ? (
                <Link href={`/challenges/new?user=${profile.id}`}>
                  <Button variant="primary">Challenge</Button>
                </Link>
              ) : friendshipStatus === 'pending' ? (
                <Button variant="secondary" disabled>
                  Request Pending
                </Button>
              ) : (
                <AddFriendButton profileId={profile.id} />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="Games Played" value={stats?.games_played || 0} />
          <StatBox label="Games Won" value={stats?.games_won || 0} />
          <StatBox label="Win Rate" value={`${winRate}%`} />
          <StatBox label="Best Streak" value={stats?.max_streak || 0} icon="🔥" />
        </div>
      </Card>
    </div>
  )
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: string
}) {
  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}

function AddFriendButton({ profileId }: { profileId: string }) {
  return (
    <form
      action={async () => {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        await supabase.from('friendships').insert({
          user_id: user.id,
          friend_id: profileId,
          status: 'pending',
        })
      }}
    >
      <Button type="submit" variant="secondary">
        Add Friend
      </Button>
    </form>
  )
}
