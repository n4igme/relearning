import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { updatePaymentStatus } from '@/lib/actions/payments'
import { enrollInCourse } from '@/lib/actions/courses'

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
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripe || !webhookSecret || webhookSecret === 'your_stripe_webhook_secret') {
      return NextResponse.json(
        { error: 'Webhook processing is not configured' },
        { status: 503 }
      )
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  const userId = session.metadata?.userId
  const courseId = session.metadata?.courseId

  if (!userId || !courseId) {
    console.error('Missing metadata in session:', session.id)
    return
  }

  try {
    // Update payment status to completed
    await updatePaymentStatus({
      sessionId: session.id,
      status: 'completed',
      paymentIntentId: session.payment_intent as string,
    })

    // Enroll the student in the course (skip payment check since we just confirmed payment)
    const result = await enrollInCourse(userId, courseId, true)

    if (!result.success) {
      console.error('Failed to enroll student:', result.error)
      // Payment completed but enrollment failed - this should be logged for manual review
      // Consider sending an admin notification here
    } else {
      console.log('Successfully enrolled student in course:', courseId)
    }
  } catch (error) {
    console.error('Error processing checkout completion:', error)
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)

  try {
    await updatePaymentStatus({
      paymentIntentId: paymentIntent.id,
      status: 'completed',
    })
  } catch (error) {
    console.error('Error updating payment for succeeded intent:', error)
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id)

  try {
    await updatePaymentStatus({
      paymentIntentId: paymentIntent.id,
      status: 'failed',
    })
  } catch (error) {
    console.error('Error updating payment for failed intent:', error)
  }
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id)

  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) {
    console.error('No payment intent ID in refunded charge')
    return
  }

  try {
    // Update payment status to refunded
    await updatePaymentStatus({
      paymentIntentId,
      status: 'refunded',
    })

    // TODO: Optionally revoke course access here
    // You might want to implement logic to remove enrollment or disable access
  } catch (error) {
    console.error('Error updating payment for refunded charge:', error)
  }
}
