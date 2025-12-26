'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { enrollInCourse } from '@/lib/actions/courses'
import { useRouter } from 'next/navigation'

interface CourseEnrollmentButtonProps {
  courseId: string
  studentId: string
  isEnrolled?: boolean
  coursePrice?: number
  courseCurrency?: string
}

export function CourseEnrollmentButton({
  courseId,
  studentId,
  isEnrolled = false,
  coursePrice = 0,
  courseCurrency = 'IDR',
}: CourseEnrollmentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setIsLoading(true)

    try {
      // Check if course is paid
      if (coursePrice && coursePrice > 0) {
        // Redirect to manual payment page
        router.push(`/courses/${courseId}/enroll`)
        setIsLoading(false)
      } else {
        // Free course - enroll directly
        const response = await enrollInCourse(studentId, courseId)

        if (response.success) {
          alert('Successfully enrolled! Your learning streak has been updated.')
          router.refresh()
        } else {
          alert(response.error || 'Failed to enroll in course')
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('An error occurred while enrolling')
      setIsLoading(false)
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
    <Button onClick={handleEnroll} disabled={isLoading}>
      {isLoading
        ? coursePrice && coursePrice > 0
          ? 'Loading payment form...'
          : 'Enrolling...'
        : coursePrice && coursePrice > 0
        ? `Enroll for ${courseCurrency} ${coursePrice.toLocaleString()}`
        : 'Enroll for Free'}
    </Button>
  )
}
