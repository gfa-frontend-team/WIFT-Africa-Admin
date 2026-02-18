'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useEvents } from '@/lib/hooks/queries/useEvents'
import { EventStatus, EventType } from '@/types'
import { usePermissions } from '@/lib/hooks/usePermissions'

export default function EventsPage() {
  const { isChapterAdmin, userChapterId } = usePermissions()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('')

  const { data, isLoading, error } = useEvents({
    page,
    limit: 10,
    status: statusFilter as EventStatus || undefined,
    type: typeFilter as EventType || undefined,
    chapterId: isChapterAdmin && userChapterId ? userChapterId : undefined, // Filter by chapter for Chapter Admins
  })

  console.log(data,"data")


  // Your filtered events logic
const filteredEvents = data?.events?.filter(event => {
  // If no filters are selected, show all events
  const matchesStatus = !statusFilter || event.status === statusFilter
  const matchesType = !typeFilter || event.type === typeFilter
  
  return matchesStatus && matchesType
}) || []

// Use filteredEvents instead of data.events

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">Manage ongoing and upcoming events</p>
        </div>

        <Link
          href="/dashboard/events/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

    {/* STATUS  */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
          className="px-3 py-1.5 bg-background border border-input rounded-md text-sm"
          >
          <option value="">All Statuses</option>
          {Object.values(EventStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

          {/* TYPE  */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EventType | '')}
          className="px-3 py-1.5 bg-background border border-input rounded-md text-sm"
        >
          <option value="">All Types</option>
          {Object.values(EventType).map((type) => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Data Table Placeholder */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading events...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Error loading events: {(error as Error).message}</div>
        ) : !filteredEvents?.length ? (
          <div className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No events found</p>
            <p className="text-muted-foreground mb-4">Get started by creating your first event.</p>
            {!statusFilter && !typeFilter && (
              <Link
                href="/dashboard/events/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Attendees</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{event.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{event.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {event.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {event.currentAttendees} / {event.capacity || '∞'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination (Basic) */}
      {/* {data && data.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page} of {data.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )} */}
    </div>
  )
}

function StatusBadge({ status }: { status: EventStatus }) {
  const styles = {
    [EventStatus.PUBLISHED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [EventStatus.DRAFT]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [EventStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    [EventStatus.COMPLETED]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}