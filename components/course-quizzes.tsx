'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { createQuest, updateQuest, deleteQuest, createQuestion, updateQuestion, deleteQuestion, createOption, updateOption, deleteOption, getAllCourseQuests } from '@/lib/actions/quests'
import { useRouter } from 'next/navigation'

interface CourseQuizzesProps {
  course: any
}

interface Quest {
  id: string
  title: string
  description?: string
  passing_score: number
  time_limit?: number
  max_attempts?: number
  is_published: boolean
  quest_questions?: Question[]
}

interface Question {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  points: number
  order_index: number
  quest_options?: Option[]
}

interface Option {
  id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

export function CourseQuizzes({ course }: CourseQuizzesProps) {
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [showQuestForm, setShowQuestForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)

  // Quest form state
  const [questFormData, setQuestFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit: 0,
    max_attempts: 0,
  })

  // Question form state
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'short_answer',
    points: 1,
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  })

  useEffect(() => {
    loadQuests()
  }, [course.id])

  const loadQuests = async () => {
    const result = await getAllCourseQuests(course.id)
    if (result.success && result.data) {
      setQuests(result.data)
      // Update selectedQuest with fresh data
      if (selectedQuest) {
        const updated = result.data.find((q: Quest) => q.id === selectedQuest.id)
        if (updated) setSelectedQuest(updated)
      }
    }
  }

  const handleCreateQuest = async () => {
    setLoading(true)
    const result = await createQuest(course.id, questFormData)
    if (result.success) {
      await loadQuests()
      setShowQuestForm(false)
      setQuestFormData({ title: '', description: '', passing_score: 70, time_limit: 0, max_attempts: 0 })
    }
    setLoading(false)
  }

  const handleUpdateQuest = async (questId: string, data: Partial<Quest>) => {
    setLoading(true)
    await updateQuest(questId, data)
    await loadQuests()
    setLoading(false)
  }

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    setLoading(true)
    await deleteQuest(questId)
    await loadQuests()
    setSelectedQuest(null)
    setLoading(false)
  }

  const handleAddQuestion = async () => {
    if (!selectedQuest) return
    setLoading(true)

    const questionData = {
      question_text: questionFormData.question_text,
      question_type: questionFormData.question_type,
      points: questionFormData.points,
      order_index: selectedQuest.quest_questions?.length || 0,
    }

    const result = await createQuestion(selectedQuest.id, questionData)

    if (result.success && result.data) {
      // Add options for multiple choice questions
      if (questionFormData.question_type === 'multiple_choice') {
        for (const option of questionFormData.options) {
          if (option.option_text.trim()) {
            await createOption(result.data.id, {
              option_text: option.option_text,
              is_correct: option.is_correct,
              order_index: questionFormData.options.indexOf(option),
            })
          }
        }
      } else if (questionFormData.question_type === 'true_false') {
        // Create True/False options
        await createOption(result.data.id, {
          option_text: 'True',
          is_correct: questionFormData.options[0].is_correct,
          order_index: 0,
        })
        await createOption(result.data.id, {
          option_text: 'False',
          is_correct: !questionFormData.options[0].is_correct,
          order_index: 1,
        })
      }

      await loadQuests()
      setShowQuestionForm(false)
      resetQuestionForm()
    }
    setLoading(false)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    setLoading(true)
    await deleteQuestion(questionId)
    await loadQuests()
    setLoading(false)
  }

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    })
    setEditingQuestion(null)
  }

  const addOption = () => {
    setQuestionFormData({
      ...questionFormData,
      options: [...questionFormData.options, { option_text: '', is_correct: false }],
    })
  }

  const removeOption = (index: number) => {
    const newOptions = questionFormData.options.filter((_, i) => i !== index)
    setQuestionFormData({ ...questionFormData, options: newOptions })
  }

  const updateOption = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...questionFormData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setQuestionFormData({ ...questionFormData, options: newOptions })
  }

  return (
    <div className="space-y-6">
      {/* Quests List */}
      {!selectedQuest && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Course Quizzes</CardTitle>
                <CardDescription>
                  Create quizzes and assessments for your students
                </CardDescription>
              </div>
              <Button onClick={() => setShowQuestForm(true)}>
                Create Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {quests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No quizzes yet. Create your first quiz to test your students!
              </div>
            ) : (
              <div className="space-y-4">
                {quests.map((quest) => (
                  <div key={quest.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedQuest(quest)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{quest.title}</h3>
                        {quest.description && (
                          <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span>Questions: {quest.quest_questions?.length || 0}</span>
                          <span>Passing Score: {quest.passing_score}%</span>
                          {quest.time_limit && <span>Time Limit: {quest.time_limit} min</span>}
                          {quest.max_attempts && <span>Max Attempts: {quest.max_attempts}</span>}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${quest.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {quest.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Quest Form */}
      {showQuestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Quiz</CardTitle>
            <CardDescription>Set up a new quiz for this course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Quiz Title *</Label>
                <Input
                  value={questFormData.title}
                  onChange={(e) => setQuestFormData({ ...questFormData, title: e.target.value })}
                  placeholder="e.g., Chapter 1 Assessment"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={questFormData.description}
                  onChange={(e) => setQuestFormData({ ...questFormData, description: e.target.value })}
                  placeholder="Brief description of the quiz"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={questFormData.passing_score}
                    onChange={(e) => setQuestFormData({ ...questFormData, passing_score: parseInt(e.target.value) || 70 })}
                  />
                </div>

                <div>
                  <Label>Time Limit (minutes, 0 = unlimited)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={questFormData.time_limit}
                    onChange={(e) => setQuestFormData({ ...questFormData, time_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Max Attempts (0 = unlimited)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={questFormData.max_attempts}
                    onChange={(e) => setQuestFormData({ ...questFormData, max_attempts: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateQuest} disabled={!questFormData.title || loading}>
                  Create Quiz
                </Button>
                <Button variant="outline" onClick={() => setShowQuestForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quest Detail with Questions */}
      {selectedQuest && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedQuest.title}</CardTitle>
                  {selectedQuest.description && (
                    <CardDescription>{selectedQuest.description}</CardDescription>
                  )}
                </div>
                <Button variant="outline" onClick={() => setSelectedQuest(null)}>
                  Back to Quizzes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 text-sm">
                  <div>Passing Score: <strong>{selectedQuest.passing_score}%</strong></div>
                  {selectedQuest.time_limit ? (
                    <div>Time Limit: <strong>{selectedQuest.time_limit} minutes</strong></div>
                  ) : null}
                  {selectedQuest.max_attempts ? (
                    <div>Max Attempts: <strong>{selectedQuest.max_attempts}</strong></div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={selectedQuest.is_published ? 'outline' : 'default'}
                    onClick={() => handleUpdateQuest(selectedQuest.id, { is_published: !selectedQuest.is_published })}
                    disabled={loading}
                  >
                    {selectedQuest.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteQuest(selectedQuest.id)} disabled={loading}>
                    Delete Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Questions ({selectedQuest.quest_questions?.length || 0})</CardTitle>
                <Button onClick={() => setShowQuestionForm(true)}>Add Question</Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedQuest.quest_questions?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions yet. Add your first question!
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedQuest.quest_questions?.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <span className="font-medium">Q{index + 1}.</span>
                            <span>{question.question_text}</span>
                          </div>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span className="capitalize">{question.question_type.replace('_', ' ')}</span>
                            <span>Points: {question.points}</span>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                          Delete
                        </Button>
                      </div>

                      {/* Show options for multiple choice */}
                      {question.question_type === 'multiple_choice' && question.quest_options && (
                        <div className="mt-3 ml-6 space-y-1">
                          {question.quest_options.map((option) => (
                            <div key={option.id} className="flex items-center gap-2 text-sm">
                              <span className={option.is_correct ? 'text-green-600' : 'text-gray-600'}>
                                {option.is_correct ? '✓' : '○'}
                              </span>
                              <span className={option.is_correct ? 'font-medium text-green-600' : ''}>
                                {option.option_text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Question Form */}
          {showQuestionForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Question Text *</Label>
                    <Input
                      value={questionFormData.question_text}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={questionFormData.question_type}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, question_type: e.target.value as any })}
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={questionFormData.points}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  {/* Options for Multiple Choice */}
                  {questionFormData.question_type === 'multiple_choice' && (
                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-2 mt-2">
                        {questionFormData.options.map((option, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <Input
                              value={option.option_text}
                              onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            {questionFormData.options.length > 2 && (
                              <Button variant="outline" size="sm" onClick={() => removeOption(index)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addOption}>
                          Add Option
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Check the box next to the correct answer(s)</p>
                    </div>
                  )}

                  {/* Options for True/False */}
                  {questionFormData.question_type === 'true_false' && (
                    <div>
                      <Label>Correct Answer</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={questionFormData.options[0].is_correct === true}
                            onChange={() => setQuestionFormData({
                              ...questionFormData,
                              options: [{ option_text: 'True', is_correct: true }]
                            })}
                          />
                          <span>True</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={questionFormData.options[0].is_correct === false}
                            onChange={() => setQuestionFormData({
                              ...questionFormData,
                              options: [{ option_text: 'False', is_correct: false }]
                            })}
                          />
                          <span>False</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddQuestion} disabled={!questionFormData.question_text || loading}>
                      Add Question
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowQuestionForm(false)
                      resetQuestionForm()
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
