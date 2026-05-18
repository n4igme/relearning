import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EnrollmentRequestForm } from '@/components/enrollment-request-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default async function CourseEnrollPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(
      `
      *,
      profiles:instructor_id (
        full_name,
        avatar_url
      )
    `
    )
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    redirect('/courses')
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (existingEnrollment) {
    redirect(`/courses/${course.slug}/learn`)
  }

  // Check for pending enrollment request
  const { data: pendingRequest } = await supabase
    .from('enrollment_requests')
    .select('*')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'pending')
    .single()

  // If course is free, enroll directly
  if (!course.price || course.price === 0) {
    redirect(`/courses/${course.slug}`)
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {course.thumbnail_url && (
            <div className="hidden md:block">
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                width={200}
                height={120}
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-2">{course.short_description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-lg text-primary">
                {course.currency} {course.price?.toFixed(2)}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="capitalize">{course.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Request Alert */}
      {pendingRequest && (
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            <strong>Pending Approval:</strong> You have already submitted an enrollment request
            for this course on {new Date(pendingRequest.created_at).toLocaleDateString()}. We
            will review your payment proof and notify you once approved.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Payment Instructions
            </CardTitle>
            <CardDescription>Transfer to one of our bank accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Account 1 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-sm text-muted-foreground">Bank BCA</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Account Number:</span>
                  <span className="font-mono font-semibold">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Account Name:</span>
                  <span className="font-semibold">Your Business Name</span>
                </div>
              </div>
            </div>

            {/* Bank Account 2 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-sm text-muted-foreground">Bank Mandiri</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Account Number:</span>
                  <span className="font-mono font-semibold">0987654321</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Account Name:</span>
                  <span className="font-semibold">Your Business Name</span>
                </div>
              </div>
            </div>

            {/* Bank Account 3 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-sm text-muted-foreground">Bank BNI</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Account Number:</span>
                  <span className="font-mono font-semibold">1122334455</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Account Name:</span>
                  <span className="font-semibold">Your Business Name</span>
                </div>
              </div>
            </div>

            {/* Amount to Pay */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Amount to Pay:</div>
              <div className="text-2xl font-bold text-primary">
                {course.currency} {course.price?.toFixed(2)}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground">How to Pay:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Transfer the exact amount to one of the accounts above</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Fill in the enrollment form on the right</li>
                <li>Upload your payment proof</li>
                <li>Wait for admin approval (usually within 24 hours)</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Request Form */}
        <EnrollmentRequestForm
          courseId={course.id}
          coursePrice={course.price}
          courseCurrency={course.currency || 'IDR'}
          studentEmail={profile.email}
          studentName={profile.full_name}
          hasPendingRequest={!!pendingRequest}
        />
      </div>
    </div>
  )
}
