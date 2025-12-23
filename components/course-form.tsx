'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createCourse, updateCourse } from '@/lib/actions/courses'

interface CourseFormProps {
  instructorId: string
  course?: any
}

export function CourseForm({ instructorId, course }: CourseFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    thumbnail_url: course?.thumbnail_url || '',
    difficulty: course?.difficulty || 'beginner',
    category: course?.category || '',
    price: course?.price || 0,
    learning_objectives: course?.learning_objectives?.join('\n') || '',
    prerequisites: course?.prerequisites?.join('\n') || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const courseData = {
        ...formData,
        learning_objectives: formData.learning_objectives
          .split('\n')
          .filter((obj: string) => obj.trim() !== ''),
        prerequisites: formData.prerequisites
          .split('\n')
          .filter((req: string) => req.trim() !== ''),
      }

      let result
      if (course) {
        // Update existing course
        result = await updateCourse(course.id, courseData)
      } else {
        // Create new course
        result = await createCourse(instructorId, courseData)
      }

      if (result.success && result.data) {
        router.push(`/mentor/courses/${result.data.id}`)
      } else {
        alert(result.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert('An error occurred while saving the course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    'Web Application Security',
    'Network Security',
    'Cryptography',
    'Social Engineering',
    'Reverse Engineering',
    'Forensics',
    'Malware Analysis',
    'Cloud Security',
    'Mobile Security',
    'IoT Security',
  ]

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Provide the basic details about your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Advanced Web Application Penetration Testing"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
            <Input
              id="thumbnail_url"
              name="thumbnail_url"
              type="url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="text-sm text-gray-500">
              Recommended: 1280x720px image
            </p>
          </div>

          {/* Difficulty & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-gray-500">
              Set to 0 for a free course
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-2">
            <Label htmlFor="learning_objectives">Learning Objectives</Label>
            <textarea
              id="learning_objectives"
              name="learning_objectives"
              value={formData.learning_objectives}
              onChange={handleChange}
              placeholder="Enter each objective on a new line:&#10;Master SQL injection techniques&#10;Learn cross-site scripting (XSS) attacks&#10;Understand CSRF vulnerabilities"
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Enter each objective on a new line
            </p>
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <textarea
              id="prerequisites"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              placeholder="Enter each prerequisite on a new line:&#10;Basic understanding of HTTP/HTTPS&#10;Familiarity with web browsers&#10;Basic command line knowledge"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Enter each prerequisite on a new line
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
