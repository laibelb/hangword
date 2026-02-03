'use client'

import Link from 'next/link'
import { Challenge, ChallengeResult } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatRelativeTime } from '@/lib/utils'

interface ChallengeCardProps {
  challenge: Challenge
  currentUserId: string
}

export default function ChallengeCard({ challenge, currentUserId }: ChallengeCardProps) {
  const isChallenger = challenge.challenger_id === currentUserId
  const opponent = isChallenger ? challenge.challenged : challenge.challenger
  const myResult = isChallenger ? challenge.challenger_result : challenge.challenged_result
  const opponentResult = isChallenger ? challenge.challenged_result : challenge.challenger_result

  const needsToPlay = !myResult && challenge.status === 'pending'
  const waitingForOpponent = myResult && !opponentResult && challenge.status === 'pending'
  const isCompleted = challenge.status === 'completed'

  const getWinner = () => {
    if (!challenge.challenger_result || !challenge.challenged_result) return null

    const challengerWon = challenge.challenger_result.won
    const challengedWon = challenge.challenged_result.won

    if (challengerWon && !challengedWon) return 'challenger'
    if (!challengerWon && challengedWon) return 'challenged'
    if (!challengerWon && !challengedWon) return 'tie'

    // Both won - compare wrong guesses, then duration
    const challengerScore = challenge.challenger_result.wrong_count
    const challengedScore = challenge.challenged_result.wrong_count

    if (challengerScore < challengedScore) return 'challenger'
    if (challengedScore < challengerScore) return 'challenged'

    // Same wrong guesses - compare time
    const challengerTime = challenge.challenger_result.duration
    const challengedTime = challenge.challenged_result.duration

    if (challengerTime < challengedTime) return 'challenger'
    if (challengedTime < challengerTime) return 'challenged'

    return 'tie'
  }

  const winner = isCompleted ? getWinner() : null
  const didWin = winner && (
    (isChallenger && winner === 'challenger') ||
    (!isChallenger && winner === 'challenged')
  )

  return (
    <Card className={`${isCompleted ? 'opacity-80' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Opponent Avatar */}
        <Avatar
          src={opponent?.avatar_url}
          name={opponent?.username || 'User'}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link
                href={`/profile/${opponent?.username}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
              >
                {opponent?.username || 'Anonymous'}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isChallenger ? 'You challenged' : 'Challenged you'} •{' '}
                {formatRelativeTime(challenge.created_at)}
              </p>
            </div>

            {/* Status Badge */}
            {isCompleted && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  didWin
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : winner === 'tie'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}
              >
                {didWin ? 'Won' : winner === 'tie' ? 'Tie' : 'Lost'}
              </span>
            )}
          </div>

          {/* Results Grid (if completed) */}
          {isCompleted && challenge.challenger_result && challenge.challenged_result && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <ResultColumn
                label="You"
                result={myResult!}
                isWinner={didWin || false}
              />
              <ResultColumn
                label={opponent?.username || 'Opponent'}
                result={opponentResult!}
                isWinner={!didWin && winner !== 'tie'}
              />
            </div>
          )}

          {/* Action Button */}
          {needsToPlay && (
            <Link href={`/challenges/${challenge.id}/play`}>
              <Button className="mt-3" size="sm">
                Play Challenge
              </Button>
            </Link>
          )}

          {waitingForOpponent && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Waiting for {opponent?.username} to play...
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

function ResultColumn({
  label,
  result,
  isWinner,
}: {
  label: string
  result: ChallengeResult
  isWinner: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <div className={`${isWinner ? 'text-green-600' : ''}`}>
        {result.won ? (
          <p className="font-semibold">
            {result.wrong_count}/6 • {result.duration}s
          </p>
        ) : (
          <p className="text-gray-500">Failed</p>
        )}
      </div>
    </div>
  )
}
