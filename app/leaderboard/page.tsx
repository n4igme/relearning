import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter: filterParam } = await searchParams
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'student') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const filter = filterParam || 'points'

  // Fetch leaderboard with profiles
  let query = supabase
    .from('leaderboard_stats')
    .select(`
      *,
      profiles:student_id (
        full_name,
        avatar_url
      )
    `)

  // Order by filter
  if (filter === 'points') {
    query = query.order('total_points', { ascending: false })
  } else if (filter === 'badges') {
    query = query.order('badges_earned', { ascending: false })
  } else if (filter === 'courses') {
    query = query.order('courses_completed', { ascending: false })
  } else if (filter === 'streak') {
    query = query.order('current_streak', { ascending: false })
  }

  const { data: leaderboard } = await query.limit(100)

  // Get current user's rank and stats
  const currentUserStats = leaderboard?.find((entry: any) => entry.student_id === profile.id)
  const currentUserRank = leaderboard?.findIndex((entry: any) => entry.student_id === profile.id) ?? -1

  const filters = [
    { id: 'points', label: 'Total Points', icon: '💎' },
    { id: 'badges', label: 'Badges', icon: '🏅' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'streak', label: 'Streak', icon: '🔥' },
  ]

  const getValue = (entry: any) => {
    if (filter === 'points') return entry.total_points.toLocaleString()
    if (filter === 'badges') return entry.badges_earned
    if (filter === 'courses') return entry.courses_completed
    if (filter === 'streak') return `${entry.current_streak} days`
    return entry.total_points.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold cursor-pointer">🛡️ CyberSec Academy</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">🏆 Leaderboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank among other cybersecurity learners
          </p>
        </div>

        {/* Your Rank Card */}
        {currentUserStats && (
          <Card className="mb-8 border-blue-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Your Rank</span>
                <span className="text-2xl">
                  {currentUserRank === 0 ? '🥇' : currentUserRank === 1 ? '🥈' : currentUserRank === 2 ? '🥉' : ''}
                </span>
              </CardTitle>
              <CardDescription>Your position on the leaderboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Rank</p>
                  <p className="text-2xl font-bold text-blue-600">#{currentUserRank + 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Points</p>
                  <p className="text-2xl font-bold">{currentUserStats.total_points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Badges</p>
                  <p className="text-2xl font-bold">{currentUserStats.badges_earned}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Courses</p>
                  <p className="text-2xl font-bold">{currentUserStats.courses_completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {filters.map((f) => (
                <Link key={f.id} href={`/leaderboard?filter=${f.id}`}>
                  <Button
                    variant={filter === f.id ? 'default' : 'outline'}
                    className="gap-2"
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top 100 Rankings</CardTitle>
            <CardDescription>
              Sorted by {filters.find(f => f.id === filter)?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No rankings available yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry: any, index: number) => {
                  const profile = entry.profiles
                  const isCurrentUser = entry.student_id === currentUserStats?.student_id
                  const rank = index + 1

                  return (
                    <div
                      key={entry.student_id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        isCurrentUser
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-12 text-center">
                        {rank === 1 ? (
                          <span className="text-3xl">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-3xl">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-3xl">🥉</span>
                        ) : (
                          <span className="text-xl font-bold text-gray-500">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          profile?.full_name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {profile?.full_name || 'Anonymous'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{entry.courses_completed} courses</span>
                          <span>•</span>
                          <span>{entry.badges_earned} badges</span>
                          {entry.current_streak > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">🔥 {entry.current_streak} day streak</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-right">
                        <p className="text-2xl font-bold">{getValue(entry)}</p>
                        {filter === 'points' && (
                          <p className="text-xs text-gray-500">points</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
