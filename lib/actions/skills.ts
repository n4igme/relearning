'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type ProficiencyLevel = Database['public']['Tables']['student_skills']['Row']['proficiency_level']

/**
 * Get all available skills
 */
export async function getAllSkills() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching skills:', error)
    return { success: false, error }
  }
}

/**
 * Get student's skill progress
 */
export async function getStudentSkills(studentId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('student_skills')
      .select(`
        *,
        skills:skill_id (*)
      `)
      .eq('student_id', studentId)
      .order('points_earned', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching student skills:', error)
    return { success: false, error }
  }
}

/**
 * Update student's skill proficiency
 */
export async function updateSkillProficiency(
  studentId: string,
  skillId: string,
  newLevel: ProficiencyLevel,
  pointsToAdd: number = 0
) {
  const supabase = await createClient()

  try {
    // Check if student already has this skill
    const { data: existing } = await supabase
      .from('student_skills')
      .select('*')
      .eq('student_id', studentId)
      .eq('skill_id', skillId)
      .single()

    const now = new Date().toISOString()

    if (!existing) {
      // Create new skill entry
      const { error: insertError } = await supabase
        .from('student_skills')
        .insert({
          student_id: studentId,
          skill_id: skillId,
          proficiency_level: newLevel,
          points_earned: pointsToAdd,
          last_assessed_at: now,
        })

      if (insertError) throw insertError
    } else {
      // Update existing skill
      const levelMap: Record<ProficiencyLevel, number> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
      }

      // Only update if new level is higher
      if (levelMap[newLevel] > levelMap[existing.proficiency_level]) {
        const updateData: Database['public']['Tables']['student_skills']['Update'] = {
          proficiency_level: newLevel,
          points_earned: existing.points_earned + pointsToAdd,
          last_assessed_at: now,
        }

        const { error: updateError } = await supabase
          .from('student_skills')
          .update(updateData)
          .eq('id', existing.id)

        if (updateError) throw updateError
      } else {
        // Just add points if level didn't improve
        const updateData: Database['public']['Tables']['student_skills']['Update'] = {
          points_earned: existing.points_earned + pointsToAdd,
          last_assessed_at: now,
        }

        const { error: updateError } = await supabase
          .from('student_skills')
          .update(updateData)
          .eq('id', existing.id)

        if (updateError) throw updateError
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating skill proficiency:', error)
    return { success: false, error }
  }
}

/**
 * Get skill statistics (how many students at each level)
 */
export async function getSkillStatistics(skillId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('student_skills')
      .select('proficiency_level')
      .eq('skill_id', skillId)

    if (error) throw error

    const stats = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0,
      total: data?.length || 0,
    }

    data?.forEach(skill => {
      stats[skill.proficiency_level]++
    })

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching skill statistics:', error)
    return { success: false, error }
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Group by category
    const grouped = data?.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, typeof data>)

    return { success: true, data: grouped }
  } catch (error) {
    console.error('Error fetching skills by category:', error)
    return { success: false, error }
  }
}
