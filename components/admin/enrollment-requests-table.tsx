'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { approveEnrollmentRequest, rejectEnrollmentRequest } from '@/lib/actions/enrollment-requests'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Eye, Loader2, ExternalLink } from 'lucide-react'

interface EnrollmentRequest {
  id: string
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
  created_at: string
  student: any
  course: any
  approver: any
  rejecter: any
}

interface EnrollmentRequestsTableProps {
  requests: EnrollmentRequest[]
  status: 'pending' | 'approved' | 'rejected'
}

export function EnrollmentRequestsTable({ requests, status }: EnrollmentRequestsTableProps) {
  const router = useRouter()
  const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    if (!selectedRequest) return

    setIsProcessing(true)
    try {
      const result = await approveEnrollmentRequest(selectedRequest.id, adminNotes)

      if (result.success) {
        alert('Enrollment request approved! Student has been enrolled.')
        setShowApproveDialog(false)
        setAdminNotes('')
        router.refresh()
      } else {
        alert(result.error || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !adminNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setIsProcessing(true)
    try {
      const result = await rejectEnrollmentRequest(selectedRequest.id, adminNotes)

      if (result.success) {
        alert('Enrollment request rejected.')
        setShowRejectDialog(false)
        setAdminNotes('')
        router.refresh()
      } else {
        alert(result.error || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">
            No {status} enrollment requests
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Course & Student Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {request.course?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Requested by: <span className="font-medium text-foreground">{request.full_name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{request.email}</p>
                    {request.phone_number && (
                      <p className="text-xs text-muted-foreground">
                        Phone: {request.phone_number}
                      </p>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Amount Paid</div>
                      <div className="font-semibold">
                        {request.currency} {request.amount_paid.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Course Price</div>
                      <div className="font-semibold">
                        {request.course?.currency} {request.course?.price?.toFixed(2)}
                      </div>
                    </div>
                    {request.bank_account_used && (
                      <div>
                        <div className="text-muted-foreground">Bank Used</div>
                        <div className="font-medium">{request.bank_account_used}</div>
                      </div>
                    )}
                    {request.payment_date && (
                      <div>
                        <div className="text-muted-foreground">Payment Date</div>
                        <div className="font-medium">
                          {new Date(request.payment_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {request.payment_reference && (
                      <div className="col-span-2">
                        <div className="text-muted-foreground">Reference Number</div>
                        <div className="font-mono text-xs">{request.payment_reference}</div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {request.student_notes && (
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Student Notes:</div>
                      <div className="bg-muted/50 rounded p-2">{request.student_notes}</div>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Admin Notes:</div>
                      <div className="bg-muted/50 rounded p-2">{request.admin_notes}</div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground">
                    Submitted: {new Date(request.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Right: Payment Proof & Actions */}
                <div className="md:w-64 space-y-4">
                  {/* Payment Proof */}
                  {request.payment_proof_url && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Payment Proof:</div>
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                           onClick={() => {
                             setSelectedRequest(request)
                             setShowImageDialog(true)
                           }}>
                        <Image
                          src={request.payment_proof_url}
                          alt="Payment proof"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <a
                        href={request.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in new tab
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {status === 'pending' && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowApproveDialog(true)
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve & Enroll
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowRejectDialog(true)
                        }}
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {status === 'approved' && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  )}

                  {status === 'rejected' && (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>
              {selectedRequest?.full_name} - {selectedRequest?.course?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest?.payment_proof_url && (
            <div className="relative w-full h-96">
              <Image
                src={selectedRequest.payment_proof_url}
                alt="Payment proof"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Enrollment Request</DialogTitle>
            <DialogDescription>
              This will enroll {selectedRequest?.full_name} in {selectedRequest?.course?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Add any notes about this approval..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Enroll
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this enrollment request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-notes">Reason for Rejection *</Label>
              <Textarea
                id="reject-notes"
                placeholder="e.g., Payment amount doesn't match, unclear payment proof, etc."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || !adminNotes.trim()}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
