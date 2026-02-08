/**
 * Course Factory for Test Data Generation
 *
 * Provides factory functions for creating test course data with unique identifiers.
 * Implements Requirements 21.1 (factory functions) and 21.3 (unique identifiers).
 */

/**
 * Test course type matching the courses table structure
 */
export interface TestCourse {
  id: string
  title: string
  instructor_id: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  is_published: boolean
  is_approved: boolean
  description: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  materials?: TestMaterial[]
}

/**
 * Test material type matching the materials table structure
 */
export interface TestMaterial {
  id: string
  course_id: string
  title: string
  order_index: number
  description: string | null
  created_at: string
  updated_at: string
  sub_materials?: TestSubMaterial[]
}

/**
 * Test sub-material type matching the sub_materials table structure
 */
export interface TestSubMaterial {
  id: string
  material_id: string
  title: string
  content_type: 'video' | 'document' | 'text'
  order_index: number
  content_url: string | null
  content_text: string | null
  duration_minutes: number | null
  created_at: string
  updated_at: string
}

/**
 * Generates a unique ID for courses using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueCourseId = (): string => {
  return `test-course-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique ID for materials using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueMaterialId = (): string => {
  return `test-material-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique ID for sub-materials using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueSubMaterialId = (): string => {
  return `test-submaterial-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique instructor ID using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueInstructorId = (): string => {
  return `test-instructor-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Creates a test sub-material with default values
 *
 * @param materialId - The parent material ID
 * @param orderIndex - The order index for the sub-material
 * @param overrides - Partial sub-material properties to override defaults
 * @returns A complete TestSubMaterial object
 */
const createSubMaterial = (
  materialId: string,
  orderIndex: number,
  overrides: Partial<TestSubMaterial> = {}
): TestSubMaterial => {
  const now = new Date().toISOString()
  return {
    id: generateUniqueSubMaterialId(),
    material_id: materialId,
    title: `Test Sub-Material ${orderIndex + 1}`,
    content_type: 'text',
    order_index: orderIndex,
    content_url: null,
    content_text: `Test content for sub-material ${orderIndex + 1}`,
    duration_minutes: 10,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

/**
 * Creates a test material with default values
 *
 * @param courseId - The parent course ID
 * @param orderIndex - The order index for the material
 * @param subMaterialCount - Number of sub-materials to create (default: 2)
 * @param overrides - Partial material properties to override defaults
 * @returns A complete TestMaterial object with sub-materials
 */
const createMaterial = (
  courseId: string,
  orderIndex: number,
  subMaterialCount: number = 2,
  overrides: Partial<TestMaterial> = {}
): TestMaterial => {
  const now = new Date().toISOString()
  const materialId = generateUniqueMaterialId()

  const sub_materials: TestSubMaterial[] = []
  for (let i = 0; i < subMaterialCount; i++) {
    sub_materials.push(createSubMaterial(materialId, i))
  }

  return {
    id: materialId,
    course_id: courseId,
    title: `Test Material ${orderIndex + 1}`,
    order_index: orderIndex,
    description: `Description for test material ${orderIndex + 1}`,
    created_at: now,
    updated_at: now,
    sub_materials,
    ...overrides,
  }
}

/**
 * Course factory for creating test course data
 *
 * @example
 * // Create a basic course (unpublished, unapproved by default)
 * const course = courseFactory.create()
 *
 * // Create a course with custom properties
 * const customCourse = courseFactory.create({ title: 'My Course', price: 99 })
 *
 * // Create a published and approved course
 * const publishedCourse = courseFactory.createPublished()
 *
 * // Create a course with materials
 * const courseWithMaterials = courseFactory.createWithMaterials(3)
 */
export const courseFactory = {
  /**
   * Creates a test course with default values and optional overrides
   * Default state is unpublished and unapproved (draft state)
   *
   * @param overrides - Partial course properties to override defaults
   * @returns A complete TestCourse object
   */
  create: (overrides: Partial<TestCourse> = {}): TestCourse => {
    const now = new Date().toISOString()
    return {
      id: generateUniqueCourseId(),
      title: 'Test Course',
      instructor_id: generateUniqueInstructorId(),
      difficulty: 'beginner',
      price: 0,
      is_published: false,
      is_approved: false,
      description: 'A test course for unit testing',
      thumbnail_url: null,
      created_at: now,
      updated_at: now,
      ...overrides,
    }
  },

  /**
   * Creates a test course that is published and approved
   * Suitable for testing student-facing functionality
   *
   * @param overrides - Partial course properties to override defaults
   * @returns A TestCourse object with is_published=true and is_approved=true
   */
  createPublished: (overrides: Partial<TestCourse> = {}): TestCourse => {
    return courseFactory.create({
      is_published: true,
      is_approved: true,
      ...overrides,
    })
  },

  /**
   * Creates a test course with a specified number of materials
   * Each material includes 2 sub-materials by default
   *
   * @param materialCount - Number of materials to create for the course
   * @param overrides - Partial course properties to override defaults
   * @returns A TestCourse object with materials array populated
   */
  createWithMaterials: (
    materialCount: number,
    overrides: Partial<TestCourse> = {}
  ): TestCourse => {
    const courseId = generateUniqueCourseId()
    const now = new Date().toISOString()

    const materials: TestMaterial[] = []
    for (let i = 0; i < materialCount; i++) {
      materials.push(createMaterial(courseId, i))
    }

    return {
      id: courseId,
      title: 'Test Course with Materials',
      instructor_id: generateUniqueInstructorId(),
      difficulty: 'beginner',
      price: 0,
      is_published: false,
      is_approved: false,
      description: 'A test course with materials for unit testing',
      thumbnail_url: null,
      created_at: now,
      updated_at: now,
      materials,
      ...overrides,
    }
  },
}
