import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createPayment } from '@/lib/actions/payments'

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || secretKey === 'your_stripe_secret_key') {
    return null
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  })
}

export async function POST(req: NextRequest) {
  try {
    // CSRF Protection: Verify origin header matches expected domain
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL

    if (expectedOrigin) {
      const isValidOrigin = origin === expectedOrigin || referer?.startsWith(expectedOrigin)
      if (!isValidOrigin) {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        )
      }
    }

    const stripe = getStripe()

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact the administrator.' },
        { status: 503 }
      )
    }

    const { courseId } = await req.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Validate courseId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID format' }, { status: 400 })
    }

    // Get the authenticated user
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if course is free
    if (course.price === 0 || course.price === null) {
      return NextResponse.json(
        { error: 'This course is free. No payment required.' },
        { status: 400 }
      )
    }

    // Check if student already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check if student already has a completed payment for this course
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .maybeSingle()

    if (existingPayment) {
      return NextResponse.json(
        { error: 'You have already paid for this course' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase() || 'usd',
            product_data: {
              name: course.title,
              description: course.short_description || course.description || undefined,
              images: course.thumbnail_url ? [course.thumbnail_url] : undefined,
            },
            unit_amount: Math.round(course.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}?payment=cancelled`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        courseId: course.id,
        userEmail: profile.email,
      },
    })

    // Create payment record in database
    await createPayment({
      studentId: user.id,
      courseId: course.id,
      amount: course.price,
      currency: course.currency || 'USD',
      stripeSessionId: session.id,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
