import { getUserProfile, signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { SkillProgress } from '@/components/skill-progress'
import { Leaderboard } from '@/components/leaderboard'
import { BadgesShowcase } from '@/components/badges-showcase'

export default async function DashboardPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛡️ CyberSec Academy</h1>
          <form action={signOut}>
            <Button variant="outline">Sign Out</Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back, {profile.full_name}!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your role: <span className="font-medium capitalize">{profile.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Account Status:</span>
                <p className={`font-medium ${profile.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profile.is_approved ? 'Approved' : 'Pending Approval'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Active:</span>
                <p className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {profile.is_active ? 'Yes' : 'No'}
                </p>
              </div>
            </CardContent>
          </Card>

          {profile.role === 'student' && (
            <>
              {/* Leaderboard - Full width */}
              <div className="md:col-span-2 lg:col-span-3">
                <Leaderboard studentId={profile.id} limit={10} />
              </div>

              {/* Skill Progress - Full width */}
              <div className="md:col-span-2 lg:col-span-3">
                <SkillProgress studentId={profile.id} />
              </div>

              {/* Badges Showcase - Full width */}
              <div className="md:col-span-2 lg:col-span-3">
                <BadgesShowcase studentId={profile.id} />
              </div>
            </>
          )}

          {profile.role === 'mentor' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Courses you teach</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No courses created yet</p>
                  <Button className="mt-4">Create Course</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>Total enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-sm text-gray-500 mt-2">Across all courses</p>
                </CardContent>
              </Card>
            </>
          )}

          {profile.role === 'admin' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">Approve or manage user accounts</p>
                  <a href="/admin/users">
                    <Button>Manage Users</Button>
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Courses</CardTitle>
                  <CardDescription>Platform content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">-</p>
                  <p className="text-sm text-gray-500 mt-2">Published courses</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {!profile.is_approved && (
          <Card className="mt-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">
                Account Pending Approval
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Your account is waiting for admin approval. You'll receive an email once approved.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  )
}
