'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
  createSubMaterial,
  updateSubMaterial,
  deleteSubMaterial,
} from '@/lib/actions/courses'

interface CourseCurriculumProps {
  course: any
}

export function CourseCurriculum({ course }: CourseCurriculumProps) {
  const router = useRouter()
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null)
  const [addingSubMaterial, setAddingSubMaterial] = useState<string | null>(null)
  const [editingSubMaterial, setEditingSubMaterial] = useState<string | null>(null)

  const materials = course.materials || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                Organize your course into chapters and lessons
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingMaterial(true)}>
              + Add Chapter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Material Form */}
          {isAddingMaterial && (
            <MaterialForm
              courseId={course.id}
              orderIndex={materials.length}
              onCancel={() => setIsAddingMaterial(false)}
              onSuccess={() => {
                setIsAddingMaterial(false)
                router.refresh()
              }}
            />
          )}

          {/* Materials List */}
          {materials.length === 0 && !isAddingMaterial ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No chapters added yet</p>
              <Button onClick={() => setIsAddingMaterial(true)}>
                Add Your First Chapter
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {materials.map((material: any, index: number) => (
                <div key={material.id} className="border rounded-lg p-4">
                  {editingMaterial === material.id ? (
                    <MaterialForm
                      material={material}
                      courseId={course.id}
                      orderIndex={index}
                      onCancel={() => setEditingMaterial(null)}
                      onSuccess={() => {
                        setEditingMaterial(null)
                        router.refresh()
                      }}
                    />
                  ) : (
                    <>
                      {/* Material Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            Chapter {index + 1}: {material.title}
                          </h3>
                          {material.description && (
                            <p className="text-sm text-gray-600">{material.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingMaterial(material.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAddingSubMaterial(material.id)}
                          >
                            + Lesson
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (confirm('Delete this chapter and all its lessons?')) {
                                await deleteMaterial(material.id)
                                router.refresh()
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Add Sub-Material Form */}
                      {addingSubMaterial === material.id && (
                        <div className="mb-4 ml-6 p-4 bg-gray-50 rounded">
                          <SubMaterialForm
                            materialId={material.id}
                            orderIndex={material.sub_materials?.length || 0}
                            onCancel={() => setAddingSubMaterial(null)}
                            onSuccess={() => {
                              setAddingSubMaterial(null)
                              router.refresh()
                            }}
                          />
                        </div>
                      )}

                      {/* Sub-Materials List */}
                      {material.sub_materials && material.sub_materials.length > 0 && (
                        <div className="ml-6 space-y-2">
                          {material.sub_materials.map((subMaterial: any, subIndex: number) => (
                            <div
                              key={subMaterial.id}
                              className="border-l-2 border-gray-300 pl-4 py-2"
                            >
                              {editingSubMaterial === subMaterial.id ? (
                                <SubMaterialForm
                                  subMaterial={subMaterial}
                                  materialId={material.id}
                                  orderIndex={subIndex}
                                  onCancel={() => setEditingSubMaterial(null)}
                                  onSuccess={() => {
                                    setEditingSubMaterial(null)
                                    router.refresh()
                                  }}
                                />
                              ) : (
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {index + 1}.{subIndex + 1} {subMaterial.title}
                                    </p>
                                    {subMaterial.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {subMaterial.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        {subMaterial.content_type}
                                      </span>
                                      {subMaterial.video_duration && (
                                        <span>
                                          {Math.floor(subMaterial.video_duration / 60)}m{' '}
                                          {subMaterial.video_duration % 60}s
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingSubMaterial(subMaterial.id)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={async () => {
                                        if (confirm('Delete this lesson?')) {
                                          await deleteSubMaterial(subMaterial.id)
                                          router.refresh()
                                        }
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MaterialForm({
  material,
  courseId,
  orderIndex,
  onCancel,
  onSuccess,
}: {
  material?: any
  courseId: string
  orderIndex: number
  onCancel: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: material?.title || '',
    description: material?.description || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let result
      if (material) {
        result = await updateMaterial(material.id, formData)
      } else {
        result = await createMaterial(courseId, { ...formData, order_index: orderIndex })
      }

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error || 'Failed to save chapter')
      }
    } catch (error) {
      console.error('Error saving material:', error)
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded">
      <div className="space-y-2">
        <Label htmlFor="title">Chapter Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Introduction to SQL Injection"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this chapter covers..."
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : material ? 'Update' : 'Add Chapter'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SubMaterialForm({
  subMaterial,
  materialId,
  orderIndex,
  onCancel,
  onSuccess,
}: {
  subMaterial?: any
  materialId: string
  orderIndex: number
  onCancel: () => void
  onSuccess: () => void
}) {
  const [contentMode, setContentMode] = useState<'video' | 'document' | 'text'>(
    subMaterial?.video_url || subMaterial?.cloudinary_public_id
      ? 'video'
      : subMaterial?.document_url
        ? 'document'
        : 'text'
  )
  const [formData, setFormData] = useState({
    title: subMaterial?.title || '',
    content: subMaterial?.content || '',
    video_url: subMaterial?.video_url || '',
    document_url: subMaterial?.document_url || '',
    cloudinary_public_id: subMaterial?.cloudinary_public_id || '',
    video_duration: subMaterial?.video_duration || 0,
    is_preview: subMaterial?.is_preview || false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title,
        content: formData.content || undefined,
        video_url: contentMode === 'video' ? formData.video_url || undefined : undefined,
        document_url: contentMode === 'document' ? formData.document_url || undefined : undefined,
        cloudinary_public_id: contentMode === 'video' ? formData.cloudinary_public_id || undefined : undefined,
        video_duration: contentMode === 'video' ? formData.video_duration || undefined : undefined,
        is_preview: formData.is_preview,
      }

      let result
      if (subMaterial) {
        result = await updateSubMaterial(subMaterial.id, submitData)
      } else {
        result = await createSubMaterial(materialId, { ...submitData, order_index: orderIndex })
      }

      if (result.success) {
        onSuccess()
      } else {
        const errorMsg = typeof result.error === 'string'
          ? result.error
          : (result.error as any)?.message || 'Failed to save lesson'
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Error saving sub-material:', error)
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Lesson Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Understanding SQL Syntax"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Text Content</Label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Lesson text content..."
          className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content_mode">Content Type</Label>
          <select
            id="content_mode"
            value={contentMode}
            onChange={(e) => setContentMode(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="text">Text Only</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>
        {contentMode === 'video' && (
          <div className="space-y-2">
            <Label htmlFor="video_duration">Duration (seconds)</Label>
            <Input
              id="video_duration"
              type="number"
              value={formData.video_duration}
              onChange={(e) =>
                setFormData({ ...formData, video_duration: parseInt(e.target.value) || 0 })
              }
              placeholder="300"
            />
          </div>
        )}
      </div>
      {contentMode === 'video' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cloudinary_public_id">Cloudinary Public ID</Label>
            <Input
              id="cloudinary_public_id"
              value={formData.cloudinary_public_id}
              onChange={(e) => setFormData({ ...formData, cloudinary_public_id: e.target.value })}
              placeholder="folder/video_id"
            />
            <p className="text-xs text-gray-500">For Cloudinary-hosted videos</p>
          </div>
        </>
      )}
      {contentMode === 'document' && (
        <div className="space-y-2">
          <Label htmlFor="document_url">Document URL</Label>
          <Input
            id="document_url"
            type="url"
            value={formData.document_url}
            onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
            placeholder="https://example.com/document.pdf"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_preview"
          checked={formData.is_preview}
          onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="is_preview">Allow preview without enrollment</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : subMaterial ? 'Update' : 'Add Lesson'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
