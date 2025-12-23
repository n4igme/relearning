// Auto-generated types based on Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'mentor' | 'student'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

// Cybersecurity platform types
export type SkillCategory = 'web' | 'network' | 'cryptography' | 'social_engineering' | 'reverse_engineering' | 'forensics'
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type BadgeRequirementType = 'quest_score' | 'course_completion' | 'skill_mastery' | 'consecutive_days' | 'total_points'
export type SecurityToolCategory = 'scanner' | 'exploitation' | 'reconnaissance' | 'forensics' | 'cryptography' | 'wireless'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          avatar_url: string | null
          bio: string | null
          is_approved: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          avatar_url?: string | null
          bio?: string | null
          is_approved?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          bio?: string | null
          is_approved?: boolean
          is_active?: boolean
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          short_description: string | null
          thumbnail_url: string | null
          category: string
          difficulty: Difficulty
          price: number
          currency: string
          is_published: boolean
          is_approved: boolean
          instructor_id: string
          enrollment_count: number
          average_rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          category: string
          difficulty: Difficulty
          price?: number
          currency?: string
          is_published?: boolean
          is_approved?: boolean
          instructor_id: string
          enrollment_count?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          category?: string
          difficulty?: Difficulty
          price?: number
          currency?: string
          is_published?: boolean
          is_approved?: boolean
          instructor_id?: string
          enrollment_count?: number
          average_rating?: number
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          updated_at?: string
        }
      }
      sub_materials: {
        Row: {
          id: string
          material_id: string
          title: string
          content: string | null
          video_url: string | null
          video_duration: number | null
          cloudinary_public_id: string | null
          document_url: string | null
          cloudinary_file_id: string | null
          order_index: number
          is_preview: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          material_id: string
          title: string
          content?: string | null
          video_url?: string | null
          video_duration?: number | null
          cloudinary_public_id?: string | null
          document_url?: string | null
          cloudinary_file_id?: string | null
          order_index: number
          is_preview?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          material_id?: string
          title?: string
          content?: string | null
          video_url?: string | null
          video_duration?: number | null
          cloudinary_public_id?: string | null
          document_url?: string | null
          cloudinary_file_id?: string | null
          order_index?: number
          is_preview?: boolean
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
          progress_percentage: number
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          last_accessed_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          last_accessed_at?: string | null
        }
      }
      progress: {
        Row: {
          id: string
          enrollment_id: string
          sub_material_id: string
          is_completed: boolean
          completed_at: string | null
          time_spent: number
          last_position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          sub_material_id: string
          is_completed?: boolean
          completed_at?: string | null
          time_spent?: number
          last_position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          sub_material_id?: string
          is_completed?: boolean
          completed_at?: string | null
          time_spent?: number
          last_position?: number
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          passing_score: number
          time_limit: number | null
          max_attempts: number | null
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          passing_score?: number
          time_limit?: number | null
          max_attempts?: number | null
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          passing_score?: number
          time_limit?: number | null
          max_attempts?: number | null
          is_published?: boolean
          created_by?: string | null
          updated_at?: string
        }
      }
      quest_questions: {
        Row: {
          id: string
          quest_id: string
          question_text: string
          question_type: QuestionType
          points: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          quest_id: string
          question_text: string
          question_type: QuestionType
          points?: number
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          quest_id?: string
          question_text?: string
          question_type?: QuestionType
          points?: number
          order_index?: number
        }
      }
      quest_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          is_correct?: boolean
          order_index?: number
        }
      }
      quest_attempts: {
        Row: {
          id: string
          quest_id: string
          student_id: string
          score: number | null
          passed: boolean
          started_at: string
          completed_at: string | null
          time_taken: number | null
          answers: Json | null
        }
        Insert: {
          id?: string
          quest_id: string
          student_id: string
          score?: number | null
          passed?: boolean
          started_at?: string
          completed_at?: string | null
          time_taken?: number | null
          answers?: Json | null
        }
        Update: {
          id?: string
          quest_id?: string
          student_id?: string
          score?: number | null
          passed?: boolean
          started_at?: string
          completed_at?: string | null
          time_taken?: number | null
          answers?: Json | null
        }
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          course_id: string
          certificate_number: string
          issued_at: string
          score: number | null
          verification_url: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          certificate_number: string
          issued_at?: string
          score?: number | null
          verification_url?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          certificate_number?: string
          issued_at?: string
          score?: number | null
          verification_url?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          amount: number
          currency: string
          status: PaymentStatus
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          amount: number
          currency?: string
          status: PaymentStatus
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          amount?: number
          currency?: string
          status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          course_id: string
          student_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          student_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          student_id?: string
          rating?: number
          comment?: string | null
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string | null
          category: SkillCategory
          icon_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: SkillCategory
          icon_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: SkillCategory
          icon_url?: string | null
          updated_at?: string
        }
      }
      student_skills: {
        Row: {
          id: string
          student_id: string
          skill_id: string
          proficiency_level: ProficiencyLevel
          points_earned: number
          last_assessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          skill_id: string
          proficiency_level?: ProficiencyLevel
          points_earned?: number
          last_assessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          skill_id?: string
          proficiency_level?: ProficiencyLevel
          points_earned?: number
          last_assessed_at?: string | null
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          badge_tier: BadgeTier
          requirement_type: BadgeRequirementType
          requirement_criteria: Json
          points_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          badge_tier: BadgeTier
          requirement_type: BadgeRequirementType
          requirement_criteria: Json
          points_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          badge_tier?: BadgeTier
          requirement_type?: BadgeRequirementType
          requirement_criteria?: Json
          points_reward?: number
        }
      }
      student_badges: {
        Row: {
          id: string
          student_id: string
          badge_id: string
          earned_at: string
          evidence: Json | null
        }
        Insert: {
          id?: string
          student_id: string
          badge_id: string
          earned_at?: string
          evidence?: Json | null
        }
        Update: {
          id?: string
          student_id?: string
          badge_id?: string
          earned_at?: string
          evidence?: Json | null
        }
      }
      leaderboard_stats: {
        Row: {
          id: string
          student_id: string
          total_points: number
          badges_earned: number
          courses_completed: number
          quests_completed: number
          average_score: number
          current_streak_days: number
          longest_streak_days: number
          last_activity_date: string | null
          rank: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_points?: number
          badges_earned?: number
          courses_completed?: number
          quests_completed?: number
          average_score?: number
          current_streak_days?: number
          longest_streak_days?: number
          last_activity_date?: string | null
          rank?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          total_points?: number
          badges_earned?: number
          courses_completed?: number
          quests_completed?: number
          average_score?: number
          current_streak_days?: number
          longest_streak_days?: number
          last_activity_date?: string | null
          rank?: number | null
          updated_at?: string
        }
      }
      security_tools: {
        Row: {
          id: string
          name: string
          category: SecurityToolCategory
          description: string | null
          documentation_url: string | null
          icon_url: string | null
          difficulty_level: Difficulty
          related_course_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: SecurityToolCategory
          description?: string | null
          documentation_url?: string | null
          icon_url?: string | null
          difficulty_level: Difficulty
          related_course_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: SecurityToolCategory
          description?: string | null
          documentation_url?: string | null
          icon_url?: string | null
          difficulty_level?: Difficulty
          related_course_ids?: string[] | null
          updated_at?: string
        }
      }
      course_skills: {
        Row: {
          id: string
          course_id: string
          skill_id: string
          proficiency_level_taught: ProficiencyLevel
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          skill_id: string
          proficiency_level_taught: ProficiencyLevel
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          skill_id?: string
          proficiency_level_taught?: ProficiencyLevel
        }
      }
    }
  }
}
