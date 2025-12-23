'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Achievement {
  id: string
  type: 'badge' | 'level' | 'streak' | 'course' | 'points'
  title: string
  description: string
  icon?: string
  points?: number
}

interface AchievementNotificationProps {
  achievements: Achievement[]
  onDismiss?: (id: string) => void
}

export function AchievementNotification({ achievements, onDismiss }: AchievementNotificationProps) {
  const [visible, setVisible] = useState<string[]>([])

  useEffect(() => {
    // Show new achievements
    const newAchievements = achievements.filter(a => !visible.includes(a.id))
    if (newAchievements.length > 0) {
      setVisible(prev => [...prev, ...newAchievements.map(a => a.id)])

      // Auto-dismiss after 5 seconds
      newAchievements.forEach(achievement => {
        setTimeout(() => {
          handleDismiss(achievement.id)
        }, 5000)
      })
    }
  }, [achievements])

  const handleDismiss = (id: string) => {
    setVisible(prev => prev.filter(vid => vid !== id))
    if (onDismiss) {
      onDismiss(id)
    }
  }

  const visibleAchievements = achievements.filter(a => visible.includes(a.id))

  if (visibleAchievements.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {visibleAchievements.map((achievement) => {
        const getColor = () => {
          switch (achievement.type) {
            case 'badge': return 'from-purple-500 to-pink-500'
            case 'level': return 'from-blue-500 to-cyan-500'
            case 'streak': return 'from-orange-500 to-red-500'
            case 'course': return 'from-green-500 to-emerald-500'
            case 'points': return 'from-yellow-500 to-amber-500'
            default: return 'from-gray-500 to-gray-600'
          }
        }

        const getIcon = () => {
          if (achievement.icon) return achievement.icon
          switch (achievement.type) {
            case 'badge': return '🏅'
            case 'level': return '⭐'
            case 'streak': return '🔥'
            case 'course': return '🎓'
            case 'points': return '💎'
            default: return '✨'
          }
        }

        return (
          <Card
            key={achievement.id}
            className="animate-slide-in-right border-2 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleDismiss(achievement.id)}
          >
            <div className={`h-2 bg-gradient-to-r ${getColor()}`} />
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-4xl flex-shrink-0">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm mb-1">Achievement Unlocked!</p>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  {achievement.points && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-medium text-blue-600">
                        +{achievement.points} points
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Usage example component for demonstration
export function AchievementDemo() {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  const triggerAchievement = (type: Achievement['type']) => {
    const examples: Record<Achievement['type'], Achievement> = {
      badge: {
        id: `badge-${Date.now()}`,
        type: 'badge',
        title: 'First Blood',
        description: 'Completed your first quest!',
        icon: '🏅',
        points: 50
      },
      level: {
        id: `level-${Date.now()}`,
        type: 'level',
        title: 'Level Up!',
        description: 'You reached Level 5',
        icon: '⭐',
        points: 100
      },
      streak: {
        id: `streak-${Date.now()}`,
        type: 'streak',
        title: '7-Day Streak!',
        description: 'You\'re on fire! Keep it up!',
        icon: '🔥',
        points: 75
      },
      course: {
        id: `course-${Date.now()}`,
        type: 'course',
        title: 'Course Completed',
        description: 'Web Application Security mastered!',
        icon: '🎓',
        points: 500
      },
      points: {
        id: `points-${Date.now()}`,
        type: 'points',
        title: 'Point Milestone',
        description: 'You earned 1000 total points!',
        icon: '💎',
      }
    }

    setAchievements(prev => [...prev, examples[type]])
  }

  const handleDismiss = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Achievement Notification Demo</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => triggerAchievement('badge')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Badge Achievement
        </button>
        <button
          onClick={() => triggerAchievement('level')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Level Up
        </button>
        <button
          onClick={() => triggerAchievement('streak')}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Streak Milestone
        </button>
        <button
          onClick={() => triggerAchievement('course')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Course Complete
        </button>
        <button
          onClick={() => triggerAchievement('points')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Point Milestone
        </button>
      </div>

      <AchievementNotification
        achievements={achievements}
        onDismiss={handleDismiss}
      />
    </div>
  )
}
