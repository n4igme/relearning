/**
 * Payment Factory for Test Data Generation
 *
 * Provides factory functions for creating test payment data with unique identifiers.
 * Implements Requirements 21.1 (factory functions) and 21.3 (unique identifiers).
 */

/**
 * Payment status type matching the payments table structure
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

/**
 * Test payment type matching the payments table structure
 */
export interface TestPayment {
  id: string
  student_id: string
  course_id: string
  amount: number
  status: PaymentStatus
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Generates a unique ID for payments using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniquePaymentId = (): string => {
  return `test-payment-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique Stripe session ID for testing
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueStripeSessionId = (): string => {
  return `cs_test_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique Stripe payment intent ID for testing
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueStripePaymentIntentId = (): string => {
  return `pi_test_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Payment factory for creating test payment data
 *
 * @example
 * // Create a basic payment (pending status)
 * const payment = paymentFactory.create('student-123', 'course-456')
 *
 * // Create a completed payment
 * const completedPayment = paymentFactory.createCompleted('student-123', 'course-456')
 *
 * // Create a payment with custom properties
 * const customPayment = paymentFactory.create('student-123', 'course-456', { amount: 199 })
 */
export const paymentFactory = {
  /**
   * Creates a test payment with default values and optional overrides
   * Default state is 'pending' status with no Stripe IDs
   *
   * @param studentId - The ID of the student making the payment
   * @param courseId - The ID of the course being purchased
   * @param overrides - Partial payment properties to override defaults
   * @returns A complete TestPayment object
   */
  create: (
    studentId: string,
    courseId: string,
    overrides: Partial<TestPayment> = {}
  ): TestPayment => {
    const now = new Date().toISOString()
    return {
      id: generateUniquePaymentId(),
      student_id: studentId,
      course_id: courseId,
      amount: 99,
      status: 'pending',
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      created_at: now,
      updated_at: now,
      ...overrides,
    }
  },

  /**
   * Creates a test payment that is fully completed
   * Sets status to 'completed' and includes Stripe session and payment intent IDs
   *
   * @param studentId - The ID of the student making the payment
   * @param courseId - The ID of the course being purchased
   * @param overrides - Partial payment properties to override defaults
   * @returns A TestPayment object with status='completed' and Stripe IDs set
   */
  createCompleted: (
    studentId: string,
    courseId: string,
    overrides: Partial<TestPayment> = {}
  ): TestPayment => {
    return paymentFactory.create(studentId, courseId, {
      status: 'completed',
      stripe_session_id: generateUniqueStripeSessionId(),
      stripe_payment_intent_id: generateUniqueStripePaymentIntentId(),
      ...overrides,
    })
  },
}
