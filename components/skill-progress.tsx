import { getStudentSkills } from '@/lib/actions/skills'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const proficiencyColors = {
  beginner: 'bg-gray-400',
  intermediate: 'bg-blue-500',
  advanced: 'bg-purple-600',
  expert: 'bg-amber-500',
}

const proficiencyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

const proficiencyProgress = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
}

const categoryIcons = {
  web: '🌐',
  network: '🔌',
  cryptography: '🔐',
  social_engineering: '🎭',
  reverse_engineering: '⚙️',
  forensics: '🔍',
}

export async function SkillProgress({ studentId }: { studentId: string }) {
  const { data: studentSkills } = await getStudentSkills(studentId)

  if (!studentSkills || studentSkills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
          <CardDescription>Track your cybersecurity skills mastery</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Start completing quests and courses to develop your skills
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group skills by category
  const skillsByCategory = studentSkills.reduce((acc, skill) => {
    const category = skill.skills?.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, typeof studentSkills>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Progress</CardTitle>
        <CardDescription>Your cybersecurity skills mastery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
              <h3 className="font-semibold capitalize text-sm">
                {category.replace('_', ' ')}
              </h3>
            </div>
            <div className="space-y-2 pl-8">
              {skills.map((skill) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skills?.name}</span>
                    <Badge
                      variant="secondary"
                      className={`${proficiencyColors[skill.proficiency_level]} text-white text-xs`}
                    >
                      {proficiencyLabels[skill.proficiency_level]}
                    </Badge>
                  </div>
                  <Progress
                    value={proficiencyProgress[skill.proficiency_level]}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">{skill.points_earned} points earned</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
