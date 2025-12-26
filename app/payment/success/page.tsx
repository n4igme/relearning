import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPaymentBySessionId } from '@/lib/actions/payments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'

async function PaymentSuccessContent({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              Invalid Payment Session
            </CardTitle>
            <CardDescription>No payment session ID provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get payment details
  const payment = await getPaymentBySessionId(sessionId)

  if (!payment) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <XCircle className="w-6 h-6" />
              Payment Not Found
            </CardTitle>
            <CardDescription>
              We couldn't find your payment details. Your payment may still be processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you completed your payment, please wait a few moments and check your dashboard.
              If the issue persists, please contact support.
            </p>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline">Browse Courses</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get course details
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('*, profiles:instructor_id(full_name)')
    .eq('id', payment.course_id)
    .single()

  if (!course) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            You've successfully enrolled in {course.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium">{course.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Instructor</span>
              <span className="font-medium">{course.profiles?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">
                {payment.currency} {payment.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>You've been automatically enrolled in the course</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Start learning immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Track your progress and earn points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Get certified upon completion</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href={`/courses/${course.slug}/learn`} className="flex-1">
              <Button className="w-full" size="lg">
                Start Learning
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Receipt Note */}
          <p className="text-xs text-center text-muted-foreground">
            A receipt has been sent to your email address.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <Suspense
      fallback={
        <div className="container max-w-2xl mx-auto py-16 px-4">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Verifying your payment...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  )
}
