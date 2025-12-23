import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default async function GamificationPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'student') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  // Fetch leaderboard stats
  const { data: stats } = await supabase
    .from('leaderboard_stats')
    .select('*')
    .eq('student_id', profile.id)
    .single()

  // Fetch badges
  const { data: studentBadges } = await supabase
    .from('student_badges')
    .select(`
      *,
      badges:badge_id (
        name,
        description,
        icon,
        tier
      )
    `)
    .eq('student_id', profile.id)
    .order('earned_at', { ascending: false })

  // Fetch skills
  const { data: studentSkills } = await supabase
    .from('student_skills')
    .select(`
      *,
      skills:skill_id (
        name,
        category,
        description
      )
    `)
    .eq('student_id', profile.id)
    .order('proficiency_points', { ascending: false })
    .limit(10)

  // Fetch recent point history
  const { data: pointHistory } = await supabase
    .from('point_history')
    .select('*')
    .eq('student_id', profile.id)
    .order('earned_at', { ascending: false })
    .limit(10)

  const totalPoints = stats?.total_points || 0
  const currentStreak = stats?.current_streak || 0
  const longestStreak = stats?.longest_streak || 0
  const badgeCount = studentBadges?.length || 0
  const coursesCompleted = stats?.courses_completed || 0

  // Calculate next level
  const currentLevel = Math.floor(totalPoints / 1000) + 1
  const pointsForNextLevel = currentLevel * 1000
  const pointsInCurrentLevel = totalPoints % 1000
  const progressToNextLevel = (pointsInCurrentLevel / 1000) * 100

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
          <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your achievements and level up your cybersecurity skills
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Level {currentLevel}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
              <p className="text-xs text-gray-500 mt-1">
                Best: {longestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{badgeCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                Across all tiers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Courses Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{coursesCompleted}</div>
              <p className="text-xs text-gray-500 mt-1">
                With certificates
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                {1000 - pointsInCurrentLevel} points to Level {currentLevel + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Level {currentLevel}</span>
                    <span className="text-gray-500">
                      {pointsInCurrentLevel} / 1000 XP
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-2xl font-bold">{currentLevel - 1}</p>
                    <p className="text-gray-500">Previous</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-2 border-blue-500">
                    <p className="text-2xl font-bold text-blue-600">{currentLevel}</p>
                    <p className="text-blue-600">Current</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-2xl font-bold">{currentLevel + 1}</p>
                    <p className="text-gray-500">Next</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Explore More</CardTitle>
              <CardDescription>Dive deeper into your achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  🏆 View Leaderboard
                </Button>
              </Link>
              <Link href="/skills">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  🎯 My Skills
                </Button>
              </Link>
              <Link href="/certificates">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  📜 My Certificates
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent>
            {!studentBadges || studentBadges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No badges earned yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete courses and quizzes to earn badges
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {studentBadges.slice(0, 10).map((sb: any) => {
                  const badge = sb.badges

                  return (
                    <div
                      key={sb.id}
                      className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className={`text-4xl mb-2 ${
                        badge.tier === 'bronze' ? 'text-orange-600' :
                        badge.tier === 'silver' ? 'text-gray-400' :
                        badge.tier === 'gold' ? 'text-yellow-500' :
                        'text-purple-500'
                      }`}>
                        {badge.icon || '🏅'}
                      </div>
                      <p className="font-medium text-sm text-center">{badge.name}</p>
                      <p className="text-xs text-gray-500 text-center capitalize mt-1">
                        {badge.tier}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
            {studentBadges && studentBadges.length > 10 && (
              <div className="text-center mt-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    View All Badges
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>Your strongest cybersecurity skills</CardDescription>
              </div>
              <Link href="/skills">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!studentSkills || studentSkills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No skills tracked yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete quizzes to develop your skills
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentSkills.slice(0, 5).map((ss: any) => {
                  const skill = ss.skills
                  const proficiencyPercent = Math.min((ss.proficiency_points / 200) * 100, 100)

                  return (
                    <div key={ss.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {ss.proficiency_level} • {skill.category}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(proficiencyPercent)}%
                        </span>
                      </div>
                      <Progress value={proficiencyPercent} className="h-2" />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest point earnings</CardDescription>
          </CardHeader>
          <CardContent>
            {!pointHistory || pointHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No activity yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start learning to earn points
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pointHistory.map((ph: any) => (
                  <div
                    key={ph.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {ph.activity_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ph.earned_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{ph.points}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
