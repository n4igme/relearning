import { getStudentBadges } from '@/lib/actions/gamification'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tierColors = {
  bronze: 'bg-amber-700',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-cyan-500',
}

const tierEmojis = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
}

export async function BadgesShowcase({ studentId }: { studentId: string }) {
  const badgesData = await getStudentBadges(studentId)

  if (!badgesData.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievement Badges</CardTitle>
          <CardDescription>Your cybersecurity achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Unable to load badges</p>
        </CardContent>
      </Card>
    )
  }

  const { earned, locked } = badgesData
  const totalBadges = (earned?.length || 0) + (locked?.length || 0)
  const earnedCount = earned?.length || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Badges</CardTitle>
        <CardDescription>
          {earnedCount} / {totalBadges} badges unlocked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Earned Badges */}
        {earned && earned.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-green-600 dark:text-green-400">
              🎉 Earned Badges
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {earned.map((studentBadge) => {
                const badge = studentBadge.badges as any
                if (!badge) return null

                return (
                  <div
                    key={studentBadge.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-700"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${tierColors[badge.badge_tier]} flex items-center justify-center text-2xl`}>
                        {tierEmojis[badge.badge_tier]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{badge.name}</h4>
                        <Badge variant="secondary" className={`${tierColors[badge.badge_tier]} text-white text-xs`}>
                          {badge.badge_tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {badge.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>+{badge.points_reward} points</span>
                        <span>
                          Earned: {new Date(studentBadge.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {locked && locked.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-500">🔒 Locked Badges</h3>
            <div className="grid grid-cols-1 gap-3">
              {locked.slice(0, 5).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-2xl grayscale">
                      {tierEmojis[badge.badge_tier]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                        {badge.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {badge.badge_tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {badge.description}
                    </p>
                    <div className="text-xs text-gray-400 mt-2">
                      Reward: +{badge.points_reward} points
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {locked.length > 5 && (
              <p className="text-xs text-center text-gray-500">
                +{locked.length - 5} more locked badges
              </p>
            )}
          </div>
        )}

        {earned?.length === 0 && locked?.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No badges available yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
