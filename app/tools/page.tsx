import { getToolsByCategory, getToolStatistics } from '@/lib/actions/tools'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const categoryIcons = {
  scanner: '🔍',
  exploitation: '💥',
  reconnaissance: '🔭',
  forensics: '🕵️',
  cryptography: '🔐',
  wireless: '📡',
}

const categoryNames = {
  scanner: 'Web Scanners',
  exploitation: 'Exploitation',
  reconnaissance: 'Reconnaissance',
  forensics: 'Forensics',
  cryptography: 'Cryptography',
  wireless: 'Wireless Security',
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default async function SecurityToolsPage() {
  const { data: toolsByCategory } = await getToolsByCategory()
  const { data: stats } = await getToolStatistics()

  if (!toolsByCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Unable to load security tools</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🛠️ Security Tools Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Essential cybersecurity tools and their documentation
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Beginner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats.byDifficulty.beginner}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Intermediate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.byDifficulty.intermediate}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Advanced</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{stats.byDifficulty.advanced}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tools by Category */}
        <div className="space-y-8">
          {Object.entries(toolsByCategory).map(([category, tools]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </span>
                <div>
                  <h2 className="text-2xl font-bold">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h2>
                  <p className="text-sm text-gray-500">{tools.length} tools</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <Card key={tool.id} className="hover:border-blue-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <Badge className={difficultyColors[tool.difficulty_level]}>
                          {tool.difficulty_level}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <a
                          href={tool.documentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            📚 Documentation →
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Learning Path Section */}
        <Card className="mt-12 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle>🎯 Recommended Learning Path</CardTitle>
            <CardDescription>Master these tools in order for best results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold">Start with Beginner Tools</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nmap, John the Ripper, Netcat, tcpdump
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold">Progress to Intermediate</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Burp Suite, Wireshark, Hashcat, SQLmap
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold">Master Advanced Frameworks</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Metasploit, Volatility, Empire, BeEF
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
