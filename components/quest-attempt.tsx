'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { submitQuestAttempt } from '@/lib/actions/quests'

interface QuestQuestion {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  points: number
  order_index: number
  quest_options: {
    id: string
    option_text: string
    order_index: number
  }[]
}

interface QuestAttemptProps {
  questId: string
  studentId: string
  quest: {
    id: string
    title: string
    description: string | null
    passing_score: number
    time_limit: number | null
    quest_questions: QuestQuestion[]
  }
  onComplete?: (result: any) => void
}

export function QuestAttempt({ questId, studentId, quest, onComplete }: QuestAttemptProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await submitQuestAttempt(questId, studentId, answers)

      if (response.success) {
        setResult(response.data)
        onComplete?.(response.data)
      } else {
        alert(response.error || 'Failed to submit quest')
      }
    } catch (error) {
      console.error('Error submitting quest:', error)
      alert('An error occurred while submitting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quest Completed!</CardTitle>
          <CardDescription>{quest.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">
              {result.score.toFixed(1)}%
            </div>
            <Badge
              className={`text-lg ${
                result.passed
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {result.passed ? '✓ PASSED' : '✗ FAILED'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Correct Answers</div>
                <div className="text-2xl font-bold">
                  {result.earnedPoints} / {result.totalPoints}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Passing Score</div>
                <div className="text-2xl font-bold">{quest.passing_score}%</div>
              </CardContent>
            </Card>
          </div>

          {result.passed && (
            <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg mt-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                🎉 Congratulations! You've earned points and may have unlocked badges!
                Check your dashboard to see your progress.
              </p>
            </div>
          )}

          <Button onClick={() => window.location.reload()} className="w-full mt-4">
            Back to Quests
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{quest.title}</CardTitle>
        <CardDescription>
          {quest.description || 'Answer all questions to complete the quest'}
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <Badge>Passing Score: {quest.passing_score}%</Badge>
          {quest.time_limit && <Badge variant="outline">{quest.time_limit} minutes</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {quest.quest_questions.map((question, index) => (
          <div key={question.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">
                {index + 1}. {question.question_text}
              </h3>
              <Badge variant="secondary">{question.points} pt{question.points > 1 ? 's' : ''}</Badge>
            </div>

            <div className="space-y-2">
              {question.question_type === 'true_false' ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name={question.id}
                      value="true"
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name={question.id}
                      value="false"
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>False</span>
                  </label>
                </div>
              ) : question.question_type === 'multiple_choice' ? (
                question.quest_options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>{option.option_text}</span>
                  </label>
                ))
              ) : (
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Enter your answer..."
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              )}
            </div>
          </div>
        ))}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length < quest.quest_questions.length}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quest'}
        </Button>

        {Object.keys(answers).length < quest.quest_questions.length && (
          <p className="text-sm text-gray-500 text-center">
            Please answer all questions to submit
          </p>
        )}
      </CardContent>
    </Card>
  )
}
