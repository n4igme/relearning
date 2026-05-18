import { getUserProfile } from '@/lib/actions/auth'
import { getCourseById, getStudentEnrollments } from '@/lib/actions/courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CourseEnrollmentButton } from '@/components/course-enrollment-button'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Fetch course details
  const courseResult = await getCourseById(courseId)

  if (!courseResult.success || !courseResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">Course not found</p>
            <Link href="/courses" className="mt-4 inline-block">
              <Button>Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const course = courseResult.data
  const instructor = course.profiles

  // Check if student is enrolled
  let isEnrolled = false
  let enrollmentId = ''
  if (profile.role === 'student') {
    const enrollmentsResult = await getStudentEnrollments(profile.id)
    if (enrollmentsResult.success && enrollmentsResult.data) {
      const enrollment = enrollmentsResult.data.find((e: any) => e.course_id === course.id)
      if (enrollment) {
        isEnrolled = true
        enrollmentId = enrollment.id
      }
    }
  }

  // Count total lessons
  const totalLessons = course.materials?.reduce(
    (sum: number, material: any) => sum + (material.sub_materials?.length || 0),
    0
  ) || 0

  // Calculate total duration
  const totalDuration = course.materials?.reduce(
    (sum: number, material: any) =>
      sum +
      (material.sub_materials?.reduce(
        (subSum: number, sub: any) => subSum + (sub.video_duration || 0),
        0
      ) || 0),
    0
  ) || 0

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold cursor-pointer">🛡️ CyberSec Academy</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/courses">
              <Button variant="outline">All Courses</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded text-sm ${
                  course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {course.difficulty}
                </span>
                {course.category && (
                  <span className="px-3 py-1 rounded bg-purple-100 text-purple-700 text-sm">
                    {course.category}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{course.description}</p>
            </div>

            {/* Thumbnail */}
            {course.thumbnail_url && (
              <div className="w-full rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* What You'll Learn */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.learning_objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.materials?.length || 0} chapters • {totalLessons} lessons
                  {totalDuration > 0 && ` • ${formatDuration(totalDuration)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!course.materials || course.materials.length === 0 ? (
                  <p className="text-gray-500">No curriculum available yet</p>
                ) : (
                  <div className="space-y-4">
                    {course.materials.map((material: any, index: number) => (
                      <div key={material.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">
                          {index + 1}. {material.title}
                        </h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                        )}
                        {material.sub_materials && material.sub_materials.length > 0 && (
                          <ul className="space-y-2 ml-4">
                            {material.sub_materials.map((sub: any, subIndex: number) => (
                              <li key={sub.id} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">
                                  {index + 1}.{subIndex + 1}
                                </span>
                                <span>{sub.title}</span>
                                {sub.video_duration && (
                                  <span className="text-gray-500 text-xs">
                                    ({formatDuration(sub.video_duration)})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </div>
                  {course.price > 0 && (
                    <p className="text-sm text-gray-500">One-time payment</p>
                  )}
                </div>

                {/* Enrollment Button */}
                {profile.role === 'student' && (
                  <div>
                    {isEnrolled ? (
                      <Link href={`/courses/${course.id}/learn`} className="block">
                        <Button className="w-full" size="lg">
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <CourseEnrollmentButton
                        courseId={course.id}
                        studentId={profile.id}
                        isEnrolled={false}
                      />
                    )}
                  </div>
                )}

                {/* Course Info */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Lessons</span>
                    <span className="font-medium">{totalLessons}</span>
                  </div>
                  {totalDuration > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{formatDuration(totalDuration)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="font-medium capitalize">{course.difficulty}</span>
                  </div>
                  {course.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{course.category}</span>
                    </div>
                  )}
                </div>

                {/* Instructor */}
                {instructor && (
                  <div className="pt-3 border-t">
                    <h3 className="font-semibold mb-2">Instructor</h3>
                    <div className="flex items-center gap-3">
                      {instructor.avatar_url && (
                        <img
                          src={instructor.avatar_url}
                          alt={instructor.full_name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{instructor.full_name}</p>
                        {instructor.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2">{instructor.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
