'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

export function CourseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const currentDifficulty = searchParams.get('difficulty') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentTrack = searchParams.get('track') || ''

  const difficulties = ['beginner', 'intermediate', 'advanced']
  const tracks = [
    { value: 'offensive', label: '🔴 Offensive Security', description: 'Ethical Hacking & Penetration Testing' },
    { value: 'defensive', label: '🔵 Defensive Security', description: 'Security Operations & Blue Team' },
  ]
  const categories = [
    'Web Application Security',
    'Network Security',
    'Cryptography',
    'Social Engineering',
    'Reverse Engineering',
    'Forensics',
    'Malware Analysis',
    'Cloud Security',
  ]

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '' || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/courses?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    router.push(`/courses?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/courses')
  }

  const hasActiveFilters = currentDifficulty || currentCategory || currentTrack || search

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>

          {/* Learning Path Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Learning Path</h3>
            <div className="flex flex-wrap gap-2">
              {tracks.map((track) => (
                <Button
                  key={track.value}
                  variant={currentTrack === track.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('track', track.value)}
                  title={track.description}
                >
                  {track.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={currentDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('difficulty', diff)}
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={currentCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('category', cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
