import { getUserProfile } from '@/lib/actions/auth'
import { getAllCoursesAdmin, approveCourse } from '@/lib/actions/courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function AdminCoursesPage() {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const coursesResult = await getAllCoursesAdmin()
  const courses = coursesResult.success ? coursesResult.data || [] : []

  const pendingCourses = courses.filter((c: any) => c.is_published && !c.is_approved)
  const approvedCourses = courses.filter((c: any) => c.is_approved)
  const draftCourses = courses.filter((c: any) => !c.is_published)

  async function handleApprove(formData: FormData) {
    'use server'
    const courseId = formData.get('courseId') as string
    await approveCourse(courseId, true)
    revalidatePath('/admin/courses')
  }

  async function handleReject(formData: FormData) {
    'use server'
    const courseId = formData.get('courseId') as string
    await approveCourse(courseId, false)
    revalidatePath('/admin/courses')
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Course Management</h2>
          <p className="text-gray-600 mt-2">Review and approve courses submitted by mentors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCourses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approvedCourses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-3xl font-bold text-gray-600">{draftCourses.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approval */}
        {pendingCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-700">⏳ Pending Approval ({pendingCourses.length})</CardTitle>
              <CardDescription>These courses are published and waiting for your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingCourses.map((course: any) => (
                  <div key={course.id} className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span>By: {course.profiles?.full_name || 'Unknown'}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{course.difficulty}</span>
                          <span>{course.category}</span>
                          <span>{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <form action={handleApprove}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        </form>
                        <form action={handleReject}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <Button type="submit" size="sm" variant="destructive">
                            Reject
                          </Button>
                        </form>
                        <Link href={`/courses/${course.id}`}>
                          <Button size="sm" variant="outline">Preview</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">✓ Approved Courses ({approvedCourses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No approved courses yet</p>
            ) : (
              <div className="space-y-3">
                {approvedCourses.map((course: any) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{course.title}</h3>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>By: {course.profiles?.full_name || 'Unknown'}</span>
                          <span>{course.difficulty}</span>
                          <span>{course.category}</span>
                          <span>{course.enrollment_count} students</span>
                          <span>{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <form action={handleReject}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <Button type="submit" size="sm" variant="outline" className="text-red-600">
                            Revoke
                          </Button>
                        </form>
                        <Link href={`/courses/${course.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Draft Courses */}
        {draftCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-500">📝 Drafts ({draftCourses.length})</CardTitle>
              <CardDescription>Courses not yet published by mentors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {draftCourses.map((course: any) => (
                  <div key={course.id} className="border rounded-lg p-3 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-xs text-gray-500">By: {course.profiles?.full_name || 'Unknown'} • {course.difficulty}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">Draft</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
