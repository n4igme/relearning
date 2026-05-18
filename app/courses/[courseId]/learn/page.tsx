import { getUserProfile } from '@/lib/actions/auth'
import { getCourseById, getStudentEnrollments, getCourseProgress } from '@/lib/actions/courses'
import { redirect } from 'next/navigation'
import { CourseLearningInterface } from '@/components/course-learning-interface'

export default async function CourseLearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { courseId } = await params
  const { lesson } = await searchParams
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'student') {
    redirect('/dashboard')
  }

  // Fetch course details
  const courseResult = await getCourseById(courseId)

  if (!courseResult.success || !courseResult.data) {
    redirect('/courses')
  }

  const course = courseResult.data

  // Check if student is enrolled
  const enrollmentsResult = await getStudentEnrollments(profile.id)
  const enrollment = enrollmentsResult.success && enrollmentsResult.data
    ? enrollmentsResult.data.find((e: any) => e.course_id === courseId)
    : null

  if (!enrollment) {
    redirect(`/courses/${courseId}`)
  }

  // Get course progress
  const progressResult = await getCourseProgress(enrollment.id)
  const progressData = progressResult.success ? progressResult.data : null

  return (
    <CourseLearningInterface
      course={course}
      enrollment={enrollment}
      progress={progressData?.progress || []}
      studentId={profile.id}
      initialLessonId={lesson}
    />
  )
}
