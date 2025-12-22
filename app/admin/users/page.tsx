import { getUserProfile } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

async function approveUser(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const userId = formData.get('userId') as string

  await supabase
    .from('profiles')
    .update({ is_approved: true })
    .eq('id', userId)

  redirect('/admin/users?success=User approved')
}

async function rejectUser(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const userId = formData.get('userId') as string

  await supabase
    .from('profiles')
    .update({ is_approved: false })
    .eq('id', userId)

  redirect('/admin/users?success=User rejected')
}

async function toggleUserActive(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const userId = formData.get('userId') as string
  const isActive = formData.get('isActive') === 'true'

  await supabase
    .from('profiles')
    .update({ is_active: !isActive })
    .eq('id', userId)

  redirect('/admin/users')
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  // Get all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Count by status
  const pendingCount = users?.filter(u => !u.is_approved).length || 0
  const approvedCount = users?.filter(u => u.is_approved).length || 0
  const totalCount = users?.length || 0

  // Await searchParams
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin - User Management</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {params?.success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            ✅ {params.success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{approvedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user accounts and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Active</th>
                    <th className="pb-3 font-semibold">Joined</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-4">{user.full_name}</td>
                      <td className="py-4">{user.email}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.is_approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {!user.is_approved ? (
                            <form action={approveUser}>
                              <input type="hidden" name="userId" value={user.id} />
                              <Button size="sm" variant="default">
                                Approve
                              </Button>
                            </form>
                          ) : (
                            <form action={rejectUser}>
                              <input type="hidden" name="userId" value={user.id} />
                              <Button size="sm" variant="outline">
                                Revoke
                              </Button>
                            </form>
                          )}

                          <form action={toggleUserActive}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="isActive" value={user.is_active.toString()} />
                            <Button
                              size="sm"
                              variant={user.is_active ? "destructive" : "default"}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!users || users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
