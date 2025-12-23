'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { enrollInCourse } from '@/lib/actions/courses'
import { useRouter } from 'next/navigation'

interface CourseEnrollmentButtonProps {
  courseId: string
  studentId: string
  isEnrolled?: boolean
}

export function CourseEnrollmentButton({
  courseId,
  studentId,
  isEnrolled = false,
}: CourseEnrollmentButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setIsEnrolling(true)

    try {
      const response = await enrollInCourse(studentId, courseId)

      if (response.success) {
        alert('Successfully enrolled! Your learning streak has been updated.')
        router.refresh()
      } else {
        alert(response.error || 'Failed to enroll in course')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('An error occurred while enrolling')
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isEnrolled) {
    return (
      <Button variant="outline" disabled>
        ✓ Enrolled
      </Button>
    )
  }

  return (
    <Button onClick={handleEnroll} disabled={isEnrolling}>
      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  )
}
