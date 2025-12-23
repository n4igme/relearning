import { getUserProfile, signOut } from '@/lib/actions/auth'
import { getStudentEnrollments, getMentorCourses } from '@/lib/actions/courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { redirect } from 'next/navigation'
import { SkillProgress } from '@/components/skill-progress'
import { Leaderboard } from '@/components/leaderboard'
import { BadgesShowcase } from '@/components/badges-showcase'
import Link from 'next/link'

export default async function DashboardPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Fetch enrolled courses for students
  let enrollments: any[] = []
  if (profile.role === 'student') {
    const enrollmentsResult = await getStudentEnrollments(profile.id)
    if (enrollmentsResult.success && enrollmentsResult.data) {
      enrollments = enrollmentsResult.data
    }
  }

  // Fetch mentor's courses
  let mentorCourses: any[] = []
  if (profile.role === 'mentor') {
    const coursesResult = await getMentorCourses(profile.id)
    if (coursesResult.success && coursesResult.data) {
      mentorCourses = coursesResult.data
    }
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
              {/* Enrolled Courses - Full width */}
              <div className="md:col-span-2 lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>Continue your cybersecurity learning journey</CardDescription>
                    </div>
                    <Link href="/courses">
                      <Button variant="outline">Browse Courses</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {enrollments.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
                        <Link href="/courses">
                          <Button>Explore Courses</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrollments.map((enrollment: any) => {
                          const course = enrollment.courses
                          if (!course) return null

                          const isCompleted = enrollment.completed_at
                          const progress = Math.round(enrollment.progress_percentage || 0)

                          return (
                            <Link
                              key={enrollment.id}
                              href={`/courses/${course.id}/learn`}
                              className="block"
                            >
                              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                  {course.thumbnail_url && (
                                    <div className="mb-3 rounded-lg overflow-hidden bg-gray-200">
                                      <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-32 object-cover"
                                      />
                                    </div>
                                  )}
                                  <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                                  <div className="flex items-center gap-2 mb-3 text-xs">
                                    <span className={`px-2 py-1 rounded ${
                                      course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                      course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {course.difficulty}
                                    </span>
                                    {isCompleted && (
                                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                                        ✓ Completed
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Progress</span>
                                      <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>
                                  {enrollment.last_accessed_at && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      Last accessed: {new Date(enrollment.last_accessed_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

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
              {/* Stats Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Courses</CardTitle>
                  <CardDescription>Courses you've created</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{mentorCourses.length}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {mentorCourses.filter((c: any) => c.is_published).length} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Students</CardTitle>
                  <CardDescription>Across all courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {mentorCourses.reduce((sum: number, c: any) => sum + c.enrollment_count, 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Enrolled students</p>
                </CardContent>
              </Card>

              {/* My Courses - Full width */}
              <div className="md:col-span-2 lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>Manage and create your courses</CardDescription>
                    </div>
                    <Link href="/mentor/courses/new">
                      <Button>+ Create Course</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {mentorCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
                        <Link href="/mentor/courses/new">
                          <Button>Create Your First Course</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mentorCourses.map((course: any) => (
                          <Link
                            key={course.id}
                            href={`/mentor/courses/${course.id}`}
                            className="block"
                          >
                            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{course.title}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                      course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {course.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                    {course.description || 'No description'}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{course.material_count} chapters</span>
                                    <span>{course.enrollment_count} students</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      course.is_published
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {course.is_published ? 'Published' : 'Draft'}
                                    </span>
                                    {course.is_approved ? (
                                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                                        Approved
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                                        Pending Approval
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">
                                    {course.price > 0 ? `$${course.price}` : 'Free'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
