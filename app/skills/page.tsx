import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'student') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const category = searchParams.category

  // Fetch student's skills
  let query = supabase
    .from('student_skills')
    .select(`
      *,
      skills:skill_id (
        name,
        category,
        description
      )
    `)
    .eq('student_id', profile.id)

  if (category) {
    // Need to filter after fetching since we're joining
  }

  const { data: studentSkills } = await query

  // Filter by category if specified
  let skills = studentSkills || []
  if (category) {
    skills = skills.filter((ss: any) => ss.skills?.category === category)
  }

  // Sort by proficiency points
  skills.sort((a: any, b: any) => b.proficiency_points - a.proficiency_points)

  // Get all categories
  const categories = [
    'Web Application Security',
    'Network Security',
    'Cryptography',
    'Social Engineering',
    'Reverse Engineering',
    'Forensics',
  ]

  // Calculate stats
  const totalSkills = skills.length
  const expertSkills = skills.filter((s: any) => s.proficiency_level === 'expert').length
  const advancedSkills = skills.filter((s: any) => s.proficiency_level === 'advanced').length
  const intermediateSkills = skills.filter((s: any) => s.proficiency_level === 'intermediate').length
  const beginnerSkills = skills.filter((s: any) => s.proficiency_level === 'beginner').length

  // Group skills by category
  const skillsByCategory = skills.reduce((acc: any, ss: any) => {
    const cat = ss.skills?.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ss)
    return acc
  }, {})

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100'
      case 'advanced': return 'text-blue-600 bg-blue-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'beginner': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProficiencyPercent = (points: number) => {
    return Math.min((points / 200) * 100, 100)
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">🎯 My Skills</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your cybersecurity skill development
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSkills}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Expert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{expertSkills}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Advanced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{advancedSkills}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Intermediate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{intermediateSkills}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Beginner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{beginnerSkills}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Link href="/skills">
                <Button variant={!category ? 'default' : 'outline'}>
                  All Categories
                </Button>
              </Link>
              {categories.map((cat) => (
                <Link key={cat} href={`/skills?category=${encodeURIComponent(cat)}`}>
                  <Button variant={category === cat ? 'default' : 'outline'}>
                    {cat}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills List */}
        {skills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 mb-4">No skills tracked yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Complete quizzes and courses to develop your skills
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : category ? (
          // Flat list when filtered by category
          <Card>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {skills.length} {skills.length === 1 ? 'skill' : 'skills'} in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((ss: any) => {
                  const skill = ss.skills
                  const proficiencyPercent = getProficiencyPercent(ss.proficiency_points)

                  return (
                    <div key={ss.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{skill.name}</h3>
                          {skill.description && (
                            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded text-sm capitalize ${getProficiencyColor(ss.proficiency_level)}`}>
                          {ss.proficiency_level}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {ss.proficiency_points} / 200 points
                          </span>
                        </div>
                        <Progress value={proficiencyPercent} className="h-2" />
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(ss.last_updated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Grouped by category
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([cat, catSkills]: [string, any]) => (
              <Card key={cat}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{cat}</CardTitle>
                      <CardDescription>
                        {catSkills.length} {catSkills.length === 1 ? 'skill' : 'skills'}
                      </CardDescription>
                    </div>
                    <Link href={`/skills?category=${encodeURIComponent(cat)}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catSkills.slice(0, 4).map((ss: any) => {
                      const skill = ss.skills
                      const proficiencyPercent = getProficiencyPercent(ss.proficiency_points)

                      return (
                        <div key={ss.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold">{skill.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs capitalize ${getProficiencyColor(ss.proficiency_level)}`}>
                              {ss.proficiency_level}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <Progress value={proficiencyPercent} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{Math.round(proficiencyPercent)}%</span>
                              <span>{ss.proficiency_points} pts</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
