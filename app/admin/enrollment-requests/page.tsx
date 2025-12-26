import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllEnrollmentRequests } from '@/lib/actions/enrollment-requests'
import { EnrollmentRequestsTable } from '@/components/admin/enrollment-requests-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

export default async function EnrollmentRequestsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get enrollment requests
  const pendingResult = await getAllEnrollmentRequests('pending')
  const approvedResult = await getAllEnrollmentRequests('approved')
  const rejectedResult = await getAllEnrollmentRequests('rejected')

  const pendingRequests = pendingResult.success ? pendingResult.data : []
  const approvedRequests = approvedResult.success ? approvedResult.data : []
  const rejectedRequests = rejectedResult.success ? rejectedResult.data : []

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enrollment Requests</h1>
        <p className="text-muted-foreground">
          Review and approve student enrollment payment confirmations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different statuses */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <EnrollmentRequestsTable requests={pendingRequests} status="pending" />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <EnrollmentRequestsTable requests={approvedRequests} status="approved" />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <EnrollmentRequestsTable requests={rejectedRequests} status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
