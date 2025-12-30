'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useEvents } from '@/lib/hooks/queries/useEvents'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'
import { EventCard } from '@/components/events/EventCard'
import { EventType, EventFilters } from '@/types'

export default function EventsPage() {
  const { hasPermission, isSuperAdmin, isChapterAdmin } = usePermissions()
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 12,
  })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: eventsData, isLoading, error } = useEvents(filters)

  const canCreateEvent = hasPermission(Permission.CREATE_EVENT)

  // For testing - allow access to Super Admins and Chapter Admins
  const hasAccess = isSuperAdmin || isChapterAdmin

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Access denied. You need admin privileges to view events.</p>
        </div>
      </div>
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality when API supports it
    console.log('Search:', searchTerm)
  }

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }))
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Failed to load events. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground">
            Manage and view chapter events
          </p>
        </div>

        {canCreateEvent && (
          <Link
            href="/dashboard/events/create"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </form>

          {/* Event Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
            >
              <option value="">All Types</option>
              {Object.values(EventType).map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
              placeholder="Start Date"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : eventsData?.data.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {canCreateEvent 
              ? "Get started by creating your first event."
              : "No events are currently scheduled."
            }
          </p>
          {canCreateEvent && (
            <Link
              href="/dashboard/events/create"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData?.data.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>

          {/* Pagination */}
          {eventsData && eventsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={filters.page === 1}
                className="px-3 py-2 text-sm bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {filters.page || 1} of {eventsData.pagination.totalPages}
              </span>
              
              <button
                onClick={() => handleFilterChange('page', Math.min(eventsData.pagination.totalPages, (filters.page || 1) + 1))}
                disabled={filters.page === eventsData.pagination.totalPages}
                className="px-3 py-2 text-sm bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}