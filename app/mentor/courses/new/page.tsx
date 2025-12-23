import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { CourseForm } from '@/components/course-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewCoursePage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'mentor') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold cursor-pointer">🛡️ CyberSec Academy</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create New Course</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below to create your cybersecurity course
          </p>
        </div>

        <CourseForm instructorId={profile.id} />
      </main>
    </div>
  )
}
