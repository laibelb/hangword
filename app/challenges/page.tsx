import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import ChallengeCard from '@/components/social/ChallengeCard'

export default async function ChallengesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/challenges')
  }

  // Get all challenges for the user
  const { data: challenges } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:profiles!challenges_challenger_id_fkey(id, username, avatar_url),
      challenged:profiles!challenges_challenged_id_fkey(id, username, avatar_url),
      word:words(id, word, category, hint, difficulty)
    `)
    .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Categorize challenges
  const pendingChallenges = (challenges || []).filter((c) => {
    if (c.status !== 'pending') return false
    // Show if user is challenged and hasn't played
    if (c.challenged_id === user.id && !c.challenged_result) return true
    // Show if user is challenger and waiting for response
    if (c.challenger_id === user.id && !c.challenged_result) return true
    return false
  })

  const completedChallenges = (challenges || []).filter((c) => c.status === 'completed')
  const expiredChallenges = (challenges || []).filter((c) => c.status === 'expired')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenges</h1>
        <Link href="/challenges/new" className="btn-primary">
          New Challenge
        </Link>
      </div>

      {/* Active Challenges */}
      {pendingChallenges.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active ({pendingChallenges.length})
          </h2>
          <div className="space-y-4">
            {pendingChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                currentUserId={user.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed ({completedChallenges.length})
          </h2>
          <div className="space-y-4">
            {completedChallenges.slice(0, 10).map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                currentUserId={user.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!challenges || challenges.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Challenges Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Challenge a friend to see who can solve the word first!
            </p>
            <Link href="/challenges/new" className="btn-primary">
              Create Your First Challenge
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
