import { getLeaderboard, getStudentRank } from '@/lib/actions/gamification'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const rankEmojis = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export async function Leaderboard({ studentId, limit = 10 }: { studentId?: string; limit?: number }) {
  const { data: leaderboard } = await getLeaderboard(limit, 'all')
  const studentRankData = studentId ? await getStudentRank(studentId) : null

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top cybersecurity learners</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No leaderboard data yet</p>
        </CardContent>
      </Card>
    )
  }

  const studentInTop10 = leaderboard.find(entry => entry.student_id === studentId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top cybersecurity learners</CardDescription>
        {studentId && studentRankData?.rank && !studentInTop10 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your rank: #{studentRankData.rank}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isCurrentStudent = entry.student_id === studentId
            const profile = entry.profiles as any

            return (
              <div
                key={entry.student_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCurrentStudent
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 font-bold">
                    {entry.rank && entry.rank <= 3 ? (
                      <span className="text-xl">{rankEmojis[entry.rank as keyof typeof rankEmojis]}</span>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">#{entry.rank}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isCurrentStudent ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                      {profile?.full_name || 'Anonymous'}
                      {isCurrentStudent && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>🏆 {entry.badges_earned} badges</span>
                      <span>📚 {entry.courses_completed} courses</span>
                      <span>🔥 {entry.current_streak_days} days</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-amber-600 dark:text-amber-400">
                    {entry.total_points.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
