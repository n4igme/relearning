import { getUserProfile } from '@/lib/actions/auth'
import { getPublishedCourses, getStudentEnrollments } from '@/lib/actions/courses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CourseFilters } from '@/components/course-filters'

// Helper function to determine learning track from category
function getCourseTrack(category: string): 'offensive' | 'defensive' | 'both' {
  const offensiveCategories = ['Web Application Security', 'Reverse Engineering', 'Malware Analysis']
  const defensiveCategories = ['Network Security', 'Forensics', 'Cloud Security']

  if (offensiveCategories.includes(category)) return 'offensive'
  if (defensiveCategories.includes(category)) return 'defensive'
  return 'both'
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { difficulty?: string; category?: string; track?: string; search?: string }
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Fetch all published courses
  const coursesResult = await getPublishedCourses()
  let courses = coursesResult.success && coursesResult.data ? coursesResult.data : []

  // Get student's enrollments if student
  let enrolledCourseIds: string[] = []
  if (profile.role === 'student') {
    const enrollmentsResult = await getStudentEnrollments(profile.id)
    if (enrollmentsResult.success && enrollmentsResult.data) {
      enrolledCourseIds = enrollmentsResult.data.map((e: any) => e.course_id)
    }
  }

  // Apply filters
  const difficulty = searchParams.difficulty
  const category = searchParams.category
  const track = searchParams.track
  const search = searchParams.search?.toLowerCase()

  if (difficulty) {
    courses = courses.filter((course: any) => course.difficulty === difficulty)
  }

  if (category) {
    courses = courses.filter((course: any) => course.category === category)
  }

  if (track) {
    courses = courses.filter((course: any) => {
      const courseTrack = getCourseTrack(course.category)
      return courseTrack === track || courseTrack === 'both'
    })
  }

  if (search) {
    courses = courses.filter((course: any) =>
      course.title.toLowerCase().includes(search) ||
      course.description?.toLowerCase().includes(search)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold cursor-pointer">🛡️ CyberSec Academy</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Explore Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Master cybersecurity with hands-on courses from industry experts
          </p>
        </div>

        {/* Filters */}
        <CourseFilters />

        {/* Course Grid */}
        <div className="mt-8">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No courses found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => {
                const isEnrolled = enrolledCourseIds.includes(course.id)
                const instructor = course.profiles
                const courseTrack = getCourseTrack(course.category)

                return (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      {course.thumbnail_url && (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                          {isEnrolled && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 whitespace-nowrap">
                              Enrolled
                            </span>
                          )}
                        </div>
                        <CardDescription className="line-clamp-3">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Learning Path Badge */}
                          <div className="flex items-center gap-1 text-xs">
                            {courseTrack === 'offensive' && (
                              <span className="px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                                🔴 Offensive Security
                              </span>
                            )}
                            {courseTrack === 'defensive' && (
                              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                🔵 Defensive Security
                              </span>
                            )}
                            {courseTrack === 'both' && (
                              <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                🟣 Both Tracks
                              </span>
                            )}
                          </div>

                          {/* Difficulty & Category */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                              course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {course.difficulty}
                            </span>
                            {course.category && (
                              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                                {course.category}
                              </span>
                            )}
                          </div>

                          {/* Instructor */}
                          {instructor && (
                            <p className="text-sm text-gray-600">
                              By {instructor.full_name}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {course.price > 0 ? `$${course.price}` : 'Free'}
                            </span>
                            {!isEnrolled && profile.role === 'student' && (
                              <Button size="sm">View Details</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
