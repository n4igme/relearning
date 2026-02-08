/**
 * Quest Factory for Test Data Generation
 *
 * Provides factory functions for creating test quest data with unique identifiers.
 * Implements Requirements 21.1 (factory functions) and 21.3 (unique identifiers).
 */

/**
 * Test quest type matching the quests table structure
 */
export interface TestQuest {
  id: string
  course_id: string
  title: string
  passing_score: number
  max_attempts?: number
  questions?: TestQuestion[]
}

/**
 * Test question type matching the questions table structure
 */
export interface TestQuestion {
  id: string
  quest_id: string
  question_text: string
  question_type: 'single_choice' | 'multiple_choice'
  points: number
  options?: TestOption[]
}

/**
 * Test option type matching the options table structure
 */
export interface TestOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
}

/**
 * Generates a unique ID for quests using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueQuestId = (): string => {
  return `test-quest-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique ID for questions using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueQuestionId = (): string => {
  return `test-question-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique ID for options using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueOptionId = (): string => {
  return `test-option-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Creates test options for a question
 * By default creates 4 options with the first one being correct
 *
 * @param questionId - The parent question ID
 * @param correctIndex - Index of the correct option (default: 0)
 * @returns An array of TestOption objects
 */
const createOptions = (
  questionId: string,
  correctIndex: number = 0
): TestOption[] => {
  const optionTexts = ['Option A', 'Option B', 'Option C', 'Option D']
  return optionTexts.map((text, index) => ({
    id: generateUniqueOptionId(),
    question_id: questionId,
    option_text: text,
    is_correct: index === correctIndex,
  }))
}

/**
 * Creates a test question with default values and options
 *
 * @param questId - The parent quest ID
 * @param questionIndex - The index of the question (for generating unique text)
 * @param overrides - Partial question properties to override defaults
 * @returns A complete TestQuestion object with options
 */
const createQuestion = (
  questId: string,
  questionIndex: number,
  overrides: Partial<TestQuestion> = {}
): TestQuestion => {
  const questionId = generateUniqueQuestionId()
  return {
    id: questionId,
    quest_id: questId,
    question_text: `Test Question ${questionIndex + 1}?`,
    question_type: 'single_choice',
    points: 10,
    options: createOptions(questionId, 0),
    ...overrides,
  }
}

/**
 * Quest factory for creating test quest data
 *
 * @example
 * // Create a basic quest
 * const quest = questFactory.create('course-123')
 *
 * // Create a quest with custom properties
 * const customQuest = questFactory.create('course-123', { title: 'Final Exam', passing_score: 80 })
 *
 * // Create a quest with questions
 * const questWithQuestions = questFactory.createWithQuestions('course-123', 5)
 */
export const questFactory = {
  /**
   * Creates a test quest with default values and optional overrides
   * Default passing_score is 70, no max_attempts limit
   *
   * @param courseId - The ID of the course this quest belongs to
   * @param overrides - Partial quest properties to override defaults
   * @returns A complete TestQuest object
   */
  create: (courseId: string, overrides: Partial<TestQuest> = {}): TestQuest => {
    return {
      id: generateUniqueQuestId(),
      course_id: courseId,
      title: 'Test Quest',
      passing_score: 70,
      ...overrides,
    }
  },

  /**
   * Creates a test quest with a specified number of questions
   * Each question includes 4 options with the first being correct
   *
   * @param courseId - The ID of the course this quest belongs to
   * @param questionCount - Number of questions to create for the quest
   * @param overrides - Partial quest properties to override defaults
   * @returns A TestQuest object with questions array populated
   */
  createWithQuestions: (
    courseId: string,
    questionCount: number,
    overrides: Partial<TestQuest> = {}
  ): TestQuest => {
    const questId = generateUniqueQuestId()

    const questions: TestQuestion[] = []
    for (let i = 0; i < questionCount; i++) {
      questions.push(createQuestion(questId, i))
    }

    return {
      id: questId,
      course_id: courseId,
      title: 'Test Quest with Questions',
      passing_score: 70,
      questions,
      ...overrides,
    }
  },
}
