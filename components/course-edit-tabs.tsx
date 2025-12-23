'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CourseForm } from '@/components/course-form'
import { CourseCurriculum } from '@/components/course-curriculum'
import { CourseQuizzes } from '@/components/course-quizzes'
import { CoursePublish } from '@/components/course-publish'

interface CourseEditTabsProps {
  course: any
  instructorId: string
}

export function CourseEditTabs({ course, instructorId }: CourseEditTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum' | 'quizzes' | 'publish'>('info')

  const tabs = [
    { id: 'info' as const, label: 'Course Info' },
    { id: 'curriculum' as const, label: 'Curriculum' },
    { id: 'quizzes' as const, label: 'Quizzes' },
    { id: 'publish' as const, label: 'Publish' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'info' && (
          <CourseForm instructorId={instructorId} course={course} />
        )}
        {activeTab === 'curriculum' && (
          <CourseCurriculum course={course} />
        )}
        {activeTab === 'quizzes' && (
          <CourseQuizzes course={course} />
        )}
        {activeTab === 'publish' && (
          <CoursePublish course={course} />
        )}
      </div>
    </div>
  )
}
