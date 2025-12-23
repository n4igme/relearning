'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CourseQuizzesProps {
  course: any
}

export function CourseQuizzes({ course }: CourseQuizzesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Quizzes</CardTitle>
        <CardDescription>
          Create quizzes and assessments for your students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Quiz builder coming soon</p>
          <p className="text-sm text-gray-400">
            You'll be able to create quizzes with multiple choice questions, set passing scores, and track student performance
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
