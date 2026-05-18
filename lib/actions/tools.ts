'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type ToolCategory = Database['public']['Tables']['security_tools']['Row']['category']
type DifficultyLevel = Database['public']['Tables']['security_tools']['Row']['difficulty_level']

/**
 * Get all security tools with optional filtering
 */
export async function getAllTools(filters?: {
  category?: ToolCategory
  difficultyLevel?: DifficultyLevel
  searchQuery?: string
}) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('security_tools')
      .select('*')
      .order('name', { ascending: true })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.difficultyLevel) {
      query = query.eq('difficulty_level', filters.difficultyLevel)
    }

    if (filters?.searchQuery) {
      // Escape SQL LIKE wildcards to prevent pattern injection
      const escaped = filters.searchQuery.replace(/[%_\\]/g, '\\$&')
      query = query.or(
        `name.ilike.%${escaped}%,description.ilike.%${escaped}%`
      )
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching security tools:', error)
    return { success: false, error }
  }
}

/**
 * Get tools grouped by category
 */
export async function getToolsByCategory() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('security_tools')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Group by category
    const grouped = data?.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = []
      }
      acc[tool.category].push(tool)
      return acc
    }, {} as Record<string, typeof data>)

    return { success: true, data: grouped }
  } catch (error) {
    console.error('Error fetching tools by category:', error)
    return { success: false, error }
  }
}

/**
 * Get tool statistics
 */
export async function getToolStatistics() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('security_tools')
      .select('category, difficulty_level')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      byCategory: {} as Record<string, number>,
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    }

    data?.forEach((tool) => {
      // Count by category
      if (!stats.byCategory[tool.category]) {
        stats.byCategory[tool.category] = 0
      }
      stats.byCategory[tool.category]++

      // Count by difficulty
      stats.byDifficulty[tool.difficulty_level]++
    })

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching tool statistics:', error)
    return { success: false, error }
  }
}
