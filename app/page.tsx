import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUser } from '@/lib/actions/auth'

export default async function HomePage() {
  const user = await getUser()

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛡️ CyberSec Academy</h1>
          <div className="flex gap-2">
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold">
            Master Cybersecurity,
            <br />
            <span className="text-blue-600">One Skill at a Time</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn ethical hacking, penetration testing, and security operations through hands-on courses.
            Build real-world cybersecurity skills with expert-led training.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Ethical Hacking Training</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Master offensive security skills through structured penetration testing courses
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Security Operations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn defensive security, threat detection, and incident response techniques
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Hands-on Challenges</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice with CTF-style assessments and earn badges for your achievements
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
