'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type BadgeRequirementType = Database['public']['Tables']['badges']['Row']['requirement_type']

/**
 * Award points to a student for completing an action
 */
export async function awardPoints(
  studentId: string,
  points: number,
  source: 'quest' | 'course' | 'skill' | 'streak',
  sourceId?: string
) {
  const supabase = await createClient()

  try {
    // Get or create leaderboard stats for this student
    const { data: stats, error: fetchError } = await supabase
      .from('leaderboard_stats')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const now = new Date().toISOString()

    if (!stats) {
      // Create new leaderboard entry
      const { error: insertError } = await supabase
        .from('leaderboard_stats')
        .insert({
          student_id: studentId,
          total_points: points,
          badges_earned: 0,
          courses_completed: source === 'course' ? 1 : 0,
          quests_completed: source === 'quest' ? 1 : 0,
          average_score: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          last_activity_date: now,
        })

      if (insertError) throw insertError
    } else {
      // Update existing stats
      const updateData: Database['public']['Tables']['leaderboard_stats']['Update'] = {
        total_points: stats.total_points + points,
        courses_completed: source === 'course' ? stats.courses_completed + 1 : stats.courses_completed,
        quests_completed: source === 'quest' ? stats.quests_completed + 1 : stats.quests_completed,
        last_activity_date: now,
      }

      const { error: updateError } = await supabase
        .from('leaderboard_stats')
        .update(updateData)
        .eq('student_id', studentId)

      if (updateError) throw updateError
    }

    // Check if this action unlocks any badges
    await checkAndAwardBadges(studentId)

    return { success: true }
  } catch (error) {
    console.error('Error awarding points:', error)
    return { success: false, error }
  }
}

/**
 * Check if student qualifies for any badges and award them
 */
export async function checkAndAwardBadges(studentId: string) {
  const supabase = await createClient()

  try {
    // Get student stats
    const { data: stats } = await supabase
      .from('leaderboard_stats')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (!stats) return { success: false, error: 'Student stats not found' }

    // Get all badges
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')

    if (!allBadges) return { success: true }

    // Get already earned badges
    const { data: earnedBadges } = await supabase
      .from('student_badges')
      .select('badge_id')
      .eq('student_id', studentId)

    const earnedBadgeIds = earnedBadges?.map(b => b.badge_id) || []

    // Check each badge requirement
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) continue

      const criteria = badge.requirement_criteria as Record<string, any>
      let qualifies = false

      switch (badge.requirement_type) {
        case 'total_points':
          if (criteria.min_points && stats.total_points >= criteria.min_points) {
            qualifies = true
          }
          break

        case 'course_completion':
          if (criteria.min_courses && stats.courses_completed >= criteria.min_courses) {
            qualifies = true
          }
          break

        case 'quest_score':
          if (criteria.min_quests && stats.quests_completed >= criteria.min_quests) {
            qualifies = true
          }
          break

        case 'consecutive_days':
          if (criteria.min_days && stats.current_streak_days >= criteria.min_days) {
            qualifies = true
          }
          break

        case 'skill_mastery':
          // Check if student has required number of skills at required level
          const { data: studentSkills } = await supabase
            .from('student_skills')
            .select('proficiency_level')
            .eq('student_id', studentId)

          if (studentSkills && criteria.min_skills && criteria.min_level) {
            const levelMap: Record<string, number> = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
              expert: 4,
            }
            const requiredLevel = levelMap[criteria.min_level] || 1
            const qualifiedSkills = studentSkills.filter(
              s => levelMap[s.proficiency_level] >= requiredLevel
            )
            if (qualifiedSkills.length >= criteria.min_skills) {
              qualifies = true
            }
          }
          break
      }

      // Award badge if qualified
      if (qualifies) {
        await supabase.from('student_badges').insert({
          student_id: studentId,
          badge_id: badge.id,
          evidence: { source: 'auto_check', timestamp: new Date().toISOString() },
        })

        // Update badge count in leaderboard
        await supabase
          .from('leaderboard_stats')
          .update({ badges_earned: stats.badges_earned + 1 })
          .eq('student_id', studentId)

        // Award bonus points
        if (badge.points_reward > 0) {
          await awardPoints(studentId, badge.points_reward, 'skill')
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error checking badges:', error)
    return { success: false, error }
  }
}

/**
 * Update student's learning streak
 */
export async function updateStreak(studentId: string) {
  const supabase = await createClient()

  try {
    const { data: stats } = await supabase
      .from('leaderboard_stats')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (!stats) return { success: false, error: 'Stats not found' }

    const now = new Date()
    const lastActivity = stats.last_activity_date ? new Date(stats.last_activity_date) : null

    let newStreakDays = stats.current_streak_days
    let newLongestStreak = stats.longest_streak_days

    if (!lastActivity) {
      // First activity
      newStreakDays = 1
      newLongestStreak = 1
    } else {
      const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // Same day, no change
        return { success: true }
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreakDays += 1
        newLongestStreak = Math.max(newLongestStreak, newStreakDays)
      } else {
        // Streak broken
        newStreakDays = 1
      }
    }

    const updateData: Database['public']['Tables']['leaderboard_stats']['Update'] = {
      current_streak_days: newStreakDays,
      longest_streak_days: newLongestStreak,
      last_activity_date: now.toISOString(),
    }

    await supabase
      .from('leaderboard_stats')
      .update(updateData)
      .eq('student_id', studentId)

    // Check for streak badges
    await checkAndAwardBadges(studentId)

    return { success: true, streakDays: newStreakDays }
  } catch (error) {
    console.error('Error updating streak:', error)
    return { success: false, error }
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit: number = 10, timeframe: 'all' | 'month' | 'week' = 'all') {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('leaderboard_stats')
      .select(`
        *,
        profiles:student_id (
          full_name,
          email
        )
      `)
      .order('total_points', { ascending: false })
      .limit(limit)

    // Add timeframe filtering if needed
    if (timeframe === 'month') {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      query = query.gte('last_activity_date', oneMonthAgo.toISOString())
    } else if (timeframe === 'week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      query = query.gte('last_activity_date', oneWeekAgo.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    // Add rank numbers
    const leaderboard = data?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    return { success: true, data: leaderboard }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return { success: false, error }
  }
}

/**
 * Get student's rank
 */
export async function getStudentRank(studentId: string) {
  const supabase = await createClient()

  try {
    // Get all students ordered by points
    const { data: allStats } = await supabase
      .from('leaderboard_stats')
      .select('student_id, total_points')
      .order('total_points', { ascending: false })

    if (!allStats) return { success: false, error: 'No leaderboard data' }

    const rank = allStats.findIndex(s => s.student_id === studentId) + 1

    return { success: true, rank: rank || null }
  } catch (error) {
    console.error('Error fetching student rank:', error)
    return { success: false, error }
  }
}

/**
 * Get student's badges
 */
export async function getStudentBadges(studentId: string) {
  const supabase = await createClient()

  try {
    // Get earned badges
    const { data: earnedBadges, error: earnedError } = await supabase
      .from('student_badges')
      .select(`
        *,
        badges:badge_id (*)
      `)
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false })

    if (earnedError) throw earnedError

    // Get all badges
    const { data: allBadges, error: allError } = await supabase
      .from('badges')
      .select('*')
      .order('badge_tier', { ascending: true })

    if (allError) throw allError

    const earnedBadgeIds = earnedBadges?.map(b => b.badge_id) || []
    const lockedBadges = allBadges?.filter(b => !earnedBadgeIds.includes(b.id)) || []

    return {
      success: true,
      earned: earnedBadges,
      locked: lockedBadges,
    }
  } catch (error) {
    console.error('Error fetching badges:', error)
    return { success: false, error }
  }
}
