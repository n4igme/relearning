import { getUserProfile } from '@/lib/actions/auth'
import { getQuestWithQuestions, canAttemptQuest } from '@/lib/actions/quests'
import { redirect } from 'next/navigation'
import { QuizInterface } from '@/components/quiz-interface'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function QuestPage({
  params,
}: {
  params: Promise<{ questId: string }>
}) {
  const { questId } = await params
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'student') {
    redirect('/dashboard')
  }

  // Fetch quest details
  const questResult = await getQuestWithQuestions(questId)

  if (!questResult.success || !questResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">Quiz not found</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quest = questResult.data

  // Check if student can attempt
  const eligibility = await canAttemptQuest(questId, profile.id)

  if (!eligibility.canAttempt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center max-w-md">
            <h2 className="text-xl font-bold mb-4">Cannot Attempt Quiz</h2>
            <p className="text-gray-600 mb-4">{eligibility.reason}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <QuizInterface quest={quest} studentId={profile.id} />
}
