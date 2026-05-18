import { getUserProfile } from '@/lib/actions/auth'
import { getCourseById } from '@/lib/actions/courses'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CourseEditTabs } from '@/components/course-edit-tabs'

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'mentor') {
    redirect('/dashboard')
  }

  // Fetch course
  const courseResult = await getCourseById(courseId)

  if (!courseResult.success || !courseResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">Course not found</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const course = courseResult.data

  // Verify ownership
  if (course.instructor_id !== profile.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold cursor-pointer">🛡️ CyberSec Academy</h1>
          </Link>
          <div className="flex gap-2">
            <Link href={`/courses/${course.id}`}>
              <Button variant="outline">Preview</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-sm ${
                  course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {course.difficulty}
                </span>
                <span className={`px-3 py-1 rounded text-sm ${
                  course.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
                {course.is_approved ? (
                  <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700">
                    Approved
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded text-sm bg-yellow-100 text-yellow-700">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for editing */}
        <CourseEditTabs course={course} instructorId={profile.id} />
      </main>
    </div>
  )
}
