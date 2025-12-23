'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { submitQuestAttempt } from '@/lib/actions/quests'
import Link from 'next/link'

interface QuizInterfaceProps {
  quest: any
  studentId: string
}

export function QuizInterface({ quest, studentId }: QuizInterfaceProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const questions = quest.quest_questions || []
  const answeredCount = Object.keys(answers).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    if (isMultiple) {
      const currentAnswers = answers[questionId] || []
      if (currentAnswers.includes(optionId)) {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter((id: string) => id !== optionId),
        })
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, optionId],
        })
      }
    } else {
      setAnswers({
        ...answers,
        [questionId]: optionId,
      })
    }
  }

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      if (!confirm('You haven\'t answered all questions. Submit anyway?')) {
        return
      }
    }

    if (!confirm('Submit your quiz? You cannot change answers after submission.')) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await submitQuestAttempt(quest.id, studentId, answers)

      if (response.success && response.data) {
        setResult(response.data)
      } else {
        alert(response.error || 'Failed to submit quiz')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('An error occurred while submitting')
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">
                {result.passed ? '🎉 Congratulations!' : '📝 Quiz Completed'}
              </CardTitle>
              <CardDescription className="text-lg">
                {result.passed
                  ? 'You passed this quiz!'
                  : `You need ${quest.passing_score}% to pass`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center py-8">
                <div className={`text-6xl font-bold mb-4 ${
                  result.passed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {Math.round(result.score)}%
                </div>
                <p className="text-gray-600">
                  You scored {result.earnedPoints} out of {result.totalPoints} points
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <Progress value={result.score} className="h-4 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  Passing score: {quest.passing_score}%
                </p>
              </div>

              {/* Course Info */}
              {quest.courses && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">From course:</p>
                  <p className="font-semibold">{quest.courses.title}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
                {!result.passed && quest.max_attempts && (
                  <Button onClick={() => router.refresh()} className="flex-1">
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">🛡️ CyberSec Academy</h1>
            <span className="text-gray-400">|</span>
            <h2 className="text-lg font-semibold">{quest.title}</h2>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Exit Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Quiz Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{quest.title}</CardTitle>
            {quest.description && (
              <CardDescription>{quest.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Questions</p>
                <p className="font-semibold">{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Passing Score</p>
                <p className="font-semibold">{quest.passing_score}%</p>
              </div>
              {quest.max_attempts && (
                <div>
                  <p className="text-gray-500">Max Attempts</p>
                  <p className="font-semibold">{quest.max_attempts}</p>
                </div>
              )}
              {quest.time_limit && (
                <div>
                  <p className="text-gray-500">Time Limit</p>
                  <p className="font-semibold">{quest.time_limit} min</p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{answeredCount} of {questions.length} answered</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6 mb-6">
          {questions.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
                <CardDescription className="text-base text-gray-900 dark:text-gray-100 mt-2">
                  {question.question_text}
                </CardDescription>
                {question.question_type === 'multiple_choice' && (
                  <p className="text-xs text-blue-600 mt-2">
                    Select all that apply
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(question.quest_options || []).map((option: any) => {
                    const isMultiple = question.question_type === 'multiple_choice'
                    const isSelected = isMultiple
                      ? (answers[question.id] || []).includes(option.id)
                      : answers[question.id] === option.id

                    return (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type={isMultiple ? 'checkbox' : 'radio'}
                          name={question.id}
                          value={option.id}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(question.id, option.id, isMultiple)}
                          className="mt-1"
                        />
                        <span className="flex-1">{option.option_text}</span>
                      </label>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to submit?</p>
                <p className="text-sm text-gray-500">
                  You have answered {answeredCount} of {questions.length} questions
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || answeredCount === 0}
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
