'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { markSubMaterialCompleted } from '@/lib/actions/courses'
import Link from 'next/link'

interface CourseLearningInterfaceProps {
  course: any
  enrollment: any
  progress: any[]
  studentId: string
  initialLessonId?: string
}

export function CourseLearningInterface({
  course,
  enrollment,
  progress,
  studentId,
  initialLessonId,
}: CourseLearningInterfaceProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  const materials = course.materials || []

  // Flatten all lessons
  const allLessons = materials.flatMap((material: any) =>
    (material.sub_materials || []).map((sub: any) => ({
      ...sub,
      materialTitle: material.title,
      materialId: material.id,
    }))
  )

  // Set initial lesson
  useEffect(() => {
    if (initialLessonId && allLessons.find((l: any) => l.id === initialLessonId)) {
      setCurrentLessonId(initialLessonId)
    } else if (allLessons.length > 0) {
      // Find first incomplete lesson or default to first lesson
      const incompleteLesson = allLessons.find(
        (lesson: any) => !progress.find((p: any) => p.sub_material_id === lesson.id && p.is_completed)
      )
      setCurrentLessonId(incompleteLesson?.id || allLessons[0].id)
    }
  }, [initialLessonId, allLessons.length])

  const currentLesson = allLessons.find((l: any) => l.id === currentLessonId)
  const currentIndex = allLessons.findIndex((l: any) => l.id === currentLessonId)
  const currentProgress = progress.find((p: any) => p.sub_material_id === currentLessonId)

  const handleMarkComplete = async () => {
    if (!currentLessonId || currentProgress?.is_completed) return

    setIsCompleting(true)

    try {
      const result = await markSubMaterialCompleted(enrollment.id, currentLessonId, 0)

      if (result.success) {
        router.refresh()

        // Auto-advance to next lesson
        if (currentIndex < allLessons.length - 1) {
          setCurrentLessonId(allLessons[currentIndex + 1].id)
        }
      } else {
        alert('Failed to mark as complete')
      }
    } catch (error) {
      console.error('Error marking complete:', error)
      alert('An error occurred')
    } finally {
      setIsCompleting(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id)
    }
  }

  const completedCount = allLessons.filter((lesson: any) =>
    progress.find((p: any) => p.sub_material_id === lesson.id && p.is_completed)
  ).length

  const progressPercentage = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard">
              <h2 className="font-bold text-lg mb-2 cursor-pointer hover:text-blue-600">
                {course.title}
              </h2>
            </Link>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-gray-500">
                {completedCount} of {allLessons.length} lessons completed
              </p>
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            {materials.map((material: any, matIndex: number) => (
              <div key={material.id} className="border-b border-gray-100">
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-sm">
                    Chapter {matIndex + 1}: {material.title}
                  </h3>
                </div>
                <div>
                  {(material.sub_materials || []).map((lesson: any, lessonIndex: number) => {
                    const lessonProgress = progress.find(
                      (p: any) => p.sub_material_id === lesson.id
                    )
                    const isCompleted = lessonProgress?.is_completed
                    const isCurrent = lesson.id === currentLessonId

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLessonId(lesson.id)}
                        className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          isCurrent ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                                ✓
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                              {matIndex + 1}.{lessonIndex + 1} {lesson.title}
                            </p>
                            {lesson.video_duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                {Math.floor(lesson.video_duration / 60)}m{' '}
                                {lesson.video_duration % 60}s
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </Button>
            <h1 className="text-xl font-bold">🛡️ CyberSec Academy</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Exit Course
            </Button>
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto">
              {/* Lesson Header */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  {currentLesson.materialTitle}
                </p>
                <h2 className="text-3xl font-bold mb-4">{currentLesson.title}</h2>
                {currentLesson.description && (
                  <p className="text-gray-600">{currentLesson.description}</p>
                )}
              </div>

              {/* Content */}
              <Card className="mb-6">
                <CardContent className="p-0">
                  {currentLesson.content_type === 'video' && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {currentLesson.content_url ? (
                        <video
                          src={currentLesson.content_url}
                          controls
                          className="w-full h-full"
                          controlsList="nodownload"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : currentLesson.cloudinary_public_id ? (
                        <div className="flex items-center justify-center h-full text-white">
                          <p>Cloudinary video player integration coming soon</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Video ID: {currentLesson.cloudinary_public_id}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-white">
                          <p>No video content available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson.content_type === 'document' && (
                    <div className="p-8 text-center">
                      {currentLesson.content_url ? (
                        <div>
                          <p className="mb-4">Document: {currentLesson.title}</p>
                          <a
                            href={currentLesson.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button>Open Document</Button>
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500">No document available</p>
                      )}
                    </div>
                  )}

                  {currentLesson.content_type === 'text' && (
                    <div className="p-8">
                      <p className="text-gray-600">
                        Text content for this lesson will be displayed here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation & Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  ← Previous Lesson
                </Button>

                <div className="flex gap-3">
                  {currentProgress?.is_completed ? (
                    <Button variant="outline" disabled>
                      ✓ Completed
                    </Button>
                  ) : (
                    <Button onClick={handleMarkComplete} disabled={isCompleting}>
                      {isCompleting ? 'Marking...' : 'Mark as Complete'}
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === allLessons.length - 1}
                >
                  Next Lesson →
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No lessons available in this course</p>
                  <Link href="/dashboard" className="mt-4 inline-block">
                    <Button>Back to Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
