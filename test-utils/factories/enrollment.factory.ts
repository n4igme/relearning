/**
 * Enrollment Factory for Test Data Generation
 *
 * Provides factory functions for creating test enrollment data with unique identifiers.
 * Implements Requirements 21.1 (factory functions) and 21.3 (unique identifiers).
 */

/**
 * Test enrollment type matching the enrollments table structure
 */
export interface TestEnrollment {
  id: string
  student_id: string
  course_id: string
  progress_percentage: number
  completed_at: string | null
  enrolled_at: string
  created_at: string
  updated_at: string
}

/**
 * Generates a unique ID for enrollments using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueEnrollmentId = (): string => {
  return `test-enrollment-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Enrollment factory for creating test enrollment data
 *
 * @example
 * // Create a basic enrollment (in progress)
 * const enrollment = enrollmentFactory.create('student-123', 'course-456')
 *
 * // Create a completed enrollment
 * const completedEnrollment = enrollmentFactory.createCompleted('student-123', 'course-456')
 *
 * // Create an enrollment with custom progress
 * const partialEnrollment = enrollmentFactory.create('student-123', 'course-456', { progress_percentage: 50 })
 */
export const enrollmentFactory = {
  /**
   * Creates a test enrollment with default values and optional overrides
   * Default state is 0% progress and not completed
   *
   * @param studentId - The ID of the student being enrolled
   * @param courseId - The ID of the course for enrollment
   * @param overrides - Partial enrollment properties to override defaults
   * @returns A complete TestEnrollment object
   */
  create: (
    studentId: string,
    courseId: string,
    overrides: Partial<TestEnrollment> = {}
  ): TestEnrollment => {
    const now = new Date().toISOString()
    return {
      id: generateUniqueEnrollmentId(),
      student_id: studentId,
      course_id: courseId,
      progress_percentage: 0,
      completed_at: null,
      enrolled_at: now,
      created_at: now,
      updated_at: now,
      ...overrides,
    }
  },

  /**
   * Creates a test enrollment that is fully completed
   * Sets progress to 100% and completed_at to current timestamp
   *
   * @param studentId - The ID of the student being enrolled
   * @param courseId - The ID of the course for enrollment
   * @param overrides - Partial enrollment properties to override defaults
   * @returns A TestEnrollment object with progress_percentage=100 and completed_at set
   */
  createCompleted: (
    studentId: string,
    courseId: string,
    overrides: Partial<TestEnrollment> = {}
  ): TestEnrollment => {
    const now = new Date().toISOString()
    return enrollmentFactory.create(studentId, courseId, {
      progress_percentage: 100,
      completed_at: now,
      ...overrides,
    })
  },
}
