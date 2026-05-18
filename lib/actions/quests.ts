'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { awardPoints, checkAndAwardBadges, updateStreak } from './gamification'
import { updateSkillProficiency } from './skills'

type QuestAttemptInsert = Database['public']['Tables']['quest_attempts']['Insert']

/**
 * Submit a quest attempt and calculate score
 */
export async function submitQuestAttempt(
  questId: string,
  studentId: string,
  answers: Record<string, any>
) {
  const supabase = await createClient()

  try {
    // Verify caller is the student
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== studentId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get quest details
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select(`
        *,
        quest_questions (
          id,
          question_text,
          points,
          quest_options (
            id,
            is_correct
          )
        )
      `)
      .eq('id', questId)
      .maybeSingle()

    if (questError || !quest) {
      throw new Error('Quest not found')
    }

    // Check max attempts
    if (quest.max_attempts) {
      const { data: previousAttempts } = await supabase
        .from('quest_attempts')
        .select('id')
        .eq('quest_id', questId)
        .eq('student_id', studentId)

      if (previousAttempts && previousAttempts.length >= quest.max_attempts) {
        return {
          success: false,
          error: `Maximum attempts (${quest.max_attempts}) reached`,
        }
      }
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    interface QuestOption {
      id: string
      is_correct: boolean
    }

    interface QuestQuestion {
      id: string
      question_text: string
      points: number
      quest_options: QuestOption[]
    }

    const questions = quest.quest_questions as QuestQuestion[]

    questions.forEach((question) => {
      totalPoints += question.points || 1
      const studentAnswer = answers[question.id]

      // Check if answer is correct
      const correctOptions = question.quest_options.filter((opt) => opt.is_correct)
      const correctOptionIds = correctOptions.map((opt) => opt.id)

      if (Array.isArray(studentAnswer)) {
        // Multiple choice - check if arrays match
        const isCorrect =
          studentAnswer.length === correctOptionIds.length &&
          studentAnswer.every((id: string) => correctOptionIds.includes(id))
        if (isCorrect) earnedPoints += question.points || 1
      } else {
        // Single choice
        if (correctOptionIds.includes(studentAnswer)) {
          earnedPoints += question.points || 1
        }
      }
    })

    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = scorePercentage >= (quest.passing_score || 70)

    const startTime = new Date()
    const completedTime = new Date()

    // Save attempt
    const attemptData: QuestAttemptInsert = {
      quest_id: questId,
      student_id: studentId,
      score: scorePercentage,
      passed,
      started_at: startTime.toISOString(),
      completed_at: completedTime.toISOString(),
      time_taken: 0, // Can be calculated from frontend timer
      answers,
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('quest_attempts')
      .insert(attemptData)
      .select()
      .single()

    if (attemptError) throw attemptError

    // Post-insert race condition guard: verify we haven't exceeded max_attempts
    if (quest.max_attempts) {
      const { data: allAttempts } = await supabase
        .from('quest_attempts')
        .select('id')
        .eq('quest_id', questId)
        .eq('student_id', studentId)

      if (allAttempts && allAttempts.length > quest.max_attempts) {
        // Race condition detected — rollback this attempt
        await supabase.from('quest_attempts').delete().eq('id', attempt.id)
        return { success: false, error: `Maximum attempts (${quest.max_attempts}) reached` }
      }
    }

    // Award points if passed
    if (passed) {
      // Base points for quest completion
      let pointsToAward = 100

      // Difficulty multiplier
      const { data: course } = await supabase
        .from('courses')
        .select('difficulty')
        .eq('id', quest.course_id)
        .maybeSingle()

      if (course?.difficulty === 'intermediate') {
        pointsToAward = 150
      } else if (course?.difficulty === 'advanced') {
        pointsToAward = 200
      }

      // Perfect score bonus
      if (scorePercentage === 100) {
        pointsToAward += 50
      }

      // First attempt bonus
      const { data: previousAttempts } = await supabase
        .from('quest_attempts')
        .select('id')
        .eq('quest_id', questId)
        .eq('student_id', studentId)

      if (previousAttempts?.length === 1) {
        // This is the first attempt
        pointsToAward += 25
      }

      // Award points
      await awardPoints(studentId, pointsToAward, 'quest', questId)

      // Update streak
      await updateStreak(studentId)

      // Update skills based on course
      if (quest.course_id) {
        await updateCourseSkills(studentId, quest.course_id, scorePercentage)
      }

      // Check and award badges
      await checkAndAwardBadges(studentId)
    }

    return {
      success: true,
      data: {
        attempt,
        score: scorePercentage,
        passed,
        earnedPoints,
        totalPoints,
      },
    }
  } catch (error) {
    console.error('Error submitting quest attempt:', error)
    return { success: false, error }
  }
}

/**
 * Get student's quest attempts
 */
export async function getStudentQuestAttempts(studentId: string, questId?: string) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('quest_attempts')
      .select(`
        *,
        quests:quest_id (
          title,
          description,
          passing_score
        )
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })

    if (questId) {
      query = query.eq('quest_id', questId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching quest attempts:', error)
    return { success: false, error }
  }
}

/**
 * Get quest details with questions
 */
export async function getQuestWithQuestions(questId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        courses:course_id (
          title,
          difficulty
        ),
        quest_questions (
          id,
          question_text,
          question_type,
          points,
          order_index,
          quest_options (
            id,
            option_text,
            order_index
          )
        )
      `)
      .eq('id', questId)
      .single()

    if (error) throw error

    // Sort questions and options by order_index
    if (data.quest_questions) {
      data.quest_questions.sort((a: any, b: any) => a.order_index - b.order_index)
      data.quest_questions.forEach((q: any) => {
        if (q.quest_options) {
          q.quest_options.sort((a: any, b: any) => a.order_index - b.order_index)
        }
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching quest:', error)
    return { success: false, error }
  }
}

/**
 * Get all quests for a course
 */
export async function getCourseQuests(courseId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('created_at', { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching course quests:', error)
    return { success: false, error }
  }
}

/**
 * Update course-related skills based on performance
 */
async function updateCourseSkills(
  studentId: string,
  courseId: string,
  score: number
) {
  const supabase = await createClient()

  try {
    // Get skills associated with this course
    const { data: courseSkills } = await supabase
      .from('course_skills')
      .select('skill_id, proficiency_level_taught')
      .eq('course_id', courseId)

    if (!courseSkills || courseSkills.length === 0) return

    // Determine proficiency level based on score
    let proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    let pointsToAdd = 0

    if (score >= 95) {
      proficiencyLevel = 'expert'
      pointsToAdd = 50
    } else if (score >= 85) {
      proficiencyLevel = 'advanced'
      pointsToAdd = 40
    } else if (score >= 75) {
      proficiencyLevel = 'intermediate'
      pointsToAdd = 30
    } else {
      proficiencyLevel = 'beginner'
      pointsToAdd = 20
    }

    // Update each skill
    for (const courseSkill of courseSkills) {
      await updateSkillProficiency(
        studentId,
        courseSkill.skill_id,
        proficiencyLevel,
        pointsToAdd
      )
    }
  } catch (error) {
    console.error('Error updating course skills:', error)
  }
}

/**
 * Check if student can attempt quest
 */
export async function canAttemptQuest(questId: string, studentId: string) {
  const supabase = await createClient()

  try {
    const { data: quest } = await supabase
      .from('quests')
      .select('max_attempts, course_id')
      .eq('id', questId)
      .single()

    if (!quest) {
      return { canAttempt: false, reason: 'Quest not found' }
    }

    // Check if student is enrolled in the course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', quest.course_id)
      .eq('student_id', studentId)
      .single()

    if (!enrollment) {
      return { canAttempt: false, reason: 'Not enrolled in course' }
    }

    // Check max attempts
    if (quest.max_attempts) {
      const { data: attempts } = await supabase
        .from('quest_attempts')
        .select('id')
        .eq('quest_id', questId)
        .eq('student_id', studentId)

      if (attempts && attempts.length >= quest.max_attempts) {
        return {
          canAttempt: false,
          reason: `Maximum attempts (${quest.max_attempts}) reached`,
        }
      }
    }

    return { canAttempt: true }
  } catch (error) {
    console.error('Error checking quest eligibility:', error)
    return { canAttempt: false, reason: 'Error checking eligibility' }
  }
}

/**
 * Create a quest (mentor only)
 */
export async function createQuest(courseId: string, questData: {
  title: string
  description?: string
  passing_score?: number
  max_attempts?: number
  time_limit?: number
}) {
  const supabase = await createClient()

  try {
    const newQuest: Database['public']['Tables']['quests']['Insert'] = {
      course_id: courseId,
      title: questData.title,
      description: questData.description,
      passing_score: questData.passing_score || 70,
      max_attempts: questData.max_attempts,
      time_limit: questData.time_limit,
      is_published: false,
    }

    const { data, error } = await supabase
      .from('quests')
      .insert(newQuest)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating quest:', error)
    return { success: false, error }
  }
}

/**
 * Update quest
 */
export async function updateQuest(questId: string, questData: Partial<{
  title: string
  description: string
  passing_score: number
  max_attempts: number
  time_limit: number
  is_published: boolean
}>) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('quests')
      .update(questData)
      .eq('id', questId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error updating quest:', error)
    return { success: false, error }
  }
}

/**
 * Delete quest
 */
export async function deleteQuest(questId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting quest:', error)
    return { success: false, error }
  }
}

/**
 * Create question
 */
export async function createQuestion(questId: string, questionData: {
  question_text: string
  question_type: 'single_choice' | 'multiple_choice'
  points: number
  order_index: number
}) {
  const supabase = await createClient()

  try {
    const newQuestion: Database['public']['Tables']['quest_questions']['Insert'] = {
      quest_id: questId,
      question_text: questionData.question_text,
      question_type: questionData.question_type,
      points: questionData.points,
      order_index: questionData.order_index,
    }

    const { data, error } = await supabase
      .from('quest_questions')
      .insert(newQuestion)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating question:', error)
    return { success: false, error }
  }
}

/**
 * Update question
 */
export async function updateQuestion(questionId: string, questionData: Partial<{
  question_text: string
  question_type: 'single_choice' | 'multiple_choice'
  points: number
  order_index: number
}>) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('quest_questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error updating question:', error)
    return { success: false, error }
  }
}

/**
 * Delete question
 */
export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('quest_questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting question:', error)
    return { success: false, error }
  }
}

/**
 * Create option
 */
export async function createOption(questionId: string, optionData: {
  option_text: string
  is_correct: boolean
  order_index: number
}) {
  const supabase = await createClient()

  try {
    const newOption: Database['public']['Tables']['quest_options']['Insert'] = {
      question_id: questionId,
      option_text: optionData.option_text,
      is_correct: optionData.is_correct,
      order_index: optionData.order_index,
    }

    const { data, error } = await supabase
      .from('quest_options')
      .insert(newOption)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating option:', error)
    return { success: false, error }
  }
}

/**
 * Update option
 */
export async function updateOption(optionId: string, optionData: Partial<{
  option_text: string
  is_correct: boolean
  order_index: number
}>) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('quest_options')
      .update(optionData)
      .eq('id', optionId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error updating option:', error)
    return { success: false, error }
  }
}

/**
 * Delete option
 */
export async function deleteOption(optionId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('quest_options')
      .delete()
      .eq('id', optionId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting option:', error)
    return { success: false, error }
  }
}

/**
 * Get all quests for a course (mentor view — includes correct answers)
 */
export async function getAllCourseQuests(courseId: string) {
  const supabase = await createClient()

  try {
    // Verify caller is the course instructor
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (!course || course.instructor_id !== user.id) {
      return { success: false, error: 'Only the course instructor can view quiz details' }
    }

    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        quest_questions (
          id,
          question_text,
          question_type,
          points,
          order_index,
          quest_options (
            id,
            option_text,
            is_correct,
            order_index
          )
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const questsWithCount = data?.map((quest: any) => ({
      ...quest,
      question_count: quest.quest_questions?.length || 0,
    }))

    return { success: true, data: questsWithCount }
  } catch (error) {
    console.error('Error fetching all course quests:', error)
    return { success: false, error }
  }
}
