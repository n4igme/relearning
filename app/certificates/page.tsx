import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function CertificatesPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'student') {
    redirect('/dashboard')
  }

  // Fetch student's certificates
  const supabase = await createClient()
  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      *,
      courses:course_id (
        title,
        difficulty,
        category
      )
    `)
    .eq('student_id', profile.id)
    .order('issued_at', { ascending: false })

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Certificates</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your earned certificates and achievements
          </p>
        </div>

        {!certificates || certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-500 mb-4">No certificates earned yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Complete courses to earn certificates
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert: any) => {
              const course = cert.courses

              return (
                <Card key={cert.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">🏆</div>
                      <div className="text-right">
                        <p className="text-xs opacity-90">Certificate of Completion</p>
                        <p className="text-sm font-mono">{cert.certificate_number}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {course?.title || 'Course Certificate'}
                    </h3>
                    <p className="text-sm opacity-90">{profile.full_name}</p>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Issued On</span>
                        <span className="font-medium">
                          {new Date(cert.issued_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {course?.difficulty && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Level</span>
                          <span className={`px-2 py-1 rounded text-xs capitalize ${
                            course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                      )}

                      {course?.category && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium">{course.category}</span>
                        </div>
                      )}

                      {cert.score && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Average Score</span>
                          <span className="font-medium">{Math.round(cert.score)}%</span>
                        </div>
                      )}

                      <div className="pt-4 flex gap-2">
                        <Button variant="outline" className="flex-1" size="sm" disabled>
                          Download PDF
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm" disabled>
                          Share
                        </Button>
                      </div>
                      <p className="text-xs text-center text-gray-400 mt-2">
                        Verification: {cert.verification_url}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
