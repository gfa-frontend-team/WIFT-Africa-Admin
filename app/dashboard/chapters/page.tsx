'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { useAuthStore } from '@/lib/stores'
import { useChapters, useCountries } from '@/lib/hooks/queries/useChapters'
import { Button } from '@/components/ui/Button'
import { ChapterCard } from '@/components/chapters/ChapterCard'
import { RoleGuard } from '@/lib/guards/RoleGuard'
import { Permission } from '@/lib/constants/permissions'
import { getCountryIsoCode } from '@/lib/utils/countryMapping'

export default function ChaptersPage() {
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data: countries = [] } = useCountries()

  const { data, isLoading } = useChapters({
    search: search || undefined,
    country: selectedCountry || undefined,
    isActive: activeFilter,
    page,
    limit: 20,
  })

  console.log(data,"data");
  

  const chapters = data?.data || []
  const pagination = data?.pagination || { page: 1, totalPages: 1 }

  // Search debounce could be added here, but for now we pass state directly

  return (
    <RoleGuard requiredPermission={Permission.VIEW_ALL_CHAPTERS}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Chapters</h1>
            <p className="text-muted-foreground">
              Manage regional chapters across Africa
            </p>
          </div>
          <Link href="/dashboard/chapters/new">
            <Button>
              <Plus className="w-4 h-4" />
              Create Chapter
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chapters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Countries</option>
              {countries.map((country) => {
                const flagCode = getCountryIsoCode('', country)
                const flagEmoji = flagCode === 'AFRICA' ? '🌍' : '🏴'
                return (
                  <option key={country} value={country}>
                    {flagEmoji} {country}
                  </option>
                )
              })}
            </select>

            {/* Status Filter */}
            <select
              value={activeFilter === undefined ? '' : activeFilter ? 'active' : 'inactive'}
              onChange={(e) => {
                if (e.target.value === '') setActiveFilter(undefined)
                else setActiveFilter(e.target.value === 'active')
              }}
              className="px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading chapters...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>

            {/* Empty State */}
            {!chapters.length && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No chapters found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  )
}
