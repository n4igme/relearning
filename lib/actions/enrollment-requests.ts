'use server'

import { createClient } from '@/lib/supabase/server'
import { enrollInCourseInternal } from './courses'

export interface EnrollmentRequest {
  id: string
  student_id: string
  course_id: string
  full_name: string
  email: string
  phone_number: string | null
  amount_paid: number
  currency: string
  bank_account_used: string | null
  payment_date: string | null
  payment_proof_url: string | null
  payment_reference: string | null
  status: 'pending' | 'approved' | 'rejected'
  student_notes: string | null
  admin_notes: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Create a new enrollment request
 */
export async function createEnrollmentRequest(data: {
  courseId: string
  fullName: string
  email: string
  phoneNumber?: string
  amountPaid: number
  bankAccountUsed?: string
  paymentDate?: string
  paymentProofUrl?: string
  paymentReference?: string
  studentNotes?: string
}) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if student already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', data.courseId)
      .single()

    if (existingEnrollment) {
      return { success: false, error: 'You are already enrolled in this course' }
    }

    // Check for pending request
    const { data: existingRequest } = await supabase
      .from('enrollment_requests')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('course_id', data.courseId)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return {
        success: false,
        error: 'You already have a pending enrollment request for this course',
      }
    }

    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('price, currency')
      .eq('id', data.courseId)
      .single()

    if (!course) {
      return { success: false, error: 'Course not found' }
    }

    // Create enrollment request
    const { data: request, error } = await supabase
      .from('enrollment_requests')
      .insert({
        student_id: user.id,
        course_id: data.courseId,
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber || null,
        amount_paid: data.amountPaid,
        currency: course.currency || 'IDR',
        bank_account_used: data.bankAccountUsed || null,
        payment_date: data.paymentDate || null,
        payment_proof_url: data.paymentProofUrl || null,
        payment_reference: data.paymentReference || null,
        student_notes: data.studentNotes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating enrollment request:', error)
      return { success: false, error: 'Failed to create enrollment request' }
    }

    return { success: true, data: request }
  } catch (error) {
    console.error('Error in createEnrollmentRequest:', error)
    return { success: false, error: 'An error occurred' }
  }
}

/**
 * Get all enrollment requests (admin only)
 */
export async function getAllEnrollmentRequests(status?: 'pending' | 'approved' | 'rejected') {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }

  try {
    let query = supabase
      .from('enrollment_requests')
      .select(
        `
        *,
        student:student_id (
          full_name,
          email,
          avatar_url
        ),
        course:course_id (
          title,
          slug,
          price,
          currency,
          thumbnail_url
        ),
        approver:approved_by (
          full_name
        ),
        rejecter:rejected_by (
          full_name
        )
      `
      )
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching enrollment requests:', error)
      return { success: false, error: 'Failed to fetch enrollment requests' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getAllEnrollmentRequests:', error)
    return { success: false, error: 'An error occurred' }
  }
}

/**
 * Get student's own enrollment requests
 */
export async function getMyEnrollmentRequests() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase
      .from('enrollment_requests')
      .select(
        `
        *,
        course:course_id (
          title,
          slug,
          price,
          currency,
          thumbnail_url,
          difficulty
        )
      `
      )
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching student enrollment requests:', error)
      return { success: false, error: 'Failed to fetch enrollment requests' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getMyEnrollmentRequests:', error)
    return { success: false, error: 'An error occurred' }
  }
}

/**
 * Approve enrollment request (admin only)
 */
export async function approveEnrollmentRequest(requestId: string, adminNotes?: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }

  try {
    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('enrollment_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Enrollment request not found' }
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Request has already been processed' }
    }

    // Update request status to approved
    const { error: updateError } = await supabase
      .from('enrollment_requests')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating enrollment request:', updateError)
      return { success: false, error: 'Failed to approve request' }
    }

    // Enroll the student in the course (skip payment check)
    const enrollResult = await enrollInCourseInternal(request.student_id, request.course_id)

    if (!enrollResult.success) {
      // Rollback approval if enrollment fails
      await supabase
        .from('enrollment_requests')
        .update({
          status: 'pending',
          approved_by: null,
          approved_at: null,
          admin_notes: null,
        })
        .eq('id', requestId)

      return { success: false, error: 'Failed to enroll student: ' + enrollResult.error }
    }

    return { success: true, message: 'Enrollment request approved and student enrolled' }
  } catch (error) {
    console.error('Error in approveEnrollmentRequest:', error)
    return { success: false, error: 'An error occurred' }
  }
}

/**
 * Reject enrollment request (admin only)
 */
export async function rejectEnrollmentRequest(requestId: string, adminNotes: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }

  try {
    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('enrollment_requests')
      .select('status')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Enrollment request not found' }
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Request has already been processed' }
    }

    // Update request status to rejected
    const { error: updateError } = await supabase
      .from('enrollment_requests')
      .update({
        status: 'rejected',
        rejected_by: user.id,
        rejected_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error rejecting enrollment request:', updateError)
      return { success: false, error: 'Failed to reject request' }
    }

    return { success: true, message: 'Enrollment request rejected' }
  } catch (error) {
    console.error('Error in rejectEnrollmentRequest:', error)
    return { success: false, error: 'An error occurred' }
  }
}

/**
 * Get enrollment request by ID
 */
export async function getEnrollmentRequestById(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase
      .from('enrollment_requests')
      .select(
        `
        *,
        student:student_id (
          full_name,
          email
        ),
        course:course_id (
          title,
          slug,
          price,
          currency
        )
      `
      )
      .eq('id', requestId)
      .single()

    if (error) {
      console.error('Error fetching enrollment request:', error)
      return { success: false, error: 'Enrollment request not found' }
    }

    // Check if user is the student or an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data.student_id !== user.id && profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getEnrollmentRequestById:', error)
    return { success: false, error: 'An error occurred' }
  }
}
