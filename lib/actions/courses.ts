'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { awardPoints, checkAndAwardBadges, updateStreak } from './gamification'
import { updateSkillProficiency } from './skills'

type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert']
type ProgressInsert = Database['public']['Tables']['progress']['Insert']

/**
 * Enroll student in a course
 */
export async function enrollInCourse(studentId: string, courseId: string) {
  const supabase = await createClient()

  try {
    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return { success: false, error: 'Already enrolled in this course' }
    }

    // Create enrollment
    const enrollmentData: EnrollmentInsert = {
      student_id: studentId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      progress_percentage: 0,
    }

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single()

    if (error) throw error

    // Update streak on enrollment (student activity)
    await updateStreak(studentId)

    return { success: true, data: enrollment }
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return { success: false, error }
  }
}

/**
 * Mark a sub-material (lesson/video) as completed
 */
export async function markSubMaterialCompleted(
  enrollmentId: string,
  subMaterialId: string,
  timeSpent: number = 0
) {
  const supabase = await createClient()

  try {
    // Check if progress entry exists
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('sub_material_id', subMaterialId)
      .single()

    if (existing) {
      // Update existing progress
      const { error } = await supabase
        .from('progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          time_spent: existing.time_spent + timeSpent,
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Create new progress entry
      const progressData: ProgressInsert = {
        enrollment_id: enrollmentId,
        sub_material_id: subMaterialId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        time_spent: timeSpent,
        last_position: 0,
      }

      const { error } = await supabase.from('progress').insert(progressData)

      if (error) throw error
    }

    // Recalculate course progress
    await updateCourseProgress(enrollmentId)

    // Get student ID from enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('id', enrollmentId)
      .single()

    if (enrollment) {
      // Update streak
      await updateStreak(enrollment.student_id)
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking sub-material completed:', error)
    return { success: false, error }
  }
}

/**
 * Update course progress percentage
 */
async function updateCourseProgress(enrollmentId: string) {
  const supabase = await createClient()

  try {
    // Get enrollment details
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('course_id, student_id')
      .eq('id', enrollmentId)
      .single()

    if (!enrollment) return

    // Get total sub-materials in course
    const { data: materials } = await supabase
      .from('materials')
      .select(`
        id,
        sub_materials (id)
      `)
      .eq('course_id', enrollment.course_id)

    const totalSubMaterials =
      materials?.reduce((sum, material: any) => sum + (material.sub_materials?.length || 0), 0) || 0

    if (totalSubMaterials === 0) return

    // Get completed count
    const { data: progress } = await supabase
      .from('progress')
      .select('is_completed')
      .eq('enrollment_id', enrollmentId)
      .eq('is_completed', true)

    const completedCount = progress?.length || 0
    const progressPercentage = (completedCount / totalSubMaterials) * 100

    // Update enrollment
    const updateData: Database['public']['Tables']['enrollments']['Update'] = {
      progress_percentage: progressPercentage,
      last_accessed_at: new Date().toISOString(),
    }

    await supabase.from('enrollments').update(updateData).eq('id', enrollmentId)

    // Check if course is completed (100% or close to it)
    if (progressPercentage >= 100) {
      await completeCourse(enrollmentId, enrollment.student_id, enrollment.course_id)
    }
  } catch (error) {
    console.error('Error updating course progress:', error)
  }
}

/**
 * Complete a course and award points/badges
 */
async function completeCourse(enrollmentId: string, studentId: string, courseId: string) {
  const supabase = await createClient()

  try {
    // Check if already marked as completed
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('completed_at')
      .eq('id', enrollmentId)
      .single()

    if (enrollment?.completed_at) {
      return // Already completed
    }

    // Mark enrollment as completed
    const updateData: Database['public']['Tables']['enrollments']['Update'] = {
      completed_at: new Date().toISOString(),
      progress_percentage: 100,
    }

    await supabase.from('enrollments').update(updateData).eq('id', enrollmentId)

    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('difficulty')
      .eq('id', courseId)
      .single()

    // Award points based on difficulty
    let pointsToAward = 200 // Beginner
    if (course?.difficulty === 'intermediate') {
      pointsToAward = 400
    } else if (course?.difficulty === 'advanced') {
      pointsToAward = 800
    }

    await awardPoints(studentId, pointsToAward, 'course', courseId)

    // Update all course skills to intermediate level (course completion)
    const { data: courseSkills } = await supabase
      .from('course_skills')
      .select('skill_id, proficiency_level_taught')
      .eq('course_id', courseId)

    if (courseSkills) {
      for (const courseSkill of courseSkills) {
        // Award skill points based on taught level
        let skillPoints = 50
        if (courseSkill.proficiency_level_taught === 'intermediate') {
          skillPoints = 100
        } else if (courseSkill.proficiency_level_taught === 'advanced') {
          skillPoints = 150
        } else if (courseSkill.proficiency_level_taught === 'expert') {
          skillPoints = 200
        }

        await updateSkillProficiency(
          studentId,
          courseSkill.skill_id,
          courseSkill.proficiency_level_taught as any,
          skillPoints
        )
      }
    }

    // Check and award badges
    await checkAndAwardBadges(studentId)

    // Generate certificate
    await generateCertificate(studentId, courseId)
  } catch (error) {
    console.error('Error completing course:', error)
  }
}

/**
 * Generate certificate for course completion
 */
async function generateCertificate(studentId: string, courseId: string) {
  const supabase = await createClient()

  try {
    // Check if certificate already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (existing) return

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Get average quest score for this course
    const { data: quests } = await supabase
      .from('quests')
      .select('id')
      .eq('course_id', courseId)

    let averageScore = 0
    if (quests && quests.length > 0) {
      const questIds = quests.map((q) => q.id)

      const { data: attempts } = await supabase
        .from('quest_attempts')
        .select('score')
        .in('quest_id', questIds)
        .eq('student_id', studentId)
        .eq('passed', true)

      if (attempts && attempts.length > 0) {
        const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0)
        averageScore = totalScore / attempts.length
      }
    }

    // Create certificate
    const certificateData: Database['public']['Tables']['certificates']['Insert'] = {
      student_id: studentId,
      course_id: courseId,
      certificate_number: certificateNumber,
      issued_at: new Date().toISOString(),
      score: averageScore,
      verification_url: `/certificates/${certificateNumber}`,
    }

    await supabase.from('certificates').insert(certificateData)
  } catch (error) {
    console.error('Error generating certificate:', error)
  }
}

/**
 * Get student's enrollments
 */
export async function getStudentEnrollments(studentId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses:course_id (
          id,
          title,
          description,
          thumbnail_url,
          difficulty,
          category
        )
      `)
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return { success: false, error }
  }
}

/**
 * Get course progress details
 */
export async function getCourseProgress(enrollmentId: string) {
  const supabase = await createClient()

  try {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select(`
        *,
        progress (
          *,
          sub_materials:sub_material_id (
            id,
            title,
            video_duration
          )
        )
      `)
      .eq('id', enrollmentId)
      .single()

    if (!enrollment) {
      return { success: false, error: 'Enrollment not found' }
    }

    return { success: true, data: enrollment }
  } catch (error) {
    console.error('Error fetching course progress:', error)
    return { success: false, error }
  }
}

/**
 * Get all published courses
 */
export async function getPublishedCourses() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id (
          full_name
        )
      `)
      .eq('is_published', true)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return { success: false, error }
  }
}

/**
 * Get course by ID with full details
 */
export async function getCourseById(courseId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id (
          full_name,
          avatar_url,
          bio
        ),
        materials (
          *,
          sub_materials (
            *
          )
        )
      `)
      .eq('id', courseId)
      .single()

    if (error) throw error

    // Sort materials and sub_materials by order_index
    if (data.materials) {
      data.materials.sort((a: any, b: any) => a.order_index - b.order_index)
      data.materials.forEach((material: any) => {
        if (material.sub_materials) {
          material.sub_materials.sort((a: any, b: any) => a.order_index - b.order_index)
        }
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching course:', error)
    return { success: false, error }
  }
}
