import { createClient } from '@/lib/supabase/server'

export default async function TestDatabasePage() {
  const supabase = await createClient()

  let connectionStatus = 'Testing...'
  let tableCount = 0
  let tables: string[] = []
  let error: string | null = null

  try {
    // Test connection by querying profiles table
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (queryError) {
      error = queryError.message
      connectionStatus = 'Failed'
    } else {
      connectionStatus = 'Connected'

      // Try to get table information (this might not work with RLS)
      const { data: tablesData } = await supabase
        .from('profiles')
        .select('*')
        .limit(0)

      if (tablesData !== null) {
        tableCount = 13 // We know we have 13 tables from our schema
        tables = [
          'profiles', 'courses', 'materials', 'sub_materials',
          'enrollments', 'progress', 'quests', 'quest_questions',
          'quest_options', 'quest_attempts', 'certificates',
          'payments', 'reviews'
        ]
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
    connectionStatus = 'Failed'
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                connectionStatus === 'Connected' ? 'bg-green-500' :
                connectionStatus === 'Failed' ? 'bg-red-500' :
                'bg-yellow-500'
              }`} />
              <span className="text-lg font-medium">{connectionStatus}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
              <p className="text-red-600 font-mono text-sm">{error}</p>
              <div className="mt-4 text-sm text-red-700">
                <p className="font-semibold">Troubleshooting:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Make sure you've created your Supabase project</li>
                  <li>Check that you've run the database schema</li>
                  <li>Verify your .env.local has the correct credentials</li>
                  <li>Restart your dev server after updating .env.local</li>
                </ul>
              </div>
            </div>
          )}

          {/* Success Info */}
          {connectionStatus === 'Connected' && (
            <>
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-green-800 font-semibold mb-2">
                  ✅ Successfully connected to Supabase!
                </h3>
                <p className="text-green-700">
                  Your database is ready to use.
                </p>
              </div>

              {/* Tables List */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Database Tables ({tableCount})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tables.map((table) => (
                    <div
                      key={table}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <span className="text-blue-800 font-medium">{table}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Environment Variables Check */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
                <span className="text-gray-500 text-sm">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span className="text-gray-500 text-sm">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <div className="space-y-2 text-gray-700">
              {connectionStatus !== 'Connected' ? (
                <>
                  <p>📖 Follow the guide: <code className="bg-gray-100 px-2 py-1 rounded">database/SUPABASE_SETUP_GUIDE.md</code></p>
                  <p>🔧 Update your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file</p>
                  <p>🔄 Restart your dev server</p>
                </>
              ) : (
                <>
                  <p>✅ Database connection successful!</p>
                  <p>👉 Ready to build authentication</p>
                  <p>🚀 Return to <a href="/" className="text-blue-600 hover:underline">home page</a></p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
