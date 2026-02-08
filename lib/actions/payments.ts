'use server'

import { createClient } from '@/lib/supabase/server'

export interface PaymentRecord {
  id: string
  student_id: string
  course_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Create a payment record in the database
 */
export async function createPayment({
  studentId,
  courseId,
  amount,
  currency = 'USD',
  stripeSessionId,
}: {
  studentId: string
  courseId: string
  amount: number
  currency?: string
  stripeSessionId?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .insert({
      student_id: studentId,
      course_id: courseId,
      amount,
      currency,
      status: 'pending',
      stripe_session_id: stripeSessionId || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    throw new Error('Failed to create payment record')
  }

  return data as PaymentRecord
}

/**
 * Update payment status
 */
export async function updatePaymentStatus({
  paymentIntentId,
  status,
  sessionId,
}: {
  paymentIntentId?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  sessionId?: string
}) {
  if (!paymentIntentId && !sessionId) {
    throw new Error('Either paymentIntentId or sessionId must be provided')
  }

  const supabase = await createClient()

  // Find payment by either payment intent ID or session ID
  let query = supabase.from('payments').select()

  if (paymentIntentId) {
    query = query.eq('stripe_payment_intent_id', paymentIntentId)
  } else if (sessionId) {
    query = query.eq('stripe_session_id', sessionId)
  }

  const { data: existingPayment, error: findError } = await query.maybeSingle()

  if (findError || !existingPayment) {
    console.error('Payment not found:', findError)
    throw new Error('Payment record not found')
  }

  // Update the payment status
  const updateData: {
    status: string
    updated_at: string
    stripe_payment_intent_id?: string
  } = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (paymentIntentId && !existingPayment.stripe_payment_intent_id) {
    updateData.stripe_payment_intent_id = paymentIntentId
  }

  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', existingPayment.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment:', error)
    throw new Error('Failed to update payment status')
  }

  return data as PaymentRecord
}

/**
 * Get payment by session ID
 */
export async function getPaymentBySessionId(sessionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching payment:', error)
    return null
  }

  return data as PaymentRecord | null
}

/**
 * Get payment by payment intent ID
 */
export async function getPaymentByIntentId(paymentIntentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching payment:', error)
    return null
  }

  return data as PaymentRecord | null
}

/**
 * Check if student has paid for a course
 */
export async function hasStudentPaidForCourse(studentId: string, courseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('status', 'completed')
    .maybeSingle()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * Get all payments for a student
 */
export async function getStudentPayments(studentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      courses (
        title,
        slug,
        thumbnail_url
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching student payments:', error)
    return []
  }

  return data
}

/**
 * Get all payments for a course (for instructors/admins)
 */
export async function getCoursePayments(courseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching course payments:', error)
    return []
  }

  return data
}
