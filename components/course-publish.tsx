'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateCourse } from '@/lib/actions/courses'

interface CoursePublishProps {
  course: any
}

export function CoursePublish({ course }: CoursePublishProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const materials = course.materials || []
  const totalLessons = materials.reduce(
    (sum: number, mat: any) => sum + (mat.sub_materials?.length || 0),
    0
  )

  const canPublish = materials.length > 0 && totalLessons > 0

  const handlePublish = async () => {
    if (!canPublish) {
      alert('Please add at least one chapter with lessons before publishing')
      return
    }

    if (!confirm('Publish this course? It will be submitted for admin approval.')) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateCourse(course.id, { is_published: true })

      if (result.success) {
        alert('Course published! It is now pending admin approval.')
        router.refresh()
      } else {
        alert(result.error || 'Failed to publish course')
      }
    } catch (error) {
      console.error('Error publishing course:', error)
      alert('An error occurred while publishing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('Unpublish this course? Students will no longer be able to enroll.')) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateCourse(course.id, { is_published: false })

      if (result.success) {
        alert('Course unpublished successfully')
        router.refresh()
      } else {
        alert(result.error || 'Failed to unpublish course')
      }
    } catch (error) {
      console.error('Error unpublishing course:', error)
      alert('An error occurred while unpublishing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Publish Course</CardTitle>
          <CardDescription>
            Make your course available to students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Readiness Checklist */}
          <div className="space-y-4">
            <h3 className="font-semibold">Course Readiness</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={materials.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                  {materials.length > 0 ? '✓' : '○'}
                </span>
                <span className={materials.length > 0 ? '' : 'text-gray-500'}>
                  Add chapters ({materials.length} added)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={totalLessons > 0 ? 'text-green-600' : 'text-gray-400'}>
                  {totalLessons > 0 ? '✓' : '○'}
                </span>
                <span className={totalLessons > 0 ? '' : 'text-gray-500'}>
                  Add lessons ({totalLessons} added)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={course.description ? 'text-green-600' : 'text-gray-400'}>
                  {course.description ? '✓' : '○'}
                </span>
                <span className={course.description ? '' : 'text-gray-500'}>
                  Add course description
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={course.thumbnail_url ? 'text-green-600' : 'text-gray-400'}>
                  {course.thumbnail_url ? '✓' : '○'}
                </span>
                <span className={course.thumbnail_url ? '' : 'text-gray-500'}>
                  Add course thumbnail
                </span>
              </div>
            </div>
          </div>

          {/* Publication Status */}
          <div className="space-y-4">
            <h3 className="font-semibold">Publication Status</h3>
            <div className="flex items-center gap-3">
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

          {/* Publish/Unpublish Button */}
          <div className="pt-4">
            {course.is_published ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Your course is published and {course.is_approved ? 'approved' : 'pending admin approval'}.
                  {!course.is_approved && ' An admin will review it soon.'}
                </p>
                <Button
                  variant="outline"
                  onClick={handleUnpublish}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Unpublishing...' : 'Unpublish Course'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {!canPublish && (
                  <p className="text-sm text-amber-600">
                    Please complete the checklist above before publishing
                  </p>
                )}
                <Button
                  onClick={handlePublish}
                  disabled={isSubmitting || !canPublish}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Course'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
