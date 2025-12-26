'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createEnrollmentRequest } from '@/lib/actions/enrollment-requests'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface EnrollmentRequestFormProps {
  courseId: string
  coursePrice: number
  courseCurrency: string
  studentEmail: string
  studentName: string
  hasPendingRequest?: boolean
}

export function EnrollmentRequestForm({
  courseId,
  coursePrice,
  courseCurrency,
  studentEmail,
  studentName,
  hasPendingRequest = false,
}: EnrollmentRequestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: studentName,
    email: studentEmail,
    phoneNumber: '',
    amountPaid: coursePrice.toString(),
    bankUsed: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentReference: '',
    notes: '',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    try {
      setIsUploading(true)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'payment_proofs') // You'll need to create this in Cloudinary
      formData.append('folder', 'enrollment_requests')

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadedImageUrl(data.secure_url)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadedImageUrl) {
      alert('Please upload proof of payment')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createEnrollmentRequest({
        courseId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        amountPaid: parseFloat(formData.amountPaid),
        bankAccountUsed: formData.bankUsed || undefined,
        paymentDate: formData.paymentDate || undefined,
        paymentProofUrl: uploadedImageUrl,
        paymentReference: formData.paymentReference || undefined,
        studentNotes: formData.notes || undefined,
      })

      if (result.success) {
        alert('Enrollment request submitted successfully! We will review your payment and notify you within 24 hours.')
        router.push('/dashboard')
      } else {
        alert(result.error || 'Failed to submit enrollment request')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Request Form</CardTitle>
        <CardDescription>
          Submit your payment proof to enroll in this course
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={hasPendingRequest}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={hasPendingRequest}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (WhatsApp)</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+62 812 3456 7890"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={hasPendingRequest}
            />
          </div>

          {/* Amount Paid */}
          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Paid *</Label>
            <Input
              id="amountPaid"
              type="number"
              step="0.01"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              required
              disabled={hasPendingRequest}
            />
            <p className="text-xs text-muted-foreground">
              Expected: {courseCurrency} {coursePrice.toFixed(2)}
            </p>
          </div>

          {/* Bank Used */}
          <div className="space-y-2">
            <Label htmlFor="bankUsed">Bank Account Used</Label>
            <Input
              id="bankUsed"
              placeholder="e.g., BCA, Mandiri, BNI"
              value={formData.bankUsed}
              onChange={(e) => setFormData({ ...formData, bankUsed: e.target.value })}
              disabled={hasPendingRequest}
            />
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              disabled={hasPendingRequest}
            />
          </div>

          {/* Payment Reference */}
          <div className="space-y-2">
            <Label htmlFor="paymentReference">Transaction Reference Number</Label>
            <Input
              id="paymentReference"
              placeholder="e.g., TRX123456789"
              value={formData.paymentReference}
              onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
              disabled={hasPendingRequest}
            />
          </div>

          {/* Payment Proof Upload */}
          <div className="space-y-2">
            <Label htmlFor="paymentProof">Payment Proof (Screenshot) *</Label>
            {previewUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border mb-2">
                <Image
                  src={previewUrl}
                  alt="Payment proof preview"
                  fill
                  className="object-contain"
                />
                {uploadedImageUrl && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                id="paymentProof"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading || hasPendingRequest}
                className="cursor-pointer"
              />
              {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a clear screenshot of your transfer confirmation (max 5MB)
            </p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={hasPendingRequest}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !uploadedImageUrl || hasPendingRequest}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : hasPendingRequest ? (
              'Request Already Submitted'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Enrollment Request
              </>
            )}
          </Button>

          {hasPendingRequest && (
            <p className="text-sm text-center text-muted-foreground">
              You already have a pending request for this course
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
